import { supabase } from "@/utils/supabase";

interface Task {
    taskId: string;
    title: string;
    description: string;
    assignedBy: string;
    assignedDate: string;
    dueDate: string;
    priority: string;
    status: string;
    progress: number;
    estimatedHours: number;
    actualHours: number;
}

interface TaskHistory {
    taskId: string;
    title: string;
    completedDate: string;
    assignedBy: string;
    status: string;
    rating: number;
    feedback: string;
}

interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    onTimeCompletion: number;
    monthlyCompleted: number;
}

export const getCurrentTasks = async (empId: string) => {
    try {
        const { data: tasks, error } = await supabase
            .from('employeeTask')
            .select('*, task:taskId(*)')
            .eq('empId', empId)
            .eq('task.status', 'Active')
            .order('startDate', { ascending: true });

        if (error) throw error;

        return tasks?.map(task => ({
            taskId: task.taskId,
            title: task.task?.title || 'Unnamed Task',
            description: task.task?.description || 'No description',
            assignedBy: task.task?.assignedBy || 'Manager',
            assignedDate: task.startDate,
            dueDate: task.endDate,
            priority: task.task?.priority || 'Medium',
            status: task.task?.status || 'Not Started',
            progress: task.task?.progress || 0,
            estimatedHours: task.task?.estimatedHours || 0,
            actualHours: task.task?.actualHours || 0
        })) || [];
    } catch (error) {
        console.error('Error fetching current tasks:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch current tasks'
        };
    }
};

export const getTaskHistory = async (empId: string) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();

        const { data: tasks, error } = await supabase
            .from('employeeTask')
            .select('*, task:taskId(*)')
            .eq('empId', empId)
            .neq('task.status', 'Active')
            .order('endDate', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Get KPI ratings for completed tasks
        const { data: kpis, error: kpiError } = await supabase
            .from('kpi')
            .select('*')
            .eq('empId', empId);

        if (kpiError) throw kpiError;

        return tasks?.map(task => {
            const taskKpi = kpis?.find(k => k.taskId === task.taskId);
            return {
                taskId: task.taskId,
                title: task.task?.title || 'Unnamed Task',
                completedDate: task.endDate,
                assignedBy: task.task?.assignedBy || 'Manager',
                status: task.task?.status || 'Completed',
                rating: taskKpi?.kpiValue ? taskKpi.kpiValue / 20 : 4, // Convert 0-100 to 0-5 scale
                feedback: taskKpi?.feedback || 'No feedback provided'
            };
        }) || [];
    } catch (error) {
        console.error('Error fetching task history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch task history'
        };
    }
};

export const getTaskStats = async (empId: string) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();

        // Get all tasks for the employee
        const { data: tasks, error: tasksError } = await supabase
            .from('employeeTask')
            .select('*, task:taskId(*)')
            .eq('empId', empId);

        if (tasksError) throw tasksError;

        // Get completed tasks for the current month
        const { data: monthlyTasks, error: monthlyError } = await supabase
            .from('employeeTask')
            .select('*, task:taskId(*)')
            .eq('empId', empId)
            .eq('task.status', 'Completed')
            .gte('endDate', startOfMonth);

        if (monthlyError) throw monthlyError;

        // Calculate stats
        const totalTasks = tasks?.filter(t => t.task?.status !== 'Completed').length || 0;
        const completedTasks = tasks?.filter(t => t.task?.status === 'Completed').length || 0;
        const inProgressTasks = tasks?.filter(t => t.task?.status === 'In Progress').length || 0;
        const overdueTasks = tasks?.filter(t =>
            t.task?.status !== 'Completed' &&
            t.endDate &&
            new Date(t.endDate) < currentDate
        ).length || 0;

        // Calculate on-time completion rate (simplified)
        const completedOnTime = tasks?.filter(t =>
            t.task?.status === 'Completed' &&
            t.endDate &&
            t.task?.dueDate &&
            new Date(t.endDate) <= new Date(t.task.dueDate)
        ).length || 0;

        const onTimeCompletion = completedTasks > 0
            ? Math.round((completedOnTime / completedTasks) * 100)
            : 0;

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            onTimeCompletion,
            monthlyCompleted: monthlyTasks?.length || 0
        };
    } catch (error) {
        console.error('Error fetching task stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch task stats'
        };
    }
};