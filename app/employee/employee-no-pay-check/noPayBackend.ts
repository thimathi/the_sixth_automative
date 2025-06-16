import { supabase } from "@/utils/supabase";

interface NoPayRecord {
    noPayId: string;
    startDate: string;
    endDate?: string;
    noPayDays: number;
    deductionAmount: number;
    status: string;
    approvedBy?: string;
    notes?: string;
    reason?: string;
}

interface NoPayStats {
    totalDeductions: number;
    pendingDeductions: number;
    totalIncidents: number;
    lastIncidentDate?: string;
}

interface NoPayPolicy {
    category: string;
    description: string;
    deductionRate: string;
}

export const getNoPayRecords = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('noPay')
            .select('*')
            .eq('empId', empId)
            .order('startDate', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching no-pay records:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch no-pay records'
        };
    }
};

export const getNoPayStats = async (empId: string) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();

        // Get all no-pay records for the current year
        const { data, error } = await supabase
            .from('noPay')
            .select('*')
            .eq('empId', empId)
            .gte('startDate', startOfYear)
            .order('startDate', { ascending: false });

        if (error) throw error;

        // Calculate stats
        const totalDeductions = data
            .filter(record => record.status === "Processed")
            .reduce((sum, record) => sum + (record.deductionAmount || 0), 0);

        const pendingDeductions = data
            .filter(record => record.status === "Under Review")
            .reduce((sum, record) => sum + (record.deductionAmount || 0), 0);

        const lastIncident = data.length > 0 ? data[0].startDate : null;

        return {
            totalDeductions,
            pendingDeductions,
            totalIncidents: data.length,
            lastIncidentDate: lastIncident
        };
    } catch (error) {
        console.error('Error fetching no-pay stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch no-pay stats'
        };
    }
};

export const getNoPayPolicies = async () => {
    // In a real app, these would likely come from a database table
    // For now, we'll return static data as shown in the frontend
    return [
        {
            category: "Unauthorized Absence",
            description: "Full day salary deduction for absence without approval",
            deductionRate: "1 day salary",
        },
        {
            category: "Late Arrival",
            description: "Hourly deduction for late arrival beyond grace period",
            deductionRate: "Hourly rate",
        },
        {
            category: "Extended Breaks",
            description: "Deduction for exceeding authorized break time",
            deductionRate: "Hourly rate",
        },
        {
            category: "Early Departure",
            description: "Deduction for leaving before scheduled time",
            deductionRate: "Hourly rate",
        },
    ];
};