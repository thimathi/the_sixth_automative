import * as trainingModel from '../../models/hr/trainingModel.js';


export const getTrainingData = async (filters) => {
    return trainingModel.getTrainingData(filters);
};

export const createTrainingSession = async (trainingData) => {
    try {
        return await trainingModel.createTrainingSession(trainingData);
    } catch (error) {
        console.error('Error in employeeService.createDepartment:', error);
        throw error;
    }
};
