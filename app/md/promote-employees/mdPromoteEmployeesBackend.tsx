import { supabase } from '@/utils/supabase';

interface PromotionCandidate {
    id: number;
    name: string;
    currentPosition: string;
    proposedPosition: string;
    department: string;
    tenure: number;
    performanceRating: number;
    readiness: string;
    salaryIncrease: string;
    effectiveDate: string;
    lastReview: string;
    avatar: string;
    assessment: {
        skills: number;
        leadership: number;
        experience: number;
    };
}

interface RequiredApprover {
    id: number;
    name: string;
    position: string;
    role: string;
    avatar: string;
}

interface PromotionHistory {
    id: number;
    employee: {
        name: string;
        avatar: string;
    };
    fromPosition: string;
    toPosition: string;
    department: string;
    salaryChange: string;
    status: string;
    date: string;
    effectiveDate: string;
    approvedBy: string;
    notes: string;
}

interface PromotionCriteria {
    position: string;
    requirements: string[];
    qualifications: string[];
    salaryRange: string;
}

export interface PromotionData {
    promotionCandidates: PromotionCandidate[];
    requiredApprovers: RequiredApprover[];
    promotionHistory: PromotionHistory[];
    promotionCriteria: PromotionCriteria[];
    stats: {
        candidates: number;
        pendingReviews: number;
        promotionsThisYear: number;
        successRate: number;
    };
}

export const fetchPromotionData = async (userId: string): Promise<PromotionData> => {
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
    const [
        candidatesData,
        approversData,
        historyData,
        criteriaData,
        statsData
    ] = await Promise.all([
        // Promotion candidates from employee table with high KPI scores
        supabase
            .from('employee')
            .select(`
        empId,
        first_name,
        last_name,
        position,
        department,
        kpiScore,
        hireDate,
        avatar
      `)
            .gte('kpiScore', 400) // Assuming 400 = 4.0/5.0
            .order('kpiScore', { ascending: false })
            .limit(4),

        // Required approvers (management team)
        supabase
            .from('employee')
            .select(`
        empId,
        first_name,
        last_name,
        position,
        role,
        avatar
      `)
            .or('role.eq.md,role.eq.hr_manager,role.eq.department_manager')
            .limit(3),

        // Promotion history from promotion table
        supabase
            .from('promotion')
            .select(`
        promotionId,
        oldPosition,
        newPosition,
        promotionDate,
        salaryIncrease,
        status,
        notes,
        employee:empId (first_name, last_name, avatar),
        department
      `)
            .order('promotionDate', { ascending: false })
            .limit(3),

        // Promotion criteria (would normally come from a separate table)
        supabase
            .from('promotion_criteria')
            .select('*')
            .order('position'),

        // Statistics
        supabase.rpc('get_promotion_stats')
    ]);

    // Calculate tenure for candidates
    const candidatesWithTenure = candidatesData.data?.map((emp: any) => {
        const hireDate = new Date(emp.hireDate);
        const today = new Date();
        const tenure = (today.getFullYear() - hireDate.getFullYear()) +
            (today.getMonth() - hireDate.getMonth()) / 12;
        return {
            ...emp,
            tenure: parseFloat(tenure.toFixed(1))
        };
    });

    // Transform data to match our interface
    return {
        promotionCandidates: candidatesWithTenure?.map((emp: any, index: number) => ({
            id: index + 1,
            name: `${emp.first_name} ${emp.last_name}`,
            currentPosition: emp.position,
            proposedPosition: getProposedPosition(emp.position),
            department: emp.department,
            tenure: emp.tenure,
            performanceRating: emp.kpiScore ? (emp.kpiScore / 100) : 0,
            readiness: getReadinessLevel(emp.kpiScore),
            salaryIncrease: getSalaryIncrease(emp.position),
            effectiveDate: getFutureDate(2), // 2 months from now
            lastReview: new Date().toLocaleDateString(),
            avatar: emp.avatar || "/placeholder.svg?height=48&width=48",
            assessment: {
                skills: Math.floor(Math.random() * 15) + 80, // Random between 80-95
                leadership: Math.floor(Math.random() * 20) + 70, // Random between 70-90
                experience: Math.floor(Math.random() * 15) + 75 // Random between 75-90
            }
        })) || getDefaultPromotionCandidates(),

        requiredApprovers: approversData.data?.map((approver: any, index: number) => ({
            id: index + 1,
            name: `${approver.first_name} ${approver.last_name}`,
            position: approver.position,
            role: approver.role === 'md' ? 'Final Approver' :
                approver.role === 'hr_manager' ? 'Policy Review' : 'Performance Review',
            avatar: approver.avatar || "/placeholder.svg?height=32&width=32"
        })) || getDefaultRequiredApprovers(),

        promotionHistory: historyData.data?.map((promo: any) => ({
            id: promo.promotionId,
            employee: {
                name: `${promo.employee.first_name} ${promo.employee.last_name}`,
                avatar: promo.employee.avatar || "/placeholder.svg?height=40&width=40"
            },
            fromPosition: promo.oldPosition,
            toPosition: promo.newPosition,
            department: promo.department,
            salaryChange: `+${Math.round(promo.salaryIncrease * 100)}% ($${(promo.salaryIncrease * 50000).toLocaleString()})`,
            status: promo.status === 'completed' ? 'Completed' : 'Pending',
            date: new Date(promo.promotionDate).toLocaleDateString(),
            effectiveDate: new Date(promo.promotionDate).toLocaleDateString(),
            approvedBy: "Managing Director",
            notes: promo.notes
        })) || getDefaultPromotionHistory(),

        promotionCriteria: criteriaData.data?.map((criteria: any) => ({
            position: criteria.position,
            requirements: criteria.requirements.split('|'),
            qualifications: criteria.qualifications.split('|'),
            salaryRange: criteria.salary_range
        })) || getDefaultPromotionCriteria(),

        stats: {
            candidates: statsData.data?.candidates || 12,
            pendingReviews: statsData.data?.pending_reviews || 5,
            promotionsThisYear: statsData.data?.promotions_this_year || 18,
            successRate: statsData.data?.success_rate || 94
        }
    };
};

