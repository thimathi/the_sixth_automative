import pool from "../../config/database.js";

export const getMonthlyStats = async (empId) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get attendance records
        const [records] = await pool.query(
            `SELECT 
                a.date, 
                a.inTime, 
                a.outTime, 
                a.status 
             FROM attendance a
             JOIN employee e ON a.empId = e.empId
             WHERE a.empId = ? 
             AND a.date BETWEEN ? AND ?`,
            [empId, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
        );

        // Calculate working days (excluding weekends)
        let workingDays = 0;
        let presentDays = 0;
        let totalHours = 0;
        let overtimeHours = 0;

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(now.getFullYear(), now.getMonth(), day);
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                workingDays++;
            }
        }

        // Calculate stats from records
        records.forEach(record => {
            if (record.status === 'Present') {  // Changed to match SQL data
                presentDays++;

                if (record.inTime && record.outTime) {
                    const inTime = new Date(`1970-01-01T${record.inTime}`);
                    const outTime = new Date(`1970-01-01T${record.outTime}`);
                    const hoursWorked = (outTime - inTime) / (1000 * 60 * 60);

                    totalHours += Math.min(8, hoursWorked);
                    overtimeHours += Math.max(0, hoursWorked - 8);
                }
            }
        });

        const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

        return {
            daysPresent: presentDays,
            workingDays,
            totalHours: Math.round(totalHours),
            overtimeHours: Math.round(overtimeHours),
            attendanceRate
        };
    } catch (error) {
        throw error;
    }
};

export const getAttendanceByEmpAndDate = async (empId, date) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            'SELECT * FROM attendance WHERE empId = ? AND date = ?',
            [empId, date]
        );
        return rows[0] || null;
    } finally {
        conn.release();
    }
};

export const checkIn = async (empId, date, inTime) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO attendance 
             (attendanceId, empId, date, inTime, status) 
             VALUES (UUID(), ?, ?, ?, 'present')`,
            [empId, date, inTime]
        );

        const [newRecord] = await conn.query(
            'SELECT * FROM attendance WHERE attendanceId = ?',
            [result.insertId]
        );

        await conn.commit();
        return newRecord[0];
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const checkOut = async (attendanceId, outTime) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            'UPDATE attendance SET outTime = ? WHERE attendanceId = ?',
            [outTime, attendanceId]
        );

        const [updated] = await conn.query(
            'SELECT * FROM attendance WHERE attendanceId = ?',
            [attendanceId]
        );

        await conn.commit();
        return updated[0];
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};