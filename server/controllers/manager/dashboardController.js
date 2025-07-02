import * as dashboardService from '../../services/manager/dashboardService.js';

export const getDashboardData = async (req, res) => {
    try {
        console.log('Manager Dashboard request received');
        const empId = parseInt(req.params.empId);
        const dashboardData = await dashboardService.getManagerDashboardData(empId);

        res.json({
            success: true,
            data: {
                teamOverview: dashboardData.teamOverview,
                recentActivities: dashboardData.recentActivities,
                priorityTasks: dashboardData.priorityTasks,
                performanceMetrics: dashboardData.performanceMetrics,
                managerDetails: dashboardData.managerDetails
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Controller error:', error);

        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};