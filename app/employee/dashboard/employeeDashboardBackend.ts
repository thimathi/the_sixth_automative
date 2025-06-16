import { supabase } from "@/utils/supabase";

interface TodayStatus {
    status: string;
    inTime?: string;
    outTime?: string;
}

interface LeaveBalance {
    annualLeave: number;
    sickLeave: number;
    otherLeave: number;
}

interface MonthlyOT {
    totalHours: number;
    totalPay: number;
}

interface RecentActivity {
    id: string;
    type: 'attendance' | 'leave' | 'task';
    title: string;
    description?: string;
    date: string;
    time?: string;
}

interface UpcomingEvent {
    id: string;
    type: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    status: string;
}

export const getEmployeeDashboardData = async (empId: string) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const today = new Date().toISOString().split('T')[0];

        const [
            todayAttendanceData,
            leaveBalanceData,
            pendingTasksData,
            monthlyOTData,
            recentAttendanceData,
            recentLeaveData,
            recentTaskData,
            upcomingEventsData
        ] = await Promise.all([
            supabase
                .from('attendance')
                .select('status, inTime, outTime')
                .eq('empId', empId)
                .eq('date', today)
                .single(),

            supabase
                .from('employee')
                .select('fullDayLeaveBalance, sickLeaveBalance, shortLeaveBalance')
                .eq('empId', empId)
                .single(),

            supabase
                .from('employeeTask')
                .select('taskId', { count: 'exact' })
                .eq('empId', empId)
                .gte('endDate', today)
                .lte('startDate', today),

            supabase
                .from('ot')
                .select('otHours, amount')
                .eq('empId', empId)
                .eq('extract(month from created_at)', currentMonth)
                .eq('extract(year from created_at)', currentYear),

            supabase
                .from('attendance')
                .select('attendanceId, status, date, inTime')
                .eq('empId', empId)
                .order('date', { ascending: false })
                .limit(10),

            supabase
                .from('leave')
                .select('leaveId, leaveStatus, leaveFromDate, leaveToDate, leaveType(leaveType)')
                .eq('empId', empId)
                .order('leaveFromDate', { ascending: false })
                .limit(10),

            supabase
                .from('employeeTask')
                .select('taskId, endDate, task(type, description)')
                .eq('empId', empId)
                .order('endDate', { ascending: false })
                .limit(10),

            supabase
                .from('employeeEvents')
                .select('eventId, type, title, date, time, status')
                .eq('empId', empId)
                .gte('date', today)
                .order('date', { ascending: true })
                .limit(10)
        ]);

        const todayStatus: TodayStatus = {
            status: todayAttendanceData.data?.status || 'absent',
            inTime: todayAttendanceData.data?.inTime,
            outTime: todayAttendanceData.data?.outTime
        };

        const leaveBalance: LeaveBalance = {
            annualLeave: leaveBalanceData.data?.fullDayLeaveBalance || 0,
            sickLeave: leaveBalanceData.data?.sickLeaveBalance || 0,
            otherLeave: leaveBalanceData.data?.shortLeaveBalance || 0
        };

        const monthlyOT: MonthlyOT = {
            totalHours: monthlyOTData.data?.reduce((sum: number, item: any) => sum + (item.otHours || 0), 0) || 0,
            totalPay: monthlyOTData.data?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0
        };

        // @ts-ignore
        const recentActivities: RecentActivity[] = [
            // @ts-ignore
            ...(recentAttendanceData.data?.map(att => ({
                id: att.attendanceId,
                type: 'attendance',
                title: `Attendance marked as ${att.status}`,
                date: att.date,
                time: att.inTime
            })) || []),
            // @ts-ignore
            ...(recentLeaveData.data?.map(leave => ({
                id: leave.leaveId,
                type: 'leave',
                title: `Leave ${leave.leaveStatus}`,
                // @ts-ignore
                description: leave.leaveType?.leaveType,
                date: leave.leaveFromDate
            })) || []),
            // @ts-ignore
            ...(recentTaskData.data?.map(task => ({
                id: task.taskId,
                type: 'task',
                title: 'Task completed',
                // @ts-ignore
                description: task.task?.type,
                date: task.endDate
            })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // @ts-ignore
        const upcomingEvents: UpcomingEvent[] = upcomingEventsData.data?.map(event => ({
            id: event.eventId,
            type: event.type,
            title: event.title,
            date: event.date,
            time: event.time,
            status: event.status
        })) || [];

        return {
            todayStatus,
            leaveBalance,
            pendingTasksCount: pendingTasksData.count || 0,
            monthlyOT,
            recentActivities,
            upcomingEvents,
            error: null
        };
    } catch (error) {
        console.error('Employee dashboard data error:', error);
        return {
            todayStatus: null,
            leaveBalance: null,
            pendingTasksCount: null,
            monthlyOT: null,
            recentActivities: null,
            upcomingEvents: null,
            error: error instanceof Error ? error.message : 'Failed to fetch employee dashboard data'
        };
    }
};

export const getEmployeeDetails = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .select(`
                empId,
                first_name,
                last_name,
                email,
                position,
                department,
                status,
                telNumber,
                attendance:attendance!empId(status, date),
                kpi:kpi!empId(kpiValue, kpiRanking:kpiRanking(kpiRank))
            `)
            .eq('empId', empId)
            .single();

        if (error) throw error;

        // Calculate some stats
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const monthlyAttendance = data.attendance?.filter((att: any) => {
            const attDate = new Date(att.date);
            return attDate.getMonth() + 1 === currentMonth &&
                attDate.getFullYear() === currentYear;
        }) || [];

        const presentDays = monthlyAttendance.filter((att: any) => att.status === 'present').length;
        const absentDays = monthlyAttendance.filter((att: any) => att.status === 'absent').length;

        const latestKpi = data.kpi?.[0]?.kpiValue || 0;
        // @ts-ignore
        const kpiRank = data.kpi?.[0]?.kpiRanking?.kpiRank || 'Not rated';

        return {
            details: {
                ...data,
                fullName: `${data.first_name} ${data.last_name}`,
                attendanceStats: {
                    presentDays,
                    absentDays,
                    totalDays: presentDays + absentDays
                },
                kpi: {
                    value: latestKpi,
                    rank: kpiRank
                }
            },
            error: null
        };
    } catch (error) {
        return {
            details: null,
            error: error instanceof Error ? error.message : 'Failed to fetch employee details'
        };
    }
};