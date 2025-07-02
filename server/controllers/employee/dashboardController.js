import * as dashboardService from '../../services/employee/dashboardService.js';

export const getDashboardData = async (req, res) => {
    try {
        console.log('Employee Dashboard request received');
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const dashboardData = await dashboardService.getDashboardData(empId);

        res.json({
            success: true,
            data: dashboardData,
            message: 'Dashboard retrieved successfully'
        });
    } catch (error) {
        console.error('Controller error:', error);

        // Determine the status code based on error message
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('required') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message || 'Internal Server Error',
        });
    }
};