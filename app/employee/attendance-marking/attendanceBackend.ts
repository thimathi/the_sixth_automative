import { supabase } from "@/utils/supabase";

interface AttendanceRecord {
    attendanceId?: string;
    date: string;
    inTime?: string;
    outTime?: string;
    status?: string;
}

interface WeeklyAttendance {
    date: string;
    status: string;
    inTime?: string;
    outTime?: string;
}

interface MonthlyStats {
    daysPresent: number;
    workingDays: number;
    totalHours: number;
    overtimeHours: number;
    attendanceRate: number;
}

export const markAttendance = async (empId: string, action: 'check-in' | 'check-out') => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        const { data: existingRecord, error: fetchError } = await supabase
            .from('attendance')
            .select('*')
            .eq('empId', empId)
            .eq('date', today)
            .single();

        let result;

        if (action === 'check-in') {
            if (existingRecord) {
                throw new Error('You have already checked in today');
            }

            const { data, error } = await supabase
                .from('attendance')
                .insert([
                    {
                        empId,
                        date: today,
                        inTime: now,
                        status: 'present'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            if (!existingRecord) {
                throw new Error('You need to check in first');
            }
            if (existingRecord.outTime) {
                throw new Error('You have already checked out today');
            }

            const { data, error } = await supabase
                .from('attendance')
                .update({
                    outTime: now,
                    status: 'present'
                })
                .eq('attendanceId', existingRecord.attendanceId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return result;
    } catch (error) {
        console.error('Error marking attendance:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to mark attendance'
        };
    }
};

export const getTodayAttendance = async (empId: string) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('empId', empId)
            .eq('date', today)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
            throw error;
        }

        return data || { date: today, status: 'absent' };
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch today attendance'
        };
    }
};

export const getWeeklyAttendance = async (empId: string) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        // Get attendance records for the week
        const { data: attendanceRecords, error: attendanceError } = await supabase
            .from('attendance')
            .select('date, inTime, outTime, status')
            .eq('empId', empId)
            .gte('date', startOfWeek.toISOString().split('T')[0])
            .lte('date', endOfWeek.toISOString().split('T')[0]);

        if (attendanceError) throw attendanceError;

        const weekDays: WeeklyAttendance[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const attendance = attendanceRecords?.find(r => r.date === dateStr);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            weekDays.push({
                date: dateStr,
                status: isWeekend ? 'weekend' : (attendance?.status || 'absent'),
                inTime: attendance?.inTime,
                outTime: attendance?.outTime
            });
        }

        return weekDays;
    } catch (error) {
        console.error('Error fetching weekly attendance:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch weekly attendance'
        };
    }
};

export const getMonthlyStats = async (empId: string) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const { data: attendanceRecords, error: attendanceError } = await supabase
            .from('attendance')
            .select('date, inTime, outTime, status')
            .eq('empId', empId)
            .gte('date', firstDayOfMonth.toISOString().split('T')[0])
            .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

        if (attendanceError) throw attendanceError;

        let workingDays = 0;
        let presentDays = 0;
        let totalHours = 0;
        let overtimeHours = 0;

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(now.getFullYear(), now.getMonth(), day);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Not Sunday or Saturday
                workingDays++;
            }
        }

        attendanceRecords?.forEach(record => {
            if (record.status === 'present') {
                presentDays++;

                if (record.inTime && record.outTime) {
                    const inTime = new Date(record.inTime);
                    const outTime = new Date(record.outTime);
                    const hoursWorked = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

                    totalHours += Math.min(8, hoursWorked); // Standard 8 hours
                    overtimeHours += Math.max(0, hoursWorked - 8); // Anything over 8 is OT
                }
            }
        });

        const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

        return {
            daysPresent: presentDays,
            workingDays,
            totalHours: Math.round(totalHours),
            overtimeHours: Math.round(overtimeHours),
            attendanceRate
        };
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch monthly stats'
        };
    }
};