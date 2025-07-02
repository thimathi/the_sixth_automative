import * as taskModel from '../../models/employee/taskModel.js';

export async function getRecords(empId) {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const applications = await taskModel.getTaskRecords(empId);

        return {
            success: true,
            data: applications || [] // Return empty array if no applications exist
        };
    } catch (error) {
        console.error('Error in getTask:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch task'
        };
    }
}



export const getTaskHistory = async (empId) => {
    try {
        const history = await taskModel.getTaskHistory(empId);
        return history || [];
    } catch (error) {
        console.error('Task Service Error - getTaskHistory:', error);
        throw new Error(`Failed to get task history: ${error.message}`);
    }
};

export const getTaskStats = async (empId) => {
    try {
        const stats = await taskModel.getTaskStats(empId);
        return stats || {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            onTimeCompletion: 0,
            monthlyCompleted: 0
        };
    } catch (error) {
        console.error('Task Service Error - getTaskStats:', error);
        throw new Error(`Failed to get task stats: ${error.message}`);
    }
};