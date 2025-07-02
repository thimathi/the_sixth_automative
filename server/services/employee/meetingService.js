import * as meetingModel from '../../models/employee/meetingModel.js';

export const getMeetingData = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const meetings = await meetingModel.getMeetingStats(empId);

        if (!meetings || meetings.length === 0) {
            return {
                success: false,
                error: 'No meetings found for this employee'
            };
        }

        return {
            success: true,
            data: meetings
        };
    } catch (error) {
        console.error('Error in getEmployeemeetings:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch employee meetings'
        };
    }
};