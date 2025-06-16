import { supabase } from "@/utils/supabase";

interface EPFETFDetails {
    epfNumber: string;
    etfNumber: string;
    epfBalance: number;
    etfBalance: number;
    employeeEpfContribution: number;
    employerEpfContribution: number;
    etfContribution: number;
    totalEpfContribution: number;
    epfProjectedBalance: number;
    etfProjectedBalance: number;
}

interface ContributionHistory {
    appliedDate: string;
    epfCalculation: number;
    etfCalculation: number;
}

export const getEPFETFDetails = async (empId: string) => {
    try {
        // Get employee details including EPF/ETF numbers
        const { data: employee, error: employeeError } = await supabase
            .from('employee')
            .select('empIdNumber, salary:salary!empId(basicSalary)')
            .eq('empId', empId)
            .single();

        if (employeeError) throw employeeError;

        // Get current EPF/ETF balances (this would normally come from external EPF/ETF system)
        // For demo purposes, we'll calculate from contributions
        const { data: contributions, error: contributionsError } = await supabase
            .from('epfNetf')
            .select('epfCalculation, etfCalculation')
            .eq('empId', empId);

        if (contributionsError) throw contributionsError;

        // Calculate balances
        const epfBalance = contributions?.reduce((sum, c) => sum + (c.epfCalculation || 0) * 2, 0) || 0;
        const etfBalance = contributions?.reduce((sum, c) => sum + (c.etfCalculation || 0), 0) || 0;

        // Get latest salary for contribution calculations
        const basicSalary = employee.salary?.[0]?.basicSalary || 0;
        const employeeEpfContribution = basicSalary * 0.08; // 8% employee contribution
        const employerEpfContribution = basicSalary * 0.08; // 8% employer contribution
        const etfContribution = basicSalary * 0.02; // 2% employer ETF contribution

        // Projected balances (simplified calculation)
        const retirementAge = 60;
        const currentAge = 32; // Would normally calculate from DOB
        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;

        const epfProjectedBalance = epfBalance + (employeeEpfContribution + employerEpfContribution) * monthsToRetirement;
        const etfProjectedBalance = etfBalance + etfContribution * monthsToRetirement;

        return {
            epfNumber: `EPF${employee.empIdNumber}`,
            etfNumber: `ETF${employee.empIdNumber}`,
            epfBalance,
            etfBalance,
            employeeEpfContribution,
            employerEpfContribution,
            etfContribution,
            totalEpfContribution: employeeEpfContribution + employerEpfContribution,
            epfProjectedBalance,
            etfProjectedBalance
        };
    } catch (error) {
        console.error('Error fetching EPF/ETF details:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch EPF/ETF details'
        };
    }
};

export const getContributionHistory = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('epfNetf')
            .select('appliedDate, epfCalculation, etfCalculation')
            .eq('empId', empId)
            .order('appliedDate', { ascending: false })
            .limit(12); // Last 12 months

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching contribution history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch contribution history'
        };
    }
};