import { supabase } from "@/utils/supabase";

interface IncrementDetails {
    currentSalary: number;
    lastIncrement: {
        date: string;
        amount: number;
        percentage: number;
        type: string;
    };
    nextReviewDate: string;
    monthsToNextReview: number;
    reviewProgress: number;
}

interface IncrementHistory {
    id: string;
    date: string;
    previousSalary: number;
    newSalary: number;
    amount: number;
    percentage: number;
    type: string;
    reason: string;
}

export const getIncrementDetails = async (empId: string) => {
    try {
        // Get current salary from salary table
        const { data: salaryData, error: salaryError } = await supabase
            .from('salary')
            .select('basicSalary, salaryDate')
            .eq('empId', empId)
            .order('salaryDate', { ascending: false })
            .limit(1)
            .single();

        if (salaryError) throw salaryError;

        // Get last increment details
        const { data: incrementData, error: incrementError } = await supabase
            .from('increment')
            .select('amount, lastIncrementDate, nextIncrementDate, percenatge')
            .eq('empId', empId)
            .order('lastIncrementDate', { ascending: false })
            .limit(1)
            .single();

        if (incrementError && !incrementError.message.includes('No rows found')) {
            throw incrementError;
        }

        const currentSalary = salaryData?.basicSalary || 0;
        const lastIncrementDate = incrementData?.lastIncrementDate || new Date().toISOString().split('T')[0];
        const nextReviewDate = incrementData?.nextIncrementDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        // Calculate months to next review
        const today = new Date();
        const nextReview = new Date(nextReviewDate);
        const monthsToNextReview = (nextReview.getFullYear() - today.getFullYear()) * 12 + (nextReview.getMonth() - today.getMonth());

        // Calculate review progress (0-100%)
        const lastReview = new Date(lastIncrementDate);
        const totalMonthsInCycle = 12; // Assuming annual reviews
        const monthsSinceLastReview = (today.getFullYear() - lastReview.getFullYear()) * 12 + (today.getMonth() - lastReview.getMonth());
        const reviewProgress = (monthsSinceLastReview / totalMonthsInCycle) * 100;

        return {
            currentSalary,
            lastIncrement: {
                date: lastIncrementDate,
                amount: incrementData?.amount || 0,
                percentage: incrementData?.percenatge || 0,
                type: "Annual" // Default type
            },
            nextReviewDate,
            monthsToNextReview,
            reviewProgress
        };
    } catch (error) {
        console.error('Error fetching increment details:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch increment details'
        };
    }
};

export const getIncrementHistory = async (empId: string) => {
    try {
        // Get increment history from increment table
        const { data, error } = await supabase
            .from('increment')
            .select('incrementId as id, lastIncrementDate as date, amount, percenatge as percentage')
            .eq('empId', empId)
            .order('lastIncrementDate', { ascending: false });

        if (error) throw error;

        // Get salary history to calculate previous and new salaries
        const { data: salaryData, error: salaryError } = await supabase
            .from('salary')
            .select('basicSalary, salaryDate')
            .eq('empId', empId)
            .order('salaryDate', { ascending: true });

        if (salaryError) throw salaryError;

        // Process the data to create a complete history
        const history = data.map((inc, index) => {
            // Find the salary just before this
            //@ts-ignore
            const incrementDate = new Date(inc.date);
            const previousSalaries = salaryData.filter(s => new Date(s.salaryDate) < incrementDate);
            const previousSalary = previousSalaries.length > 0 ?
                previousSalaries[previousSalaries.length - 1].basicSalary :
                //@ts-ignore
                (salaryData[0]?.basicSalary || 0) - inc.amount;

            return {
                //@ts-ignore
                ...inc,
                previousSalary,
                //@ts-ignore
                newSalary: previousSalary + inc.amount,
                type: "Annual", // Default type
                reason: "Performance review" // Default reason
            };
        });

        return history;
    } catch (error) {
        console.error('Error fetching increment history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch increment history'
        };
    }
};