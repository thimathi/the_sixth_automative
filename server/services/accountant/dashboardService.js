import * as dashboardModel from '../../models/accountant/dashboardModel.js';

export const getDashboardData = async (empId) => {
    try {
        // Verify the accountant exists and has proper permissions
        const accountant = await dashboardModel.verifyAccountant(empId);
        if (!accountant) {
            throw new Error('Accountant not found or unauthorized');
        }

        const dashboardData = await dashboardModel.getAccountantDashboardData(empId);
        return dashboardData;
    } catch (error) {
        console.error('Error fetching accountant dashboard data:', error);
        throw error;
    }
};

