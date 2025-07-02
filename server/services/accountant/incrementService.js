import * as incrementModel from '../../models/accountant/incrementModel.js';

export const getEmployees = async (empId) => {
    try {
        return await incrementModel.getEmployees(empId);
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const getIncrementHistory = async (empId) => {
    try {
        if (!empId) {
            return await incrementModel.getAllIncrements();
        }
        return await incrementModel.getIncrementsByEmployee(empId);
    } catch (error) {
        console.error('Error fetching increment history:', error);
        throw error;
    }
};