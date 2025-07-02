import * as taskService from '../../services/manager/taskService.js';

export const getActiveTasks = async (req, res) => {
    try{
        const tasks = await taskService.getTasks();
        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch tasks'
        });
    }
};
