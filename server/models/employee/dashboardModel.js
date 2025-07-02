import pool from '../../config/database.js';

const executeQuery = async (connection, query, params, queryName) => {
    try {
        const [results] = await connection.query(query, params); // Changed from execute() to query()
        console.log(`${queryName} executed successfully`);
        return results;
    } catch (error) {
        console.error(`Error in ${queryName}:`, {
            query,
            params,
            error: error.message
        });
        throw error;
    }
};

export const getEmployeeDashboardData = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Database connection established for dashboard data');

        // Execute all queries in parallel
        const [
            todayStatus,
            leaveBalance,
            pendingTasksCount,
            recentActivities,
            upcomingEvents
        ] = await Promise.all([
            getTodayStatus(connection, empId),
            getLeaveBalance(connection, empId),
            getPendingTasksCount(connection, empId),
            getRecentActivities(connection, empId),
            getUpcomingEvents(connection)
        ]);

        return {
            todayStatus,
            leaveBalance,
            pendingTasksCount,
            recentActivities,
            upcomingEvents
        };

    } catch (error) {
        console.error('Dashboard model error:', {
            error: error.message,
            stack: error.stack,
            empId
        });
        throw new Error(`Dashboard data retrieval failed: ${error.message}`);
    } finally {
        if (connection) {
            try {
                await connection.release();
                console.log('Dashboard connection released');
            } catch (releaseError) {
                console.error('Connection release error:', releaseError);
            }
        }
    }
};

// Helper functions for individual queries
const getTodayStatus = async (connection, empId) => {
    const query = `
        SELECT status 
        FROM attendance 
        WHERE empId = ? AND date = CURDATE()
        LIMIT 1
    `;
    const results = await executeQuery(connection, query, [empId], 'Today Status Query');
    return results[0] ? results[0].status : 'Not recorded';
};

const getLeaveBalance = async (connection, empId) => {
    const query = `
        SELECT 
            sickLeaveBalance as sick,
            fullDayLeaveBalance as annual
        FROM employee
        WHERE empId = ?
    `;
    const results = await executeQuery(connection, query, [empId], 'Leave Balance Query');
    return {
        sick: results[0] ? parseFloat(results[0].sick) || 0 : 0,
        annual: results[0] ? parseFloat(results[0].annual) || 0 : 0
    };
};

const getPendingTasksCount = async (connection, empId) => {
    const query = `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE assignee_id = ? AND status IN ('pending', 'In Progress')
    `;
    const results = await executeQuery(connection, query, [empId], 'Pending Tasks Query');
    return results[0] ? parseInt(results[0].count) || 0 : 0;
};

const getRecentActivities = async (connection, empId) => {
    const query = `
        (
            SELECT 
                attendanceId as id, 
                'attendance' as type, 
                CONCAT('Attendance marked as ', status) as title, 
                CONCAT('At ', TIME(inTime)) as description, 
                date as activity_date
            FROM attendance 
            WHERE empId = ?
            ORDER BY date DESC 
            LIMIT 3
        )
        UNION ALL
        (
            SELECT 
                leaveId as id, 
                'leave' as type, 
                CONCAT('Leave ', leaveStatus) as title, 
                CONCAT(DATEDIFF(leaveToDate, leaveFromDate) + 1, ' days') as description, 
                leaveFromDate as activity_date
            FROM employeeleave 
            WHERE empId = ?
            ORDER BY leaveFromDate DESC 
            LIMIT 3
        )
        ORDER BY activity_date DESC 
        LIMIT 5
    `;
    const results = await executeQuery(connection, query, [empId, empId], 'Recent Activities Query');
    return results;
};

const getUpcomingEvents = async (connection) => {
    const query = `
        SELECT 
            meetingId as id,
            topic as title,
            CONCAT(date) as end,
            'meeting' as type
        FROM meeting
        WHERE date >= CURDATE()
        ORDER BY date ASC
        LIMIT 5
    `;

    const trainingQuery = `
        SELECT 
            trainingId as id,
            topic as title,
            CONCAT(date) as end,
            'training' as type
        FROM training
        WHERE date >= CURDATE()
        ORDER BY date ASC
        LIMIT 5
    `;

    const [meetings, trainings] = await Promise.all([
        executeQuery(connection, query, [], 'Upcoming Meetings Query'),
        executeQuery(connection, trainingQuery, [], 'Upcoming Trainings Query')
    ]);

    // Combine and sort all events, then return top 5
    const allEvents = [...meetings, ...trainings]
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);

    return allEvents;
};

export const getEmployeeDetails = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Database connection established for employee details');

        // Execute both queries in parallel
        const [basicInfo, attendanceStats] = await Promise.all([
            getBasicEmployeeInfo(connection, empId),
            getEmployeeAttendanceStats(connection, empId)
        ]);

        return {
            ...basicInfo,
            attendanceStats
        };

    } catch (error) {
        console.error('Employee details error:', {
            error: error.message,
            stack: error.stack,
            empId
        });
        throw new Error(`Employee details retrieval failed: ${error.message}`);
    } finally {
        if (connection) {
            try {
                await connection.release();
                console.log('Employee details connection released');
            } catch (releaseError) {
                console.error('Connection release error:', releaseError);
            }
        }
    }
};

const getBasicEmployeeInfo = async (connection, empId) => {
    const query = `
        SELECT 
            empId, first_name, last_name, email, 
            department, role, created_at,
            avatarUrl, phone
        FROM employee
        WHERE empId = ? AND status = 'Active'
        LIMIT 1
    `;
    const results = await executeQuery(connection, query, [empId], 'Basic Employee Info Query');

    if (results.length === 0) {
        throw new Error('Employee not found or inactive');
    }

    return results[0];
};

const getEmployeeAttendanceStats = async (connection, empId) => {
    const query = `
        SELECT 
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
        FROM attendance
        WHERE empId = ?
        AND date BETWEEN DATE_FORMAT(CURRENT_DATE(), '%Y-01-01') AND CURRENT_DATE()
    `;
    const results = await executeQuery(connection, query, [empId], 'Attendance Stats Query');

    const presentDays = results[0] ? parseInt(results[0].present) || 0 : 0;
    const absentDays = results[0] ? parseInt(results[0].absent) || 0 : 0;

    return {
        presentDays,
        absentDays,
        totalDays: presentDays + absentDays
    };
};