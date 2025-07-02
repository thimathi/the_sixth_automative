import * as trainingModel from '../../models/employee/trainingModel.js';

export async function getRecords(empId) {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const applications = await trainingModel.getTrainingRecords(empId);

        return {
            success: true,
            data: applications || [] // Return empty array if no applications exist
        };
    } catch (error) {
        console.error('Error in gettraining:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch training'
        };
    }    
}

export const getCompletedTrainings = async (empId) => {
    try {
        return await trainingModel.getCompletedTrainings(empId);
    } catch (error) {
        console.error('Training Service Error - getCompletedTrainings:', error);
        throw new Error(`Failed to get completed trainings: ${error.message}`);
    }
};

export const getUpcomingTrainings = async (empId) => {
    try {
        return await trainingModel.getUpcomingTrainings(empId);
    } catch (error) {
        console.error('Training Service Error - getUpcomingTrainings:', error);
        throw new Error(`Failed to get upcoming trainings: ${error.message}`);
    }
};

export const getTrainingStats = async (empId) => {
    try {
        return await trainingModel.getTrainingStats(empId);
    } catch (error) {
        console.error('Training Service Error - getTrainingStats:', error);
        throw new Error(`Failed to get training stats: ${error.message}`);
    }
};