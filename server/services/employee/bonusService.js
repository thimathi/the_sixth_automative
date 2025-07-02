import * as bonusModel from "../../models/employee/bonusModel.js";

export const getEmployeeBonuses = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const bonuses = await bonusModel.getEmployeeBonuses(empId);

        if (!bonuses || bonuses.length === 0) {
            return {
                success: false,
                error: 'No bonuses found for this employee'
            };
        }

        return {
            success: true,
            data: bonuses
        };
    } catch (error) {
        console.error('Error in getEmployeeBonuses:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch employee bonuses'
        };
    }
};

