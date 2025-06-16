import { supabase } from "@/utils/supabase";

interface CurrentPosition {
    title: string;
    level: string;
    department: string;
    startDate: string;
}

interface PromotionHistory {
    promotionId: string;
    oldPosition: string;
    newPosition: string;
    promotionDate: string;
    salaryIncrease: number;
    reason?: string;
}

interface EligiblePosition {
    title: string;
    level: string;
    department: string;
    requirements: string[];
    estimatedSalaryIncrease: number;
    eligibilityStatus: string;
}

interface PromotionCriteria {
    category: string;
    requirement: string;
    currentStatus: string;
    met: boolean;
}

export const getCurrentPosition = async (empId: string) => {
    try {
        // Get the most recent promotion to determine current position
        const { data: promotion, error: promotionError } = await supabase
            .from('promotion')
            .select('newPosition, promotionDate')
            .eq('empId', empId)
            .order('promotionDate', { ascending: false })
            .limit(1)
            .single();

        if (promotionError && !promotionError.message.includes('No rows found')) {
            throw promotionError;
        }

        // Get employee details for department
        const { data: employee, error: employeeError } = await supabase
            .from('employee')
            .select('department')
            .eq('empId', empId)
            .single();

        if (employeeError) throw employeeError;

        // Determine level based on position (this would normally come from a positions table)
        const level = promotion?.newPosition.includes('Senior') ? 'Level 3' :
            promotion?.newPosition.includes('Technician') ? 'Level 2' : 'Level 1';

        return {
            title: promotion?.newPosition || 'Automotive Technician',
            level,
            department: employee?.department || 'Service Department',
            startDate: promotion?.promotionDate || new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        console.error('Error fetching current position:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch current position'
        };
    }
};

export const getPromotionHistory = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('promotion')
            .select('*')
            .eq('empId', empId)
            .order('promotionDate', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching promotion history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch promotion history'
        };
    }
};

export const getEligiblePositions = async (empId: string) => {
    try {
        // In a real app, this would query a positions table with eligibility rules
        // For now, we'll return static data based on the employee's current position
        const currentPosition = await getCurrentPosition(empId);

        if (currentPosition.error) {
            throw new Error(currentPosition.error);
        }

        // Determine eligible positions based on current level
        if (currentPosition.level === 'Level 3') {
            return [
                {
                    title: "Lead Automotive Technician",
                    level: "Level 4",
                    department: currentPosition.department,
                    requirements: [
                        "3+ years as Senior Technician",
                        "Leadership certification",
                        "ASE Master certification"
                    ],
                    estimatedSalaryIncrease: 6000,
                    eligibilityStatus: "Eligible in 1.3 years"
                },
                {
                    title: "Service Supervisor",
                    level: "Level 5",
                    department: currentPosition.department,
                    requirements: [
                        "5+ years experience",
                        "Management training",
                        "Customer service excellence"
                    ],
                    estimatedSalaryIncrease: 10000,
                    eligibilityStatus: "Eligible in 3.3 years"
                }
            ];
        } else if (currentPosition.level === 'Level 2') {
            return [
                {
                    title: "Senior Automotive Technician",
                    level: "Level 3",
                    department: currentPosition.department,
                    requirements: [
                        "2+ years as Technician",
                        "Advanced certification",
                        "Mentorship experience"
                    ],
                    estimatedSalaryIncrease: 4000,
                    eligibilityStatus: "Eligible in 0.5 years"
                }
            ];
        } else {
            return [
                {
                    title: "Automotive Technician",
                    level: "Level 2",
                    department: currentPosition.department,
                    requirements: [
                        "1+ year experience",
                        "Basic certification",
                        "Good performance record"
                    ],
                    estimatedSalaryIncrease: 3000,
                    eligibilityStatus: "Eligible now"
                }
            ];
        }
    } catch (error) {
        console.error('Error fetching eligible positions:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch eligible positions'
        };
    }
};

export const getPromotionCriteria = async (empId: string) => {
    try {
        // Get employee's KPI score
        const { data: kpi, error: kpiError } = await supabase
            .from('kpi')
            .select('kpiValue')
            .eq('empId', empId)
            .order('calculateDate', { ascending: false })
            .limit(1)
            .single();

        if (kpiError && !kpiError.message.includes('No rows found')) {
            throw kpiError;
        }

        // Get current position and time in position
        const currentPosition = await getCurrentPosition(empId);
        if (currentPosition.error) {
            throw new Error(currentPosition.error);
        }

        const startDate = new Date(currentPosition.startDate);
        const yearsInPosition = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        // Get training completion status
        const { data: training, error: trainingError } = await supabase
            .from('employeeTraining')
            .select('*')
            .eq('empId', empId);

        if (trainingError) throw trainingError;

        // Simplified criteria checks
        return [
            {
                category: "Performance Rating",
                requirement: "Excellent (4.5+)",
                currentStatus: kpi?.kpiValue ? `${(kpi.kpiValue / 20).toFixed(1)}/5.0` : "Not rated",
                met: kpi?.kpiValue ? kpi.kpiValue >= 90 : false
            },
            {
                category: "Years in Position",
                requirement: "Minimum 2 years",
                currentStatus: `${yearsInPosition.toFixed(1)} years`,
                met: yearsInPosition >= 2
            },
            {
                category: "Training Completion",
                requirement: "All required certifications",
                currentStatus: training?.length ? `${Math.min(100, training.length * 25)}% complete` : "0% complete",
                met: training?.length ? training.length >= 4 : false
            },
            {
                category: "Leadership Skills",
                requirement: "Demonstrated leadership",
                currentStatus: "Mentoring 2 junior staff", // This would normally come from actual data
                met: currentPosition.level === 'Level 3' // Simplified check
            }
        ];
    } catch (error) {
        console.error('Error fetching promotion criteria:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch promotion criteria'
        };
    }
};