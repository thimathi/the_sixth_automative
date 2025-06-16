import { supabase } from "@/utils/supabase";

interface CurrentSalary {
    annual: number;
    monthly: number;
    hourly: number;
    effectiveDate: string;
}

interface Payslip {
    month: string;
    basicSalary: number;
    allowances: {
        transport: number;
        meal: number;
        medical: number;
        overtime: number;
    };
    deductions: {
        epf: number;
        tax: number;
        insurance: number;
    };
    grossSalary: number;
    netSalary: number;
}

interface SalaryHistory {
    salaryId: string;
    month: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    grossSalary: number;
    netSalary: number;
    status: string;
}

interface YearToDateSummary {
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    averageMonthly: number;
}

export const getCurrentSalary = async (empId: string) => {
    try {
        // Get the most recent salary record
        const { data: salary, error } = await supabase
            .from('salary')
            .select('basicSalary, salaryDate')
            .eq('empId', empId)
            .order('salaryDate', { ascending: false })
            .limit(1)
            .single();

        if (error && !error.message.includes('No rows found')) {
            throw error;
        }

        const basicSalary = salary?.basicSalary || 0;
        const annualSalary = basicSalary * 12;
        const hourlyRate = (basicSalary / 160).toFixed(2); // Assuming 160 working hours per month

        return {
            annual: annualSalary,
            monthly: basicSalary,
            hourly: parseFloat(hourlyRate),
            effectiveDate: salary?.salaryDate || new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        console.error('Error fetching current salary:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch current salary'
        };
    }
};

export const getLatestPayslip = async (empId: string) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        // Get the latest salary record
        const { data: salary, error: salaryError } = await supabase
            .from('salary')
            .select('*')
            .eq('empId', empId)
            .order('salaryDate', { ascending: false })
            .limit(1)
            .single();

        if (salaryError && !salaryError.message.includes('No rows found')) {
            throw salaryError;
        }

        // Get OT for the current month
        const { data: ot, error: otError } = await supabase
            .from('ot')
            .select('amount')
            .eq('empId', empId)
            .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`);

        if (otError) throw otError;

        const totalOT = ot?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

        // Get EPF/ETF for the current month
        const { data: epfEtf, error: epfError } = await supabase
            .from('epfNetf')
            .select('epfCalculation, etfCalculation')
            .eq('empId', empId)
            .gte('appliedDate', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lte('appliedDate', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`)
            .single();

        if (epfError && !epfError.message.includes('No rows found')) {
            throw epfError;
        }

        const basicSalary = salary?.basicSalary || 0;
        const transportAllowance = 200; // These could come from a database table
        const mealAllowance = 150;
        const medicalAllowance = 100;
        const insuranceDeduction = 75;
        const taxDeduction = basicSalary * 0.1; // Simplified tax calculation

        const allowances = {
            transport: transportAllowance,
            meal: mealAllowance,
            medical: medicalAllowance,
            overtime: totalOT
        };

        const deductions = {
            epf: epfEtf?.epfCalculation || basicSalary * 0.08,
            tax: taxDeduction,
            insurance: insuranceDeduction
        };

        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        return {
            month: new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            basicSalary,
            allowances,
            deductions,
            grossSalary,
            netSalary
        };
    } catch (error) {
        console.error('Error fetching latest payslip:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch latest payslip'
        };
    }
};

export const getSalaryHistory = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('salary')
            .select('*')
            .eq('empId', empId)
            .order('salaryDate', { ascending: false })
            .limit(12); // Last 12 months

        if (error) throw error;

        return data?.map(salary => ({
            salaryId: salary.salaryId,
            month: salary.salaryDate ? salary.salaryDate.substring(0, 7) : '',
            basicSalary: salary.basicSalary || 0,
            allowances: salary.otPay || 0,
            deductions: (salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75, // EPF + tax + insurance
            grossSalary: salary.totalSalary || 0,
            netSalary: salary.totalSalary ? salary.totalSalary - ((salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75) : 0,
            status: 'Paid'
        })) || [];
    } catch (error) {
        console.error('Error fetching salary history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch salary history'
        };
    }
};

export const getYearToDateSummary = async (empId: string) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();

        // Get all salary records for the current year
        const { data: salaries, error: salaryError } = await supabase
            .from('salary')
            .select('*')
            .eq('empId', empId)
            .gte('salaryDate', startOfYear)
            .order('salaryDate', { ascending: false });

        if (salaryError) throw salaryError;

        // Get all OT for the current year
        const { data: otRecords, error: otError } = await supabase
            .from('ot')
            .select('amount')
            .eq('empId', empId)
            .gte('created_at', startOfYear);

        if (otError) throw otError;

        const totalOT = otRecords?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

        // Calculate totals
        const totalBasic = salaries?.reduce((sum, salary) => sum + (salary.basicSalary || 0), 0) || 0;
        const totalAllowances = (salaries?.length || 0) * (200 + 150 + 100) + totalOT; // transport + meal + medical + OT
        const totalDeductions = salaries?.reduce((sum, salary) => sum + ((salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75), 0) || 0;
        const totalGross = totalBasic + totalAllowances;
        const totalNet = totalGross - totalDeductions;
        const averageMonthly = salaries?.length ? totalNet / salaries.length : 0;

        return {
            totalGross,
            totalDeductions,
            totalNet,
            averageMonthly
        };
    } catch (error) {
        console.error('Error fetching year-to-date summary:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch year-to-date summary'
        };
    }
};