import * as dashboardModel from '../../models/employee/dashboardModel.js';

export const getDashboardData = async (empId) => {
    try {
        if (!empId) {
            throw new Error('Employee ID is required');
        }

        console.log(`Fetching dashboard data for employee ${empId}`);

        // Execute all data fetching in parallel for better performance
        const [dashboardData, employeeDetails] = await Promise.all([
            dashboardModel.getEmployeeDashboardData(empId),
            dashboardModel.getEmployeeDetails(empId)
        ]);

        // Validate critical data exists
        if (!dashboardData || !employeeDetails) {
            throw new Error('Required dashboard data not found');
        }

        // Construct response with defaults
        return {
            success: true,
            data: {
                todayStatus: dashboardData.todayStatus || 'Not recorded',
                leaveBalance: dashboardData.leaveBalance || {
                    casual: 0,
                    sick: 0,
                    annual: 0
                },
                pendingTasksCount: dashboardData.pendingTasksCount ?? 0,
                monthlyOT: dashboardData.monthlyOT || {
                    hours: 0,
                    minutes: 0
                },
                recentActivities: dashboardData.recentActivities || [],
                upcomingEvents: dashboardData.upcomingEvents || [],
                employeeDetails: {
                    ...employeeDetails,
                    fullName: `${employeeDetails.first_name || ''} ${employeeDetails.last_name || ''}`.trim() || 'Unknown Employee',
                    attendanceStats: employeeDetails.attendanceStats || {
                        presentDays: 0,
                        absentDays: 0,
                        totalDays: 0
                    },
                    kpi: employeeDetails.kpi || {
                        value: 0,
                        rank: 'Not rated'
                    }
                }
            }
        };
    } catch (error) {
        console.error('Dashboard service error:', {
            error: error.message,
            stack: error.stack,
            empId
        });

        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
};