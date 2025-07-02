import * as meetingService from '../../services/employee/meetingService.js';

export const getMeetingData = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await meetingService.getMeetingData(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Meeting retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getEmployeeMeeting:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching meeting'
        });
    }
};