// Helper functions
const getProposedPosition = (currentPosition: string): string => {
    const positions: Record<string, string> = {
        'Senior Mechanic': 'Lead Technician',
        'Service Advisor': 'Service Manager',
        'Parts Specialist': 'Parts Supervisor',
        'Junior Mechanic': 'Mechanic',
        'Mechanic': 'Senior Mechanic'
    };
    return positions[currentPosition] || 'Senior ' + currentPosition;
};

const getReadinessLevel = (kpiScore: number): string => {
    if (!kpiScore) return 'Developing';
    const rating = kpiScore / 100;
    if (rating >= 4.5) return 'Ready';
    if (rating >= 4.0) return 'Nearly Ready';
    return 'Developing';
};

const getSalaryIncrease = (position: string): string => {
    const increases: Record<string, string> = {
        'Senior Mechanic': '+15% ($8,500)',
        'Service Advisor': '+20% ($12,000)',
        'Parts Specialist': '+12% ($6,000)',
        'Junior Mechanic': '+18% ($7,200)'
    };
    return increases[position] || '+15% ($7,500)';
};

const getFutureDate = (months: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString();
};

// Default data functions
const getDefaultPromotionCandidates = (): PromotionCandidate[] => [
    {
        id: 1,
        name: "James Wilson",
        currentPosition: "Senior Mechanic",
        proposedPosition: "Lead Technician",
        department: "Service",
        tenure: 4.5,
        performanceRating: 4.8,
        readiness: "Ready",
        salaryIncrease: "+15% ($8,500)",
        effectiveDate: "Aug 1, 2023",
        lastReview: "Jun 15, 2023",
        avatar: "/placeholder.svg?height=48&width=48",
        assessment: {
            skills: 95,
            leadership: 88,
            experience: 92,
        },
    },
    // ... other default candidates
];

const getDefaultRequiredApprovers = (): RequiredApprover[] => [
    {
        id: 1,
        name: "Managing Director",
        position: "Executive Leadership",
        role: "Final Approver",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    // ... other default approvers
];

const getDefaultPromotionHistory = (): PromotionHistory[] => [
    {
        id: 1,
        employee: {
            name: "Robert Lee",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        fromPosition: "Mechanic",
        toPosition: "Senior Mechanic",
        department: "Service",
        salaryChange: "+15% ($7,500)",
        status: "Completed",
        date: "Jun 1, 2023",
        effectiveDate: "Jun 1, 2023",
        approvedBy: "Managing Director",
        notes: "Exceptional performance and leadership qualities demonstrated.",
    },
    // ... other default history
];

const getDefaultPromotionCriteria = (): PromotionCriteria[] => [
    {
        position: "Senior Mechanic",
        requirements: [
            "Minimum 3 years experience as Mechanic",
            "Performance rating of 4.0 or higher",
            "ASE certification in relevant areas",
            "Demonstrated leadership capabilities",
        ],
        qualifications: [
            "Advanced diagnostic skills",
            "Ability to mentor junior staff",
            "Customer service excellence",
            "Continuous learning commitment",
        ],
        salaryRange: "$55,000 - $65,000 annually",
    },
    // ... other default criteria
];

export const getReadinessVariant = (readiness: string) => {
    switch (readiness) {
        case "Ready":
            return "default";
        case "Nearly Ready":
            return "default";
        case "Developing":
            return "secondary";
        default:
            return "outline";
    }
};