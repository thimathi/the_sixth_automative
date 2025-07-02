import * as incrementModel from "../../models/employee/incrementModel.js";

export const getIncrementDetails = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const details = await incrementModel.getIncrementDetails(empId);

        return {
            success: true,
            data: details
        };
    } catch (error) {
        console.error('Error in getIncrementDetails:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch increment details'
        };
    }
};

export const getIncrementHistory = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const history = await incrementModel.getIncrementHistory(empId);

        return {
            success: true,
            data: history || [] // Return empty array if no history exists
        };
    } catch (error) {
        console.error('Error in getIncrementHistory:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch increment history'
        };
    }
};