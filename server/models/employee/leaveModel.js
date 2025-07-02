import pool from '../../config/database.js';

export const getLeaveApplications = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [applications] = await connection.execute(
            `SELECT 
                l.leaveId,
                lt.leaveType as type,
                DATE_FORMAT(l.leaveFromDate, '%Y-%m-%d') as startDate,
                DATE_FORMAT(l.leaveToDate, '%Y-%m-%d') as endDate,
                l.duration as days,
                l.leaveReason as reason,
                DATE_FORMAT(l.created_at, '%Y-%m-%d') as appliedDate,
                l.leaveStatus as status,
                CONCAT(m.first_name, ' ', m.last_name) as approver
             FROM employeeLeave l
             JOIN leaveType lt ON l.leaveTypeId = lt.leaveTypeId
             LEFT JOIN employee m ON l.approvedBy = m.empId
             WHERE l.empId = ?
             ORDER BY l.created_at DESC`,
            [empId]
        );

        return applications;
    } catch (error) {
        console.error('Error in getLeaveApplications:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const submitLeaveApplication = async (empId, { leaveStatus, leaveFromDate, leaveToDate, leaveReason, duration }) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 2. Create leave application
        await connection.execute(`
            INSERT INTO employeeLeave (
                empId,
                leaveFromDate,
                leaveToDate,
                duration,
                leaveReason,
                leaveStatus,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [empId, leaveFromDate, leaveToDate, duration, leaveReason, leaveStatus]);

        await connection.commit();

        return {
            status: 'Pending',
            message: 'Leave application submitted and awaiting approval'
        };
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
