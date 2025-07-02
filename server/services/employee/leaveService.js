import * as leaveModel from '../../models/employee/leaveModel.js';

export const getLeaveApplications = async (empId) => {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const applications = await leaveModel.getLeaveApplications(empId);

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

export const submitLeaveApplication = async (empId, applicationData) => {
    try {
        const { leaveStatus, leaveFromDate, leaveToDate, leaveReason, duration } = applicationData;

        // Validate leave days
        if (duration <= 0) {
            throw new Error('Leave duration must be at least 1 day');
        }

        // Submit leave application
        const result = await leaveModel.submitLeaveApplication(empId, {
            leaveStatus, leaveFromDate, leaveToDate, leaveReason, duration
        });

        return {
            success: true,
            message: 'Leave application submitted successfully',
            leaveId: result.leaveId,
            status: result.status
        };
    } catch (error) {
        console.error('Leave Service Error - submitApplication:', error);
        throw new Error(error.message);
    }
};