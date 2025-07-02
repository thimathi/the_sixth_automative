import * as trainingService from '../../services/employee/trainingService.js';

export const getCurrentTrainings = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await trainingService.getRecords(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'training retrieved successfully'
        });
    } catch (error) {
        console.error('Error in gettraining:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching training'
        });
    }
};

export const getCompletedTrainings = async (req, res) => {
    try {
        const trainings = await trainingService.getCompletedTrainings(req.params.empId);
        res.json({ success: true, data: trainings });
    } catch (error) {
        console.error('Error getting completed trainings:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch completed trainings'
        });
    }
};

export const getUpcomingTrainings = async (req, res) => {
    try {
        const trainings = await trainingService.getUpcomingTrainings(req.params.empId);
        res.json({ success: true, data: trainings });
    } catch (error) {
        console.error('Error getting upcoming trainings:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch upcoming trainings'
        });
    }
};

export const getTrainingStats = async (req, res) => {
    try {
        const stats = await trainingService.getTrainingStats(req.params.empId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting training stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch training stats'
        });
    }
};