import pool from '../../config/database.js';

export const getManagerDashboardData = async (empId) => {
    let connection;
    try {
        // Verify database connection
        connection = await pool.getConnection();
        await connection.ping();

        console.log('Fetching dashboard data...');

        // 1. Get team overview counts
        let counts = [{
            teamMembers: 0,
            activeTasks: 0,
            pendingLeaveRequests: 0,
            teamPerformance: 0
        }];

        try {
            const [countResults] = await connection.execute(`
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM employee WHERE managerId = ?), 0) as teamMembers,
                    COALESCE((SELECT COUNT(*) FROM employeeTask et 
                              JOIN tasks t ON et.taskId = t.id 
                              WHERE et.empId IN (SELECT empId FROM employee WHERE managerId = ?) 
                              AND et.endDate >= CURDATE()), 0) as activeTasks,
                    COALESCE((SELECT COUNT(*) FROM employeeLeave 
                              WHERE empId IN (SELECT empId FROM employee WHERE managerId = ?) 
                              AND leaveStatus = 'pending'), 0) as pendingLeaveRequests,
                    COALESCE((SELECT AVG(k.kpiValue) FROM kpi k 
                              JOIN employee e ON k.empId = e.empId 
                              WHERE e.managerId = ?), 0) as teamPerformance
            `, [empId, empId, empId, empId]);

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
                    SELECT et.taskId as id, 'task' as type, 'Task assigned' as title, 
                        CONCAT(e.first_name, ' ', e.last_name, ' - ', t.type) as description, 
                        et.startDate as date
                    FROM employeeTask et 
                    JOIN tasks t ON et.taskId = t.id 
                    JOIN employee e ON et.empId = e.empId 
                    WHERE e.managerId = ? 
                    ORDER BY et.startDate DESC 
                    LIMIT 3
                )
                UNION ALL
                (
                    SELECT l.leaveId as id, 'leave' as type, 'Leave approved' as title, 
                        CONCAT(e.first_name, ' ', e.last_name, ' - ', lt.leaveType) as description, 
                        l.leaveFromDate as date
                    FROM employeeLeave l 
                    JOIN leaveType lt ON l.leaveTypeId = lt.leaveTypeId 
                    JOIN employee e ON l.empId = e.empId 
                    WHERE e.managerId = ? AND l.leaveStatus = 'approved' 
                    ORDER BY l.leaveFromDate DESC 
                    LIMIT 3
                )
                UNION ALL
                (
                    SELECT k.kpiId as id, 'performance' as type, 'Performance reviewed' as title, 
                        CONCAT(e.first_name, ' ', e.last_name, ' - Score: ', k.kpiValue) as description, 
                        k.calculateDate as date
                    FROM kpi k 
                    JOIN employee e ON k.empId = e.empId 
                    WHERE e.managerId = ? 
                    ORDER BY k.calculateDate DESC 
                    LIMIT 3
                )
                ORDER BY date DESC 
                LIMIT 5
            `, [empId, empId, empId]);
            console.log('Activities fetched successfully');
        } catch (activityError) {
            console.error('Error fetching activities:', activityError);
        }

        // 3. Get priority tasks
        let tasks = [];
        try {
            [tasks] = await connection.execute(`
                SELECT 
                    et.taskId as id, 
                    t.type as title, 
                    COALESCE(t.description, 'No description') as description, 
                    CASE WHEN et.endDate <= CURDATE() THEN 'urgent' ELSE 'pending' END as status, 
                    et.endDate as deadline 
                FROM employeeTask et 
                JOIN tasks t ON et.taskId = t.id 
                JOIN employee e ON et.empId = e.empId 
                WHERE e.managerId = ? AND et.endDate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
                ORDER BY et.endDate ASC 
                LIMIT 5
            `, [empId]);
            console.log('Tasks fetched successfully');
        } catch (taskError) {
            console.error('Error fetching tasks:', taskError);
        }

        // 4. Get performance metrics
        let metrics = [{
            taskCompletionRate: 0,
            averagePerformance: 0,
            avgResponseTime: 0
        }];

        try {
            const [metricResults] = await connection.execute(`
                SELECT 
                    COALESCE((
                        SELECT COUNT(*) FROM employeeTask et 
                        JOIN tasks t ON et.taskId = t.id 
                        JOIN employee e ON et.empId = e.empId 
                        WHERE e.managerId = ? AND et.endDate <= CURDATE() AND t.status = 'completed'
                    ) / NULLIF((
                        SELECT COUNT(*) FROM employeeTask et 
                        JOIN tasks t ON et.taskId = t.id 
                        JOIN employee e ON et.empId = e.empId 
                        WHERE e.managerId = ?
                    ), 0) * 100, 0) as taskCompletionRate,
                    
                    COALESCE((
                        SELECT AVG(k.kpiValue) FROM kpi k 
                        JOIN employee e ON k.empId = e.empId 
                        WHERE e.managerId = ?
                    ), 0) as averagePerformance,
                    
                    COALESCE((
                        SELECT AVG(r.responseTime) FROM customerResponses r 
                        JOIN employee e ON r.empId = e.empId 
                        WHERE e.managerId = ?
                    ), 0) as avgResponseTime
            `, [empId, empId, empId, empId]);

            metrics = metricResults;
            console.log('Metrics fetched successfully');
        } catch (metricError) {
            console.error('Error fetching metrics:', metricError);
        }

        // 5. Get manager details
        let manager = {
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
        };

        try {
            // Get basic manager info
            const [managerResults] = await connection.execute(`
                SELECT 
                    e.*, 
                    COALESCE(COUNT(t.empId), 0) as teamSize 
                FROM employee e 
                LEFT JOIN employee t ON e.empId = t.managerId 
                WHERE e.empId = ? 
                GROUP BY e.empId
            `, [empId]);

            if (managerResults.length > 0) {
                manager = {
                    ...managerResults[0],
                    fullName: `${managerResults[0].first_name} ${managerResults[0].last_name}`,
                    teamSize: parseInt(managerResults[0]?.teamSize) || 0
                };
            }

            // Get attendance stats
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            const [attendanceResults] = await connection.execute(`
                SELECT status FROM attendance 
                WHERE empId = ? AND MONTH(date) = ? AND YEAR(date) = ?
            `, [empId, currentMonth, currentYear]);

            const presentDays = attendanceResults.filter(a => a.status === 'present').length;
            const absentDays = attendanceResults.filter(a => a.status === 'absent').length;

            manager.attendanceStats = {
                presentDays,
                absentDays,
                totalDays: presentDays + absentDays
            };

            // Get KPI data
            const [kpiResults] = await connection.execute(`
                SELECT 
                    COALESCE(k.kpiValue, 0) as kpiValue, 
                    COALESCE(kr.kpiRank, 'Not rated') as kpiRank 
                FROM kpi k 
                LEFT JOIN kpiRanking kr ON k.kpiRankingId = kr.kpiRankingId 
                WHERE k.empId = ? 
                ORDER BY k.calculateDate DESC 
                LIMIT 1
            `, [empId]);

            if (kpiResults.length > 0) {
                manager.kpi = {
                    value: parseFloat(kpiResults[0]?.kpiValue) || 0,
                    rank: kpiResults[0]?.kpiRank || 'Not rated'
                };
            }

            console.log('Manager details fetched successfully');
        } catch (managerError) {
            console.error('Error fetching manager details:', managerError);
        }

        return {
            teamOverview: {
                teamMembers: parseInt(counts[0]?.teamMembers) || 0,
                activeTasks: parseInt(counts[0]?.activeTasks) || 0,
                pendingLeaveRequests: parseInt(counts[0]?.pendingLeaveRequests) || 0,
                teamPerformance: Math.round(parseFloat(counts[0]?.teamPerformance) || 0)
            },
            recentActivities: activities || [],
            priorityTasks: tasks || [],
            performanceMetrics: {
                taskCompletionRate: parseFloat(metrics[0]?.taskCompletionRate) || 0,
                averagePerformance: parseFloat(metrics[0]?.averagePerformance) || 0,
                avgResponseTime: parseFloat(metrics[0]?.avgResponseTime) || 0
            },
            managerDetails: manager
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