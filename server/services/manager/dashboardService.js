import * as dashboardModel from '../../models/manager/dashboardModel.js';

export const getManagerDashboardData = async (empId) => {
    try {
        console.log('Fetching dashboard data from model...');
        const dashboardData = await dashboardModel.getManagerDashboardData(empId);

        if (!dashboardData) {
            throw new Error('No data returned from database');
        }

        return {
            teamOverview: dashboardData.teamOverview || {
                teamMembers: 0,
                activeTasks: 0,
                pendingLeaveRequests: 0,
                teamPerformance: 0
            },
            recentActivities: dashboardData.recentActivities || [],
            priorityTasks: dashboardData.priorityTasks || [],
            performanceMetrics: dashboardData.performanceMetrics || {
                taskCompletionRate: 0,
                averagePerformance: 0,
                avgResponseTime: 0
            },
            managerDetails: dashboardData.managerDetails || {
                empId,
                fullName: 'New Manager',
                position: 'Manager',
                department: 'Management',
                attendanceStats: {
                    presentDays: 0,
                    absentDays: 0,
                    totalDays: 0
                },
                kpi: {
                    value: 0,
                    rank: 'Not rated'
                },
                teamSize: 0
            }
        };
    } catch (error) {
        console.error('Service layer error:', error);
        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
};