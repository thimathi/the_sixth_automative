import { supabase } from '@/utils/supabase';

interface DepartmentPerformance {
    name: string;
    score: number;
    color: string;
}

interface KPI {
    name: string;
    value: string;
    target: string;
    progress: number;
    change: string;
    trend: "up" | "down" | "stable";
}

interface PerformanceMetric {
    name: string;
    value: string;
    percentage: number;
    trend: "up" | "down" | "stable";
    industryAvg: string;
    best: string;
}

interface PerformanceInsight {
    id: number;
    type: "positive" | "warning" | "negative";
    title: string;
    description: string;
    department: string;
    impact: string;
}

interface EmployeePerformance {
    id: number;
    name: string;
    position: string;
    department: string;
    rating: number;
    avatar: string;
    metrics: {
        technical: number;
        customerService: number;
        efficiency: number;
    };
}

interface DepartmentAnalysis {
    name: string;
    employees: number;
    overallRating: number;
    productivity: number;
    qualityScore: number;
    customerSatisfaction: number;
    achievements: string[];
}

interface PerformanceGoal {
    id: number;
    title: string;
    description: string;
    status: "On Track" | "At Risk" | "Behind Schedule";
    progress: number;
    department: string;
    dueDate: string;
    owner: {
        name: string;
        position: string;
        avatar: string;
    };
}

export interface PerformanceData {
    overallPerformance: number;
    topPerformers: number;
    improvementNeeded: number;
    departmentAverage: number;
    departmentPerformance: DepartmentPerformance[];
    kpis: KPI[];
    performanceMetrics: PerformanceMetric[];
    performanceInsights: PerformanceInsight[];
    employeePerformance: EmployeePerformance[];
    departmentAnalysis: DepartmentAnalysis[];
    performanceGoals: PerformanceGoal[];
}

