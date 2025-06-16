import { supabase } from "@/utils/supabase";

// Types for our data
interface TeamOverview {
    teamMembers: number;
    activeTasks: number;
    pendingLeaveRequests: number;
    teamPerformance: number;
}

interface RecentAction {
    id: string;
    type: 'task' | 'leave' | 'performance';
    title: string;
    description: string;
    date: string;
}

interface PriorityTask {
    id: string;
    title: string;
    description: string;
    status: 'urgent' | 'in-progress' | 'pending';
    deadline?: string;
}

interface PerformanceMetrics {
    taskCompletionRate: number;
    averagePerformance: number;
    avgResponseTime: number;
}

export const getManagerDashboardData = async (empId: string) => {
    try {
        // 1. Get current month and year for calculations
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // 2. Fetch all manager data in parallel
        const [
            teamMembersData,
            activeTasksData,
            pendingLeaveRequestsData,
            teamPerformanceData,
            recentTaskAssignments,
            recentLeaveApprovals,
            recentPerformanceReviews,
            priorityTasksData,
            performanceMetricsData
        ] = await Promise.all([
            // Team members count
            supabase
                .from('employee')
                .select('empId, position, department')
                .eq('managerId', empId),

            // Active tasks count
            supabase
                .from('employeeTask')
                .select('taskId, endDate, task(type, description, deadline)')
                .gte('endDate', new Date().toISOString())
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Pending leave requests
            supabase
                .from('leave')
                .select('leaveId, leaveStatus, employee(first_name, last_name)')
                .eq('leaveStatus', 'pending')
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Team performance average
            supabase
                .from('kpi')
                .select('kpiValue, employee(first_name, last_name)')
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Recent task assignments (last 3)
            supabase
                .from('employeeTask')
                .select('taskId, startDate, task(type, description), employee(first_name, last_name)')
                .order('startDate', { ascending: false })
                .limit(3)
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Recent leave approvals (last 3)
            supabase
                .from('leave')
                .select('leaveId, leaveStatus, leaveFromDate, leaveToDate, leaveType(leaveType), employee(first_name, last_name)')
                .eq('leaveStatus', 'approved')
                .order('leaveFromDate', { ascending: false })
                .limit(3)
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Recent performance reviews (last 3)
            supabase
                .from('kpi')
                .select('kpiId, kpiValue, calculateDate, employee(first_name, last_name)')
                .order('calculateDate', { ascending: false })
                .limit(3)
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Priority tasks (overdue or due soon)
            supabase
                .from('employeeTask')
                .select('taskId, endDate, task(type, description, deadline), employee(first_name, last_name)')
                .lte('endDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
                .order('endDate', { ascending: true })
                .limit(5)
                .in('empId',
                    //@ts-ignore
                    supabase
                        .from('employee')
                        .select('empId')
                        .eq('managerId', empId)
                ),

            // Performance metrics
            supabase
                .rpc('get_manager_performance_metrics', { manager_id: empId })
        ]);

        // 3. Calculate team overview
        const teamOverview: TeamOverview = {
            teamMembers: teamMembersData.data?.length || 0,
            activeTasks: activeTasksData.data?.length || 0,
            pendingLeaveRequests: pendingLeaveRequestsData.data?.length || 0,
            teamPerformance: teamPerformanceData.data?.length
                ? Math.round(teamPerformanceData.data.reduce((sum: number, item: any) => sum + (item.kpiValue || 0), 0) / teamPerformanceData.data.length)
                : 0
        };

        // 4. Format recent actions
        //@ts-ignore
        const recentActions: RecentAction[] = [
            // @ts-ignore
            ...(recentTaskAssignments.data?.map(task => ({
                id: task.taskId,
                type: 'task',
                title: 'Task assigned',
                // @ts-ignore
                description: `${task.employee?.first_name} ${task.employee?.last_name} - ${task.task?.type}`,
                date: task.startDate
            })) || []),
            // @ts-ignore
            ...(recentLeaveApprovals.data?.map(leave => ({
                id: leave.leaveId,
                type: 'leave',
                title: 'Leave approved',
                //@ts-ignore
                description: `${leave.employee?.first_name} ${leave.employee?.last_name} - ${leave.leaveType?.leaveType}`,
                date: leave.leaveFromDate
            })) || []),
            // @ts-ignore
            ...(recentPerformanceReviews.data?.map(kpi => ({
                id: kpi.kpiId,
                type: 'performance',
                title: 'Performance reviewed',
                //@ts-ignore
                description: `${kpi.employee?.first_name} ${kpi.employee?.last_name} - Score: ${kpi.kpiValue}`,
                date: kpi.calculateDate
            })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // 5. Format priority tasks
        // @ts-ignore
        const priorityTasks: PriorityTask[] = priorityTasksData.data?.map(task => ({
            id: task.taskId,
            // @ts-ignore
            title: task.task?.type || 'Task',
            // @ts-ignore
            description: task.task?.description || 'No description',
            status: new Date(task.endDate) < new Date() ? 'urgent' : 'pending',
            deadline: task.endDate
        })) || [];

        // 6. Performance metrics
        const performanceMetrics: PerformanceMetrics = performanceMetricsData.data || {
            taskCompletionRate: 0,
            averagePerformance: 0,
            avgResponseTime: 0
        };

        return {
            teamOverview,
            recentActions,
            priorityTasks,
            performanceMetrics,
            error: null
        };
    } catch (error) {
        console.error('Manager dashboard data error:', error);
        return {
            teamOverview: null,
            recentActions: null,
            priorityTasks: null,
            performanceMetrics: null,
            error: error instanceof Error ? error.message : 'Failed to fetch manager dashboard data'
        };
    }
};

export const getManagerDetails = async (empId: string) => {
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
                kpi:kpi!empId(kpiValue, kpiRanking:kpiRanking(kpiRank)),
                teamMembers:employee!managerId(empId)
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
        const teamSize = data.teamMembers?.length || 0;

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
                },
                teamSize
            },
            error: null
        };
    } catch (error) {
        return {
            details: null,
            error: error instanceof Error ? error.message : 'Failed to fetch manager details'
        };
    }
};