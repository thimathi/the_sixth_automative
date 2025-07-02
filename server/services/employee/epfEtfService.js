import * as epfEtfModel from "../../models/employee/epfEtfModel.js";

// In epfEtfService.js
export const getEPFETFDetails = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const epfEtfDetails = await epfEtfModel.getEPFETFDetails(empId);

        return {
            success: true,
            data: epfEtfDetails || [] // Return empty array if null
        };
    } catch (error) {
        console.error('Error in getEPFETFDetails:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch EPF/ETF details'
        };
    }
};

export const getContributionHistory = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const history = await epfEtfModel.getContributionHistory(empId);

        if (!history || history.length === 0) {
            return {
                success: false,
                error: 'No contribution history found for this employee'
            };
        }

        return {
            success: true,
            data: history
        };
    } catch (error) {
        console.error('Error in getContributionHistory:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch contribution history'
        };
    }
};