export const fetchPerformanceData = async (userId: string): Promise<PerformanceData> => {
    // Verify user role
    const { data: userData, error: userError } = await supabase
        .from('employee')
        .select('role')
        .eq('empId', userId)
        .single();

    if (userError || !userData || userData.role !== 'md') {
        throw new Error('Unauthorized access');
    }

    // Fetch all necessary data from Supabase
    // @ts-ignore
    const [
        overallData,
        topPerformersData,
        improvementData,
        departmentAvgData,
        departmentsData,
        kpisData,
        metricsData,
        insightsData,
        employeesData,
        goalsData
    ] = await Promise.all([
        // Overall performance from KPI table
        supabase
            .from('kpi')
            .select('kpiValue')
            .order('calculateDate', { ascending: false })
            .limit(1)
            .single(),

        // Top performers count (rating >= 4.5)
        supabase
            .from('employee')
            .select('count', { count: 'exact' })
            .gte('kpiScore', 450) // Assuming kpiScore is out of 500 (450 = 4.5/5.0)
            .single(),

        // Employees needing improvement (rating < 3.0)
        supabase
            .from('employee')
            .select('count', { count: 'exact' })
            .lt('kpiScore', 300) // Assuming kpiScore is out of 500 (300 = 3.0/5.0)
            .single(),

        // Department average performance
        supabase
            .from('employee')
            .select('avg(kpiScore)')
            .single(),

        // Department performance breakdown
        supabase
            .from('employee')
            .select('department, avg(kpiScore) as avg_score, count(*) as employee_count')
            //@ts-ignore
            .group('department'),

        // KPIs from various tables
        supabase
            .rpc('get_performance_kpis')
            .single(),

        // Performance metrics
        supabase
            .rpc('get_performance_metrics')
            .single(),

        // Performance insights
        supabase
            .from('performance_insights')
            .select('*')
            .order('impact', { ascending: false }),

        // Employee performance data
        supabase
            .from('employee')
            .select(`
        empId,
        first_name,
        last_name,
        position,
        department,
        kpiScore,
        avatar
      `)
            .order('kpiScore', { ascending: false })
            .limit(5),

        // Performance goals
        supabase
            .from('task')
            .select(`
        taskId,
        type,
        deadline,
        description,
        status,
        progress,
        department,
        employee:empId (first_name, last_name, position, avatar)
      `)
            .order('deadline', { ascending: true })
    ]);

    // Transform data to match our interface
    return {
        overallPerformance: overallData.data?.kpiValue ? (overallData.data.kpiValue / 100) : 87.5,
        topPerformers: topPerformersData.data?.count || 12,
        improvementNeeded: improvementData.data?.count || 3,
        departmentAverage: departmentAvgData.data?.avg ? (departmentAvgData.data.avg / 100) : 4.2,
        departmentPerformance: departmentsData.data?.map((dept: any) => ({
            name: dept.department,
            score: dept.avg_score ? (dept.avg_score / 100) : 0,
            color: getDepartmentColor(dept.department)
        })) || getDefaultDepartmentPerformance(),
        kpis: kpisData.data || getDefaultKPIs(),
        performanceMetrics: metricsData.data || getDefaultPerformanceMetrics(),
        performanceInsights: insightsData.data?.map((insight: any) => ({
            id: insight.id,
            type: insight.type,
            title: insight.title,
            description: insight.description,
            department: insight.department,
            impact: insight.impact
        })) || getDefaultPerformanceInsights(),
        employeePerformance: employeesData.data?.map((emp: any, index: number) => ({
            id: index + 1,
            name: `${emp.first_name} ${emp.last_name}`,
            position: emp.position,
            department: emp.department,
            rating: emp.kpiScore ? (emp.kpiScore / 100) : 0,
            avatar: emp.avatar || "/placeholder.svg?height=40&width=40",
            metrics: {
                technical: Math.floor(Math.random() * 20) + 80, // Random between 80-100
                customerService: Math.floor(Math.random() * 20) + 80,
                efficiency: Math.floor(Math.random() * 20) + 80
            }
        })) || getDefaultEmployeePerformance(),
        departmentAnalysis: departmentsData.data?.map((dept: any) => ({
            name: dept.department,
            employees: dept.employee_count,
            overallRating: dept.avg_score ? (dept.avg_score / 100) : 0,
            productivity: Math.floor(Math.random() * 20) + 80,
            qualityScore: Math.floor(Math.random() * 20) + 80,
            customerSatisfaction: Math.floor(Math.random() * 20) + 80,
            achievements: getDepartmentAchievements(dept.department)
        })) || getDefaultDepartmentAnalysis(),
        performanceGoals: goalsData.data?.map((goal: any) => ({
            id: goal.taskId,
            title: goal.type,
            description: goal.description,
            status: goal.status === 'completed' ? 'On Track' :
                goal.status === 'in_progress' ? 'At Risk' : 'Behind Schedule',
            progress: goal.progress || 0,
            department: goal.department,
            dueDate: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A',
            owner: {
                name: `${goal.employee?.first_name} ${goal.employee?.last_name}` || 'Unknown',
                position: goal.employee?.position || 'N/A',
                avatar: goal.employee?.avatar || "/placeholder.svg?height=32&width=32"
            }
        })) || getDefaultPerformanceGoals()
    };
};

// Helper functions
const getDepartmentColor = (department: string): string => {
    const colors: Record<string, string> = {
        'Service': 'bg-blue-500',
        'Parts': 'bg-green-500',
        'Sales': 'bg-amber-500',
        'Admin': 'bg-purple-500',
        'Administrative': 'bg-purple-500'
    };
    return colors[department] || 'bg-gray-500';
};

const getDepartmentAchievements = (department: string): string[] => {
    const achievements: Record<string, string[]> = {
        'Service': [
            "Exceeded monthly service targets by 15%",
            "Reduced average service time by 20 minutes",
            "Achieved 95% first-time fix rate",
        ],
        'Parts': [
            "Improved inventory turnover by 12%",
            "Reduced parts shortage incidents by 25%",
            "Implemented new ordering system",
        ],
        'Sales': [
            "Increased upselling by 18%",
            "Improved customer follow-up process",
            "Achieved 89% customer satisfaction",
        ],
        'Admin': [
            "Streamlined documentation processes",
            "Reduced processing time by 30%",
            "Implemented digital workflow system",
        ],
        'Administrative': [
            "Streamlined documentation processes",
            "Reduced processing time by 30%",
            "Implemented digital workflow system",
        ]
    };
    return achievements[department] || ["No achievements recorded"];
};

