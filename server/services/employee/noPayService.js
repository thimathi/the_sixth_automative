import * as noPayModel from '../../models/employee/noPayModel.js';

export const getRecords = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const applications = await noPayModel.getRecords(empId);

        return {
            success: true,
            data: applications || [] // Return empty array if no applications exist
        };
    } catch (error) {
        console.error('Error in getLeaveApplications:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch leave applications'
        };
    }
};

export const getStats = async (empId) => {
    try {
        const stats = await noPayModel.getStats(empId);
        return stats || {
            totalDeductions: 0,
            pendingDeductions: 0,
            totalIncidents: 0,
            lastIncidentDate: null
        };
    } catch (error) {
        console.error('NoPay Service Error - getStats:', error);
        throw new Error(`Failed to get no-pay stats: ${error.message}`);
    }
};

export const getPolicies = async () => {
    try {
        const policies = await noPayModel.getPolicies();
        return policies || [];
    } catch (error) {
        console.error('NoPay Service Error - getPolicies:', error);
        throw new Error(`Failed to get no-pay policies: ${error.message}`);
    }
};