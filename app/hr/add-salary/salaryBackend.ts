import { supabase } from "@/utils/supabase";

interface EmployeeSalary {
    salaryId: string;
    empId: string;
    name: string;
    position: string;
    department: string;
    basicSalary: number;
    allowances: number;
    overtimeRate: number;
    totalSalary: number;
    lastUpdated: string;
    salaryGrade: string;
}

interface SalaryGrade {
    grade: string;
    level: string;
    min: number;
    max: number;
    employees: number;
}

interface SalaryHistory {
    historyId: string;
    empId: string;
    name: string;
    changeType: string;
    previousSalary: number;
    currentSalary: number;
    effectiveDate: string;
    status: string;
}

export const getEmployeeSalaries = async (): Promise<EmployeeSalary[]> => {
    try {
        const { data: salaries, error } = await supabase
            .from('salary')
            .select('*, employee:empId(first_name, last_name, position, department)')
            .order('salaryDate', { ascending: false });

        if (error) throw error;

        return salaries?.map(salary => ({
            salaryId: salary.salaryId,
            empId: salary.empId,
            name: `${salary.employee?.first_name || ''} ${salary.employee?.last_name || ''}`.trim(),
            position: salary.employee?.position || '',
            department: salary.employee?.department || '',
            basicSalary: salary.basicSalary || 0,
            allowances: salary.bonusPay || 0,
            overtimeRate: salary.otPay || 0,
            totalSalary: salary.totalSalary || 0,
            lastUpdated: salary.salaryDate || salary.created_at.split('T')[0],
            salaryGrade: salary.salaryGrade || ''
        })) || [];
    } catch (error) {
        console.error('Error fetching employee salaries:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employee salaries');
    }
};

export const getSalaryHistory = async (empId?: string): Promise<SalaryHistory[]> => {
    try {
        let query = supabase
            .from('salaryHistory')
            .select('*, employee:empId(first_name, last_name)')
            .order('effectiveDate', { ascending: false });

        if (empId) {
            query = query.eq('empId', empId);
        }

        const { data: history, error } = await query;

        if (error) throw error;

        return history?.map(item => ({
            historyId: item.historyId,
            empId: item.empId,
            name: `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.trim(),
            changeType: item.changeType || '',
            previousSalary: item.previousSalary || 0,
            currentSalary: item.currentSalary || 0,
            effectiveDate: item.effectiveDate || item.created_at.split('T')[0],
            status: item.status || ''
        })) || [];
    } catch (error) {
        console.error('Error fetching salary history:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch salary history');
    }
};

export const getSalaryGrades = async (): Promise<SalaryGrade[]> => {
    try {
        // In a real app, this would come from a salaryGrades table
        // For now, we'll return static data
        return [
            { grade: "Grade 1", level: "Entry Level", min: 35000, max: 42000, employees: 25 },
            { grade: "Grade 2", level: "Junior", min: 40000, max: 48000, employees: 35 },
            { grade: "Grade 3", level: "Mid-Level", min: 45000, max: 55000, employees: 42 },
            { grade: "Grade 4", level: "Senior", min: 52000, max: 65000, employees: 28 },
            { grade: "Grade 5", level: "Manager", min: 60000, max: 75000, employees: 18 },
            { grade: "Grade 6", level: "Senior Manager", min: 70000, max: 90000, employees: 8 },
        ];
    } catch (error) {
        console.error('Error fetching salary grades:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch salary grades');
    }
};

export const getEmployeesForSelection = async (): Promise<{id: string, name: string, position: string}[]> => {
    try {
        const { data: employees, error } = await supabase
            .from('employee')
            .select('empId, first_name, last_name, position')
            .order('first_name', { ascending: true });

        if (error) throw error;

        return employees?.map(emp => ({
            id: emp.empId,
            name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            position: emp.position || ''
        })) || [];
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employees');
    }
};

export const addOrUpdateSalary = async (
    salaryData: {
        empId: string;
        basicSalary: number;
        allowances: number;
        overtimeRate: number;
        effectiveDate: string;
        salaryGrade: string;
    }
): Promise<void> => {
    try {
        // First calculate total salary
        const totalSalary = salaryData.basicSalary + salaryData.allowances;

        // Create or update the salary record
        const { data: existingSalary, error: findError } = await supabase
            .from('salary')
            .select('*')
            .eq('empId', salaryData.empId)
            .single();

        if (findError && findError.code !== 'PGRST116') { // Ignore "not found" error
            throw findError;
        }

        if (existingSalary) {
            // Update existing salary
            const { error: updateError } = await supabase
                .from('salary')
                .update({
                    basicSalary: salaryData.basicSalary,
                    bonusPay: salaryData.allowances,
                    otPay: salaryData.overtimeRate,
                    totalSalary: totalSalary,
                    salaryDate: salaryData.effectiveDate,
                    salaryGrade: salaryData.salaryGrade,
                    updated_at: new Date().toISOString()
                })
                .eq('empId', salaryData.empId);

            if (updateError) throw updateError;
        } else {
            // Create new salary record
            const { error: insertError } = await supabase
                .from('salary')
                .insert([{
                    empId: salaryData.empId,
                    basicSalary: salaryData.basicSalary,
                    bonusPay: salaryData.allowances,
                    otPay: salaryData.overtimeRate,
                    totalSalary: totalSalary,
                    salaryDate: salaryData.effectiveDate,
                    salaryGrade: salaryData.salaryGrade
                }]);

            if (insertError) throw insertError;
        }

        // Add to salary history
        const { error: historyError } = await supabase
            .from('salaryHistory')
            .insert([{
                empId: salaryData.empId,
                changeType: existingSalary ? 'Salary Adjustment' : 'Initial Salary',
                previousSalary: existingSalary?.totalSalary || 0,
                currentSalary: totalSalary,
                effectiveDate: salaryData.effectiveDate,
                status: 'Approved'
            }]);

        if (historyError) throw historyError;

    } catch (error) {
        console.error('Error adding/updating salary:', error);
        throw error instanceof Error ? error : new Error('Failed to add/update salary');
    }
};

export const getPayrollStats = async (): Promise<{
    totalPayroll: number;
    averageSalary: number;
    pendingReviews: number;
    budgetUtilization: number;
}> => {
    try {
        // In a real app, these would be calculated from the database
        // For now, we'll return mock data
        return {
            totalPayroll: 8200000,
            averageSalary: 52564,
            pendingReviews: 12,
            budgetUtilization: 87
        };
    } catch (error) {
        console.error('Error fetching payroll stats:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch payroll stats');
    }
};