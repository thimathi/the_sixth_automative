import * as dashboardService from '../../services/hr/dashboardService.js';

export const getHRDashboard = async (req, res) => {
    try {
        console.log('HR Dashboard request received');
        const dashboardData = await dashboardService.getHRDashboardData();

        res.json({
            success: true,
            data: {
                hrOverview: dashboardData.hrOverview,
                recentActivities: dashboardData.recentActivities,
                pendingTasks: dashboardData.pendingTasks,
                departmentOverview: dashboardData.departmentOverview
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