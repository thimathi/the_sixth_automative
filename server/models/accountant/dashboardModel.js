import pool from '../../config/database.js';

export const getAccountantDashboardData = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Verify accountant exists and get basic info
        const [accountant] = await connection.query(`
            SELECT empId, first_name, last_name, email, department 
            FROM employee 
            WHERE empId = ? AND role = 'Accountant' || 'accountant' || 'ACCOUNTANT'
        `, [empId]);

        if (!accountant.length) {
            throw new Error('Accountant not found');
        }

        // 2. Financial Overview
        const [financialOverview] = await connection.query(`
    SELECT 
        (SELECT COUNT(*) FROM increment WHERE approval = 'Pending') as pendingIncrements,
        (SELECT COUNT(*) FROM loanRequest WHERE status = 'Pending') as pendingLoanRequests,
        (SELECT SUM(amount) FROM bonus WHERE YEAR(bonusDate) = YEAR(CURDATE())) as totalBonuses,
        (SELECT SUM(amount) FROM increment WHERE approval = 'Approved' AND YEAR(lastIncrementDate) = YEAR(CURDATE())) as totalIncrements,
        (SELECT SUM(totalSalary) FROM salary WHERE YEAR(salaryDate) = YEAR(CURDATE())) as totalSalaries
`);


        // 3. Pending Tasks
        const [pendingTasks] = await connection.query(`
            SELECT 
                'increment' as type,
                COUNT(*) as count
            FROM increment 
            WHERE approval = 'Pending'
            UNION ALL
            SELECT 
                'loan' as type,
                COUNT(*) as count
            FROM loanRequest 
            WHERE status = 'Pending'
            UNION ALL
            SELECT 
                'salary' as type,
                COUNT(*) as count
            FROM salary 
            WHERE processed_by IS NULL
        `);

        const formattedPendingTasks = pendingTasks.map(task => ({
            ...task,
            label: task.type === 'increment' ? 'Pending Increments' :
                task.type === 'loan' ? 'Pending Loans' : 'Pending Salaries'
        }));

        // 4. Recent Transactions (from accountant_operations)
        const [recentTransactions] = await connection.query(`
            SELECT 
                operation as type,
                record_id as id,
                operation_time as date,
                details
            FROM accountant_operations
            WHERE accountant_id = ?
            ORDER BY operation_time DESC
            LIMIT 5
        `, [empId]);

        // 5. Quick Actions (static for now)
        const quickActions = [
            { id: 1, name: 'Process Bonus', icon: 'gift', link: '/accountant/bonus' },
            { id: 2, name: 'Review Increments', icon: 'trend-up', link: '/accountant/increments' },
            { id: 3, name: 'Manage Loans', icon: 'handshake', link: '/accountant/loans' },
            { id: 4, name: 'Process Salaries', icon: 'dollar-sign', link: '/accountant/salaries' }
        ];

        // 6. Recent Accountant Operations
        const [recentOperations] = await connection.query(`
            SELECT operation, operation_time, details 
            FROM accountant_operations 
            WHERE accountant_id = ?
            ORDER BY operation_time DESC
            LIMIT 3
        `, [empId]);

        return {
            accountantInfo: accountant[0],
            financialOverview: financialOverview[0],
            pendingTasks: formattedPendingTasks,
            recentTransactions,
            quickActions,
            recentOperations,
            pendingIncrementsCount: financialOverview[0].pendingIncrements,
            pendingLoanRequestsCount: financialOverview[0].pendingLoanRequests,
            pendingSalariesCount: pendingTasks.find(t => t.type === 'salary')?.count || 0
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const verifyAccountant = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [accountant] = await connection.query(`
            SELECT empId FROM employee 
            WHERE empId = ? AND role = 'Accountant'
        `, [empId]);
        return accountant.length > 0;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
