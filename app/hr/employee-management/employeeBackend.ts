import { supabase } from "@/utils/supabase";

interface Employee {
    empId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    status: string;
    avatarUrl?: string;
}

interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    terminatedEmployees: number;
}

export const getEmployees = async (filters?: {
    department?: string;
    status?: string;
    search?: string;
}): Promise<Employee[]> => {
    try {
        let query = supabase
            .from('employee')
            .select('empId, first_name, last_name, email, phone, position, department, status')
            .order('first_name', { ascending: true });

        if (filters?.department && filters.department !== 'all') {
            query = query.eq('department', filters.department);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.search) {
            query = query.or(
                `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
            );
        }

        const { data: employees, error } = await query;

        if (error) throw error;

        return employees?.map(emp => ({
            empId: emp.empId,
            firstName: emp.first_name || '',
            lastName: emp.last_name || '',
            email: emp.email || '',
            phone: emp.phone ? `+${emp.phone}` : '',
            position: emp.position || '',
            department: emp.department || '',
            status: emp.status || 'Active'
        })) || [];
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employees');
    }
};

export const getEmployeeStats = async (): Promise<EmployeeStats> => {
    try {
        const { data: employees, error } = await supabase
            .from('employee')
            .select('status');

        if (error) throw error;

        const activeEmployees = employees?.filter(e => e.status === 'Active').length || 0;
        const onLeaveEmployees = employees?.filter(e => e.status === 'On Leave').length || 0;
        const terminatedEmployees = employees?.filter(e => e.status === 'Terminated').length || 0;

        return {
            totalEmployees: employees?.length || 0,
            activeEmployees,
            onLeaveEmployees,
            terminatedEmployees
        };
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employee stats');
    }
};

export const updateEmployeeStatus = async (empId: string, status: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('employee')
            .update({ status })
            .eq('empId', empId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating employee status:', error);
        throw error instanceof Error ? error : new Error('Failed to update employee status');
    }
};

export const getDepartments = async (): Promise<string[]> => {
    try {
        const { data: departments, error } = await supabase
            .from('employee')
            .select('department')
            .neq('department', null);

        if (error) throw error;

        // Remove duplicates and return unique departments
        return Array.from(new Set(departments?.map(d => d.department).filter(Boolean))) as string[];
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch departments');
    }
};