import { supabase } from "@/utils/supabase";

interface OTRecord {
    otId: string;
    date: string;
    startTime: string;
    endTime: string;
    otHours: number;
    rate: number;
    amount: number;
    type: string;
    status: string;
    approvedBy?: string;
}

interface OTStats {
    totalOTHours: number;
    totalOTAmount: number;
    pendingOTHours: number;
    pendingOTAmount: number;
    averageOTRate: number;
    weekdayHours: number;
    weekendHours: number;
    holidayHours: number;
}

interface OTRate {
    type: string;
    rate: string;
    description: string;
}

export const getOTRecords = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('ot')
            .select('*')
            .eq('empId', empId)
            .order('date', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching OT records:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch OT records'
        };
    }
};

export const getOTStats = async (empId: string) => {
    try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();

        // Get all OT records for the current month
        const { data, error } = await supabase
            .from('ot')
            .select('*')
            .eq('empId', empId)
            .gte('date', firstDayOfMonth)
            .order('date', { ascending: false });

        if (error) throw error;

        // Calculate stats
        const approvedRecords = data.filter(record => record.status === "Approved");
        const pendingRecords = data.filter(record => record.status === "Pending");

        const totalOTHours = approvedRecords.reduce((sum, record) => sum + (record.otHours || 0), 0);
        const totalOTAmount = approvedRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        const pendingOTHours = pendingRecords.reduce((sum, record) => sum + (record.otHours || 0), 0);
        const pendingOTAmount = pendingRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        const averageOTRate = totalOTHours > 0 ? totalOTAmount / totalOTHours : 0;

        // Calculate by type
        const weekdayHours = approvedRecords
            .filter(record => record.type === "Weekday")
            .reduce((sum, record) => sum + (record.otHours || 0), 0);
        const weekendHours = approvedRecords
            .filter(record => record.type === "Weekend")
            .reduce((sum, record) => sum + (record.otHours || 0), 0);
        const holidayHours = approvedRecords
            .filter(record => record.type === "Holiday")
            .reduce((sum, record) => sum + (record.otHours || 0), 0);

        return {
            totalOTHours,
            totalOTAmount,
            pendingOTHours,
            pendingOTAmount,
            averageOTRate,
            weekdayHours,
            weekendHours,
            holidayHours
        };
    } catch (error) {
        console.error('Error fetching OT stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch OT stats'
        };
    }
};

export const getOTRates = async () => {
    // In a real app, these would likely come from a database table
    // For now, we'll return static data as shown in the frontend
    return [
        { type: "Weekday OT", rate: "1.5x", description: "Monday to Friday after 8 hours" },
        { type: "Weekend OT", rate: "2.0x", description: "Saturday and Sunday" },
        { type: "Holiday OT", rate: "2.5x", description: "Public holidays" },
        { type: "Night Shift OT", rate: "1.75x", description: "10 PM to 6 AM" },
    ];
};