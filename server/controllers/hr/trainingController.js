import * as trainingService from '../../services/hr/trainingService.js';

export const getTrainingData = async (req, res) => {
    try {
        const training = await trainingService.getTrainingData(req.query);
        res.json({ success: true, data: training });
    } catch (error) {
        console.error('Error fetching training:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch training'
        });
    }
};

export const createTrainingSession = async (req, res) => {
    try {
        const newTraining = await trainingService.createTrainingSession(req.body);
        res.status(201).json({ success: true, data: newTraining });
    } catch (error) {
        console.error('Error creating training:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create training'
        });
    }
};