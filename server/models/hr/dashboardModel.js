import pool from '../../config/database.js';

export const getHRDashboardData = async () => {
    let connection;
    try {
        // Verify database connection
        connection = await pool.getConnection();
        await connection.ping(); // Test the connection

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        console.log('Fetching dashboard data...');

        // 1. Get counts data
        let counts = [{
            totalEmployees: 0,
            newEmployees: 0,
            pendingLeaves: 0,
            trainings: 0,
            openPositions: 0
        }];

        try {
            const [countResults] = await connection.execute(`
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM employee WHERE status = 'Active'), 0) as totalEmployees,
                    COALESCE((SELECT COUNT(*) FROM employee 
                             WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? 
                             AND status = 'Active'), 0) as newEmployees,
                    COALESCE((SELECT COUNT(*) FROM employeeLeave WHERE leaveStatus = 'pending'), 0) as pendingLeaves,
                    COALESCE((SELECT COUNT(*) FROM training 
                             WHERE MONTH(date) = ? AND YEAR(date) = ?), 0) as trainings,
                    COALESCE((SELECT COUNT(*) FROM positions WHERE status = 'open'), 0) as openPositions
            `, [currentMonth, currentYear, currentMonth, currentYear]);

            counts = countResults;
            console.log('Counts fetched successfully:', counts);
        } catch (countError) {
            console.error('Error fetching counts:', countError);
        }

        // 2. Get recent activities
        let activities = [];
        try {
            [activities] = await connection.execute(`
                (
                    SELECT empId as id, 'employee' as type, 'New employee onboarded' as title, 
                        CONCAT(first_name, ' ', last_name, ' - ') as description, 
                        created_at as date
                    FROM employee 
                    WHERE status = 'Active'
                    ORDER BY created_at DESC 
                    LIMIT 3
                )
                UNION ALL
                (
                    SELECT l.leaveId as id, 'leave' as type, 
                        CONCAT('Leave ', l.leaveStatus) as title, 
                        CONCAT(e.first_name, ' ', e.last_name, ' - ', lt.leaveType) as description, 
                        l.leaveFromDate as date
                    FROM employeeLeave l 
                    JOIN leaveType lt ON l.leaveTypeId = lt.leaveTypeId 
                    JOIN employee e ON l.empId = e.empId 
                    ORDER BY l.leaveFromDate DESC 
                    LIMIT 3
                )
                UNION ALL
                (
                    SELECT trainingId as id, 'training' as type, 
                        'Training scheduled' as title, 
                        CONCAT(topic, ' with ', trainer) as description, 
                        date
                    FROM training 
                    ORDER BY date DESC 
                    LIMIT 3
                )
                ORDER BY date DESC 
                LIMIT 5
            `);
            console.log('Activities fetched successfully');
        } catch (activityError) {
            console.error('Error fetching activities:', activityError);
        }

        // 3. Get pending tasks
        let tasks = [];
        try {
            [tasks] = await connection.execute(`
                SELECT 
                    id as id, 
                    title as title, 
                    description as description, 
                    status as status, 
                    due_date as deadline 
                FROM tasks
                WHERE status IN ('urgent', 'in-progress') 
                ORDER BY due_date ASC 
                LIMIT 5
            `);
            console.log('Tasks fetched successfully');
        } catch (taskError) {
            console.error('Error fetching tasks:', taskError);
        }

        // 4. Get department overview
        let departments = [];
        try {
            [departments] = await connection.execute(`
                SELECT 
                    department as name, 
                    COUNT(*) as count 
                FROM employee
                WHERE status = 'Active'
                GROUP BY department
            `);
            console.log('Departments fetched successfully');
        } catch (deptError) {
            console.error('Error fetching departments:', deptError);
        }

        return {
            hrOverview: {
                totalEmployees: parseInt(counts[0]?.totalEmployees) || 0,
                newEmployeesThisMonth: parseInt(counts[0]?.newEmployees) || 0,
                pendingLeaveRequests: parseInt(counts[0]?.pendingLeaves) || 0,
                trainingSessionsThisMonth: parseInt(counts[0]?.trainings) || 0,
                openPositions: parseInt(counts[0]?.openPositions) || 0
            },
            recentActivities: activities || [],
            pendingTasks: tasks || [],
            departmentOverview: departments || []
        };

    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Database operation failed');
    } finally {
        if (connection) {
            try {
                await connection.release();
            } catch (releaseError) {
                console.error('Error releasing connection:', releaseError);
            }
        }
    }
};