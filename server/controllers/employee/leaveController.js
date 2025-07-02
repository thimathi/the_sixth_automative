import * as leaveService from '../../services/employee/leaveService.js';

export const getLeaveApplications = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await leaveService.getLeaveApplications(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Leave applications retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getLeaveApplications:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching leave applications'
        });
    }
};

export const submitLeaveApplication = async (req, res) => {
    try {
        const { empId, leaveStatus, leaveFromDate, leaveToDate, leaveReason, duration } = req.body;

        // Validate required fields
        const requiredFields = ['empId', 'leaveStatus', 'leaveFromDate', 'leaveToDate', 'leaveReason', 'duration'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate date format and logic
        const start = new Date(leaveFromDate);
        const end = new Date(leaveToDate);

        if (start > end) {
            return res.status(400).json({
                success: false,
                error: 'End date must be after start date'
            });
        }

        // Process leave application
        const result = await leaveService.submitLeaveApplication(empId, {
            leaveStatus,
            leaveFromDate: start,
            leaveToDate: end,
            leaveReason,
            duration: parseInt(duration)
        });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in submitLeaveApplication:', error);
        const statusCode = error.message.includes('Invalid') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to submit leave application'
        });
    }
};