import { supabase } from "@/utils/supabase";

// Types for our data
interface RevenueData {
    total: number;
    change: number;
}

interface PerformanceData {
    score: number;
}

interface SatisfactionData {
    avg_satisfaction: number;
}

interface GoalsData {
    achieved: number;
    total: number;
}

interface DepartmentData {
    name: string;
    performance: number;
    metric: string;
    value: number;
}

interface MeetingData {
    topic: string;
    date: string;
    type: string;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: string;
}

export const getMDNavigation = (): NavigationItem[] => [
    { name: "Dashboard", href: "/md/dashboard", icon: "Building" },
    { name: "Meeting Management", href: "/md/meeting-management", icon: "Calendar" },
    { name: "Performance Management", href: "/md/performance-management", icon: "TrendingUp" },
    { name: "Promote Employees", href: "/md/promote-employees", icon: "Award" }
];

export const fetchMDDashboardData = async (empId: string) => {
    try {
        // Verify MD role
        const { data: roleData, error: roleError } = await supabase
            .from('employee')
            .select('role')
            .eq('empId', empId)
            .single();

        if (roleError || !roleData || roleData.role !== 'md') {
            throw new Error('Unauthorized access');
        }

        // Fetch all data in parallel
        const [
            revenueData,
            performanceData,
            satisfactionData,
            goalsData,
            departmentsData,
            meetingsData
        ] = await Promise.all([
            supabase.rpc('get_company_revenue').single(),
            supabase.rpc('get_company_performance').single(),
            supabase.from('employee').select('avg(satisfaction_score)').single(),
            supabase.from('strategic_goals').select('count(*), sum(achieved)').eq('year', new Date().getFullYear()).single(),
            supabase.rpc('get_department_metrics'),
            supabase.from('meeting').select('topic, date, type').order('date', { ascending: true }).limit(3)
        ]);

        // Check for errors
        const errors = [
            revenueData.error,
            performanceData.error,
            satisfactionData.error,
            goalsData.error,
            departmentsData.error,
            meetingsData.error
        ].filter(Boolean);

        if (errors.length > 0) {
            console.error('Dashboard data errors:', errors);
            throw new Error('Failed to fetch some dashboard metrics');
        }

        return {
            revenue: {
                //@ts-ignore
                total: revenueData.data?.total || 0,
                //@ts-ignore
                change: revenueData.data?.change || 0
            },
            performance: {
                //@ts-ignore
                score: performanceData.data?.score || 0
            },
            satisfaction: {
                avg_satisfaction: satisfactionData.data?.avg || 0
            },
            goals: {
                //@ts-ignore
                achieved: goalsData.data?.sum || 0,
                //@ts-ignore
                total: goalsData.data?.count || 0
            },
            departments: departmentsData.data || [],
            meetings: meetingsData.data || [],
            error: null
        };
    } catch (error) {
        console.error('MD dashboard data error:', error);
        return {
            revenue: null,
            performance: null,
            satisfaction: null,
            goals: null,
            departments: null,
            meetings: null,
            error: error instanceof Error ? error.message : 'Failed to fetch MD dashboard data'
        };
    }
};