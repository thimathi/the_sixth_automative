import { supabase } from "@/utils/supabase";

// Types for our data
interface HROverview {
    totalEmployees: number;
    newEmployeesThisMonth: number;
    pendingLeaveRequests: number;
    trainingSessionsThisMonth: number;
    openPositions: number;
}

interface RecentActivity {
    id: string;
    type: 'employee' | 'leave' | 'training';
    title: string;
    description: string;
    date: string;
}

interface PendingTask {
    id: string;
    title: string;
    description: string;
    status: 'urgent' | 'in-progress' | 'pending';
}

interface DepartmentOverview {
    name: string;
    count: number;
}

export const getHRDashboardData = async (empId: string) => {
    try {
        // 1. Get current month and year for calculations
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // 2. Fetch all HR data in parallel
        const [
            totalEmployeesData,
            newEmployeesData,
            pendingLeaveRequestsData,
            trainingSessionsData,
            openPositionsData,
            recentEmployeeAdditions,
            recentLeaveActions,
            recentTrainingSchedules,
            pendingTasksData,
            departmentData
        ] = await Promise.all([
            // Total employees count
            supabase
                .from('employee')
                .select('empId', { count: 'exact' }),

            // New employees this month
            supabase
                .from('employee')
                .select('empId', { count: 'exact' })
                .gte('created_at', new Date(currentYear, currentMonth - 1, 1).toISOString()),

            // Pending leave requests
            supabase
                .from('leave')
                .select('leaveId', { count: 'exact' })
                .eq('leaveStatus', 'pending'),

            // Training sessions this month
            supabase
                .from('training')
                .select('trainingId', { count: 'exact' })
                .gte('date', new Date(currentYear, currentMonth - 1, 1).toISOString()),

            // Open positions (assuming we have a positions table)
            supabase
                .from('positions')
                .select('positionId', { count: 'exact' })
                .eq('status', 'open'),

            // Recent employee additions (last 3)
            supabase
                .from('employee')
                .select('empId, first_name, last_name, position, created_at')
                .order('created_at', { ascending: false })
                .limit(3),

            // Recent leave actions (last 3)
            supabase
                .from('leave')
                .select('leaveId, leaveStatus, leaveFromDate, leaveToDate, leaveType(leaveType), employee(first_name, last_name)')
                .order('leaveFromDate', { ascending: false })
                .limit(3),

            // Recent training schedules (last 3)
            supabase
                .from('training')
                .select('trainingId, topic, date, trainer, venue')
                .order('date', { ascending: false })
                .limit(3),

            // Pending tasks
            supabase
                .from('hrTasks')
                .select('taskId, title, description, status, deadline')
                .or('status.eq.urgent,status.eq.in-progress')
                .order('deadline', { ascending: true })
                .limit(5),

            // Department overview
            supabase
                .from('employee')
                .select('department, empId')
                //@ts-ignore
                .groupBy('department')
        ]);

        // 3. Calculate HR overview
        const hrOverview: HROverview = {
            totalEmployees: totalEmployeesData.count || 0,
            newEmployeesThisMonth: newEmployeesData.count || 0,
            pendingLeaveRequests: pendingLeaveRequestsData.count || 0,
            trainingSessionsThisMonth: trainingSessionsData.count || 0,
            openPositions: openPositionsData.count || 0
        };

        // 4. Format recent activities
        const recentActivities: RecentActivity[] = [
            // @ts-ignore
            ...(recentEmployeeAdditions.data?.map(emp => ({
                id: emp.empId,
                type: 'employee',
                title: 'New employee onboarded',
                description: `${emp.first_name} ${emp.last_name} - ${emp.position}`,
                date: emp.created_at
            })) || []),
            // @ts-ignore
            ...(recentLeaveActions.data?.map(leave => ({
                id: leave.leaveId,
                type: 'leave',
                title: `Leave ${leave.leaveStatus}`,
                description: `${leave.employee?.first_name} ${leave.employee?.last_name} - ${leave.leaveType?.leaveType}`,
                date: leave.leaveFromDate
            })) || []),
            // @ts-ignore
            ...(recentTrainingSchedules.data?.map(training => ({
                id: training.trainingId,
                type: 'training',
                title: 'Training scheduled',
                description: `${training.topic} with ${training.trainer}`,
                date: training.date
            })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // 5. Format pending tasks
        // @ts-ignore
        const pendingTasks: PendingTask[] = pendingTasksData.data?.map(task => ({
            id: task.taskId,
            title: task.title,
            description: task.description,
            status: task.status,
            deadline: task.deadline
        })) || [];

        // 6. Format department overview
        const departmentOverview: DepartmentOverview[] = departmentData.data?.map((dept: any) => ({
            name: dept.department,
            count: dept.empId.length
        })) || [];

        return {
            hrOverview,
            recentActivities,
            pendingTasks,
            departmentOverview,
            error: null
        };
    } catch (error) {
        console.error('HR dashboard data error:', error);
        return {
            hrOverview: null,
            recentActivities: null,
            pendingTasks: null,
            departmentOverview: null,
            error: error instanceof Error ? error.message : 'Failed to fetch HR dashboard data'
        };
    }
};

export const getHRDetails = async (empId: string) => {
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
                managedEmployees:employee!managerId(empId)
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
        const employeesManaged = data.managedEmployees?.length || 0;

        return {
            details: {
                ...data,
                fullName: `${data.first_name} ${data.last_name}`,
                attendanceStats: {
                    presentDays,
                    absentDays,
                    totalDays: presentDays + absentDays
                },
                employeesManaged
            },
            error: null
        };
    } catch (error) {
        return {
            details: null,
            error: error instanceof Error ? error.message : 'Failed to fetch HR details'
        };
    }
};