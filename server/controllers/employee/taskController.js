import * as taskService from '../../services/employee/taskService.js';

export const getCurrentTasks = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await taskService.getRecords(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'task retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getTask:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching task'
        });
    }
};

export const getTaskHistory = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const history = await taskService.getTaskHistory(empId);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error in getTaskHistory:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch task history'
        });
    }
};

export const getTaskStats = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const stats = await taskService.getTaskStats(empId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error in getTaskStats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch task stats'
        });
    }
};