// Default data functions
const getDefaultDepartmentPerformance = (): DepartmentPerformance[] => [
    { name: "Service", score: 4.3, color: "bg-blue-500" },
    { name: "Parts", score: 4.0, color: "bg-green-500" },
    { name: "Sales", score: 3.8, color: "bg-amber-500" },
    { name: "Admin", score: 4.5, color: "bg-purple-500" }
];

const getDefaultKPIs = (): KPI[] => [
    {
        name: "Customer Satisfaction",
        value: "94.2%",
        target: "90%",
        progress: 105,
        change: "+2.4%",
        trend: "up",
    },
    {
        name: "Service Efficiency",
        value: "87.5%",
        target: "85%",
        progress: 103,
        change: "+5.3%",
        trend: "up",
    },
    {
        name: "Employee Retention",
        value: "92%",
        target: "95%",
        progress: 97,
        change: "-1.2%",
        trend: "down",
    },
    {
        name: "Revenue per Employee",
        value: "$125K",
        target: "$120K",
        progress: 104,
        change: "+8.7%",
        trend: "up",
    }
];

const getDefaultPerformanceMetrics = (): PerformanceMetric[] => [
    {
        name: "First-Time Fix Rate",
        value: "92%",
        percentage: 92,
        trend: "up",
        industryAvg: "87%",
        best: "95%",
    },
    {
        name: "Average Service Time",
        value: "2.4 hrs",
        percentage: 85,
        trend: "up",
        industryAvg: "2.8 hrs",
        best: "2.0 hrs",
    },
    {
        name: "Parts Availability",
        value: "96%",
        percentage: 96,
        trend: "stable",
        industryAvg: "92%",
        best: "98%",
    },
    {
        name: "Customer Wait Time",
        value: "18 min",
        percentage: 78,
        trend: "down",
        industryAvg: "22 min",
        best: "15 min",
    }
];

const getDefaultPerformanceInsights = (): PerformanceInsight[] => [
    {
        id: 1,
        type: "positive",
        title: "Service Department Exceeding Targets",
        description: "The service department has consistently exceeded efficiency targets for the past 3 months, with a 15% improvement in completion times.",
        department: "Service",
        impact: "High",
    },
    {
        id: 2,
        type: "warning",
        title: "Parts Department Inventory Optimization Needed",
        description: "Parts availability has decreased by 3% this quarter. Consider reviewing inventory management processes.",
        department: "Parts",
        impact: "Medium",
    },
    {
        id: 3,
        type: "negative",
        title: "Customer Service Response Time Declining",
        description: "Average response time for customer inquiries has increased by 12% over the last month.",
        department: "Customer Service",
        impact: "High",
    }
];

const getDefaultEmployeePerformance = (): EmployeePerformance[] => [
    {
        id: 1,
        name: "James Wilson",
        position: "Senior Mechanic",
        department: "Service",
        rating: 4.8,
        avatar: "/placeholder.svg?height=40&width=40",
        metrics: {
            technical: 95,
            customerService: 88,
            efficiency: 92,
        },
    },
    {
        id: 2,
        name: "Emily Chen",
        position: "Service Advisor",
        department: "Customer Service",
        rating: 4.6,
        avatar: "/placeholder.svg?height=40&width=40",
        metrics: {
            technical: 82,
            customerService: 96,
            efficiency: 88,
        },
    },
    {
        id: 3,
        name: "Robert Lee",
        position: "Diagnostic Technician",
        department: "Service",
        rating: 4.5,
        avatar: "/placeholder.svg?height=40&width=40",
        metrics: {
            technical: 98,
            customerService: 82,
            efficiency: 90,
        },
    },
    {
        id: 4,
        name: "Sarah Johnson",
        position: "Parts Manager",
        department: "Parts",
        rating: 4.2,
        avatar: "/placeholder.svg?height=40&width=40",
        metrics: {
            technical: 85,
            customerService: 78,
            efficiency: 85,
        },
    },
    {
        id: 5,
        name: "Miguel Rodriguez",
        position: "Parts Specialist",
        department: "Parts",
        rating: 3.9,
        avatar: "/placeholder.svg?height=40&width=40",
        metrics: {
            technical: 80,
            customerService: 75,
            efficiency: 82,
        },
    }
];

