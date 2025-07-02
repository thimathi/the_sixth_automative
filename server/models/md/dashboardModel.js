import pool from '../../config/database.js';

export const getDashboardData = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Verify MD role
        const [role] = await connection.execute(
            `SELECT role FROM employee WHERE empId = ?`,
            [empId]
        );

        if (role.length === 0) {
            throw new Error('Employee not found');
        }
        if (role[0].role !== 'md') {
            throw new Error('Unauthorized access - MD role required');
        }

        // Get revenue data (compatible with MySQL 5.7+)
        const [revenue] = await connection.execute(`
            SELECT 
                current_q.total AS total,
                IFNULL(
                    (current_q.total - prev_q.total) / prev_q.total * 100, 
                    0
                ) AS percentage_change
            FROM (
                SELECT 
                    SUM(totalRevenue) AS total,
                    YEAR(quarterEndDate) AS year,
                    QUARTER(quarterEndDate) AS quarter
                FROM financialReports
                WHERE quarterEndDate >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
                GROUP BY YEAR(quarterEndDate), QUARTER(quarterEndDate)
            ) current_q
            LEFT JOIN (
                SELECT 
                    SUM(totalRevenue) AS total,
                    YEAR(quarterEndDate) AS year,
                    QUARTER(quarterEndDate) AS quarter
                FROM financialReports
                WHERE quarterEndDate >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
                GROUP BY YEAR(quarterEndDate), QUARTER(quarterEndDate)
            ) prev_q ON (
                (current_q.year = prev_q.year AND current_q.quarter = prev_q.quarter + 1) OR
                (current_q.year = prev_q.year + 1 AND current_q.quarter = 1 AND prev_q.quarter = 4)
            )
            ORDER BY current_q.year DESC, current_q.quarter DESC
            LIMIT 1;
        `);

        // Get company performance
        const [performance] = await connection.execute(
            `SELECT AVG(k.kpiValue) as score 
            FROM kpi k 
            JOIN employee e ON k.empId = e.empId 
            WHERE k.calculateDate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`
        );

        // Get employee satisfaction
        const [satisfaction] = await connection.execute(
            `SELECT AVG(satisfaction_score) as avg_satisfaction 
            FROM employee 
            WHERE satisfaction_score IS NOT NULL`
        );

        // Get strategic goals
        const [goals] = await connection.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN achieved = 1 THEN 1 ELSE 0 END) as achieved 
            FROM strategic_goals 
            WHERE year = YEAR(CURDATE())`
        );

        // Get department metrics (updated to use department name from employee table)
        const [departments] = await connection.execute(
            `SELECT 
                e.department as name,
                AVG(k.kpiValue) as performance,
                'Productivity' as metric,
                CONCAT(FORMAT(AVG(k.kpiValue), 1), '%') as value
            FROM employee e
            JOIN kpi k ON e.empId = k.empId
            WHERE k.calculateDate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY e.department`
        );

        // Get upcoming meetings
        const [meetings] = await connection.execute(
            `SELECT topic, date, type 
            FROM meeting 
            WHERE date >= CURDATE() 
            ORDER BY date ASC LIMIT 3`
        );

        return {
            revenue: {
                total: revenue[0]?.total || 1,
                change: revenue[0]?.percentage_change || 1  // Changed from 'change' to 'percentage_change'
            },
            performance: {
                score: performance[0]?.score || 0
            },
            satisfaction: {
                avg_satisfaction: satisfaction[0]?.avg_satisfaction || 0
            },
            goals: {
                achieved: goals[0]?.achieved || 0,
                total: goals[0]?.total || 0
            },
            departments: departments || [],
            meetings: meetings || []
        };
    } catch (error) {
        console.error('Error in getDashboardData model:', error);
        throw new Error(`Database error: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

export const verifyMDRole = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT role FROM employee WHERE empId = ?',
            [empId]
        );
        return rows.length > 0 && rows[0].role === 'md';
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const scheduleMeeting = async (meetingData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO meeting 
            (meetingId, topic, date, startTime, endTime, type, location, description, empId, status)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                meetingData.topic,
                meetingData.date,
                meetingData.startTime || null,
                meetingData.endTime || null,
                meetingData.type,
                meetingData.location || null,
                meetingData.description || null,
                meetingData.empId,
                'scheduled'
            ]
        );
        
        // Get the newly created meeting
        const [meeting] = await connection.execute(
            'SELECT * FROM meeting WHERE meetingId = ?',
            [result.insertId]
        );
        
        return { 
            success: true, 
            meeting: meeting[0] 
        };
    } catch (error) {
        console.error('Database error in scheduleMeeting:', error);
        throw new Error('Failed to schedule meeting in database');
    } finally {
        if (connection) connection.release();
    }
};

export const promoteEmployee = async (promotionData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update employee role
        await connection.execute(
            'UPDATE employee SET role = ? WHERE empId = ?',
            [promotionData.newRole, promotionData.empId]
        );

        // Add to promotion history
        await connection.execute(
            'INSERT INTO promotion_history (empId, previousRole, newRole, promotedBy, promotionDate) VALUES (?, ?, ?, ?, NOW())',
            [promotionData.empId, promotionData.previousRole, promotionData.newRole, promotionData.promotedBy]
        );

        await connection.commit();
        return { success: true };
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};