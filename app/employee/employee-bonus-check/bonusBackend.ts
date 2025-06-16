import { supabase } from "@/utils/supabase";

interface Bonus {
    bonusId: string;
    type: string;
    amount: number;
    bonusDate: string;
    status: string;
    reason: string;
}

interface BonusStats {
    totalBonuses: number;
    pendingBonuses: number;
    lastBonusAmount: number;
    lastBonusType: string;
    bonusRate: number;
    averageBonus: number;
}

export const getEmployeeBonuses = async (empId: string) => {
    try {
        const currentYear = new Date().getFullYear();

        const { data, error } = await supabase
            .from('bonus')
            .select('*')
            .eq('empId', empId)
            .gte('bonusDate', `${currentYear}-01-01`)
            .lte('bonusDate', `${currentYear}-12-31`)
            .order('bonusDate', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching employee bonuses:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch employee bonuses'
        };
    }
};

export const getBonusStats = async (empId: string) => {
    try {
        const currentYear = new Date().getFullYear();

        // Get all bonuses for the employee
        const { data: bonuses, error: bonusError } = await supabase
            .from('bonus')
            .select('*')
            .eq('empId', empId)
            .order('bonusDate', { ascending: false });

        if (bonusError) throw bonusError;

        // Get employee salary for bonus rate calculation
        const { data: salaryData, error: salaryError } = await supabase
            .from('salary')
            .select('basicSalary')
            .eq('empId', empId)
            .order('salaryDate', { ascending: false })
            .limit(1)
            .single();

        if (salaryError && salaryError.code !== 'PGRST116') { // Ignore "No rows found" error
            throw salaryError;
        }

        // Calculate stats
        const currentYearBonuses = bonuses?.filter(b =>
            new Date(b.bonusDate).getFullYear() === currentYear
        ) || [];

        const totalBonuses = currentYearBonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
        const pendingBonuses = currentYearBonuses
            .filter(b => b.status !== 'paid')
            .reduce((sum, b) => sum + (b.amount || 0), 0);

        const lastBonus = bonuses?.[0];
        const lastBonusAmount = lastBonus?.amount || 0;
        const lastBonusType = lastBonus?.type || 'None';

        // Calculate bonus rate (bonuses as % of annual salary)
        const annualSalary = (salaryData?.basicSalary || 0) * 12;
        const bonusRate = annualSalary > 0 ?
            (totalBonuses / annualSalary) * 100 : 0;

        // Calculate average bonus (for upcoming bonus estimation)
        const paidBonuses = bonuses?.filter(b => b.status === 'paid') || [];
        const averageBonus = paidBonuses.length > 0 ?
            paidBonuses.reduce((sum, b) => sum + b.amount, 0) / paidBonuses.length : 0;

        return {
            totalBonuses,
            pendingBonuses,
            lastBonusAmount,
            lastBonusType,
            bonusRate,
            averageBonus
        };
    } catch (error) {
        console.error('Error fetching bonus stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch bonus stats'
        };
    }
};