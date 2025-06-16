import { supabase } from "@/utils/supabase";

interface Employee {
    id: string;
    name: string;
    department: string;
    baseSalary: number;
    performance: string;
}

interface BonusHistory {
    id: number;
    employeeId: string;
    name: string;
    type: string;
    amount: number;
    date: string;
    status: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employee')
        .select('empId, first_name, last_name, department, baseSalary, performance')
        .order('first_name', { ascending: true });

    if (error) {
        console.error('Error fetching employees:', error);
        return [];
    }

    // @ts-ignore
    return data.map(emp => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department,
        baseSalary: emp.baseSalary,
        performance: emp.performance
    }));
};

export const fetchBonusHistory = async (): Promise<BonusHistory[]> => {
    const { data, error } = await supabase
        .from('bonus')
        .select('id, employeeId, employee:employee(first_name, last_name), type, amount, date, status')
        .order('date', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching bonus history:', error);
        return [];
    }

    // @ts-ignore

    return data.map(bonus => ({
        id: bonus.id,
        employeeId: bonus.employeeId,
        // @ts-ignore
        name: `${bonus.employee?.first_name} ${bonus.employee?.last_name}`,
        type: bonus.type,
        amount: bonus.amount,
        date: bonus.date,
        status: bonus.status
    }));
};

export const processBonus = async (employeeId: string, type: string, amount: number): Promise<boolean> => {
    const { error } = await supabase
        .from('bonus')
        .insert([
            {
                employeeId,
                type,
                amount,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0]
            }
        ]);

    if (error) {
        console.error('Error processing bonus:', error);
        return false;
    }

    return true;
};

export const calculateBonusAmount = (baseSalary: number, performance: string, type: string): number => {
    switch (type) {
        case "performance":
            return performance === "Excellent"
                ? baseSalary * 0.1
                : performance === "Good"
                    ? baseSalary * 0.07
                    : baseSalary * 0.05;
        case "festival":
            return baseSalary * 0.08;
        case "annual":
            return baseSalary * 0.15;
        default:
            return 0;
    }
};