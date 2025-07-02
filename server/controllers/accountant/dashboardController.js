import * as dashboardService from '../../services/accountant/dashboardService.js';

export const getDashboardData = async (req, res) => {
    try {
        const { empId } = req.query; // Changed from params to query since the URL uses query params
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const data = await dashboardService.getDashboardData(empId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Dashboard controller error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch dashboard data'
        });
    }
};