const getDefaultDepartmentAnalysis = (): DepartmentAnalysis[] => [
    {
        name: "Service Department",
        employees: 18,
        overallRating: 4.3,
        productivity: 92,
        qualityScore: 95,
        customerSatisfaction: 94,
        achievements: [
            "Exceeded monthly service targets by 15%",
            "Reduced average service time by 20 minutes",
            "Achieved 95% first-time fix rate",
        ],
    },
    {
        name: "Parts Department",
        employees: 8,
        overallRating: 4.0,
        productivity: 85,
        qualityScore: 88,
        customerSatisfaction: 87,
        achievements: [
            "Improved inventory turnover by 12%",
            "Reduced parts shortage incidents by 25%",
            "Implemented new ordering system",
        ],
    },
    {
        name: "Sales Department",
        employees: 6,
        overallRating: 3.8,
        productivity: 78,
        qualityScore: 82,
        customerSatisfaction: 89,
        achievements: [
            "Increased upselling by 18%",
            "Improved customer follow-up process",
            "Achieved 89% customer satisfaction",
        ],
    },
    {
        name: "Administrative",
        employees: 4,
        overallRating: 4.5,
        productivity: 95,
        qualityScore: 92,
        customerSatisfaction: 91,
        achievements: [
            "Streamlined documentation processes",
            "Reduced processing time by 30%",
            "Implemented digital workflow system",
        ],
    }
];

const getDefaultPerformanceGoals = (): PerformanceGoal[] => [
    {
        id: 1,
        title: "Increase Service Department Efficiency by 20%",
        description: "Implement new tools and processes to improve service completion times and quality.",
        status: "On Track",
        progress: 75,
        department: "Service",
        dueDate: "Dec 31, 2023",
        owner: {
            name: "Michael Chen",
            position: "Service Manager",
            avatar: "/placeholder.svg?height=32&width=32",
        },
    },
    {
        id: 2,
        title: "Achieve 95% Customer Satisfaction Rating",
        description: "Improve customer service processes and follow-up procedures.",
        status: "At Risk",
        progress: 60,
        department: "Customer Service",
        dueDate: "Nov 30, 2023",
        owner: {
            name: "Sarah Johnson",
            position: "Customer Service Manager",
            avatar: "/placeholder.svg?height=32&width=32",
        },
    },
    {
        id: 3,
        title: "Reduce Parts Inventory Costs by 15%",
        description: "Optimize inventory management and supplier relationships.",
        status: "Behind Schedule",
        progress: 35,
        department: "Parts",
        dueDate: "Oct 31, 2023",
        owner: {
            name: "David Rodriguez",
            position: "Parts Manager",
            avatar: "/placeholder.svg?height=32&width=32",
        },
    },
    {
        id: 4,
        title: "Implement Employee Development Program",
        description: "Launch comprehensive training and development initiatives.",
        status: "On Track",
        progress: 85,
        department: "HR",
        dueDate: "Sep 30, 2023",
        owner: {
            name: "Lisa Thompson",
            position: "HR Manager",
            avatar: "/placeholder.svg?height=32&width=32",
        },
    }
];

export const getRatingVariant = (rating: number) => {
    if (rating >= 4.5) return "default";
    if (rating >= 3.5) return "default";
    if (rating >= 2.5) return "secondary";
    return "destructive";
};

export const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    return "Needs Improvement";
};