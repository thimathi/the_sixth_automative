import * as dashboardModel from '../../models/md/dashboardModel.js';

export const getDashboardData = async (empId) => {
    try {
        return await dashboardModel.getDashboardData(empId);
    } catch (error) {
        throw error;
    }
};

export const scheduleMeeting = async (empId, meetingData) => {
    try {
        // Validate required fields
        if (!meetingData.topic || !meetingData.date || !meetingData.type) {
            throw new Error('Missing required meeting fields');
        }

        // Set default values
        const completeMeetingData = {
            ...meetingData,
            empId: empId, // Ensure we use the authorized empId
            status: 'scheduled'
        };

        return await dashboardModel.scheduleMeeting(completeMeetingData);
    } catch (error) {
        console.error('Service error in scheduleMeeting:', error);
        throw error;
    }
};


export const promoteEmployee = async (empId, promotionData) => {
    try {
        // Verify MD role
        const isMD = await dashboardModel.verifyMDRole(empId);
        if (!isMD) {
            throw new Error('Unauthorized: Only MD can promote employees');
        }

        return await dashboardModel.promoteEmployee(promotionData);
    } catch (error) {
        throw error;
    }
};