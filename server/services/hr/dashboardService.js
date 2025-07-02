import * as dashboardModel from '../../models/hr/dashboardModel.js';

export const getHRDashboardData = async () => {
    try {
        console.log('Fetching dashboard data from model...');
        const dashboardData = await dashboardModel.getHRDashboardData();

        if (!dashboardData) {
            throw new Error('No data returned from database');
        }

        return {
            hrOverview: dashboardData.hrOverview || {
                totalEmployees: 0,
                newEmployeesThisMonth: 0,
                pendingLeaveRequests: 0,
                trainingSessionsThisMonth: 0,
                openPositions: 0
            },
            recentActivities: dashboardData.recentActivities || [],
            pendingTasks: dashboardData.pendingTasks || [],
            departmentOverview: dashboardData.departmentOverview || []
        };
    } catch (error) {
        console.error('Service layer error:', error);
        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
};