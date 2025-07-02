import pool from '../../config/database.js';

export const getEmployees = async (empId = null) => {
    let connection;
    try {
        connection = await pool.getConnection();

        let query = `
            SELECT 
                e.empId as id,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.department,
                s.basicSalary as currentSalary,
                TIMESTAMPDIFF(MONTH, e.created_at, NOW()) as tenure,
                DATE_FORMAT(
                    (SELECT MAX(lastIncrementDate) FROM increment WHERE empId = e.empId),
                    '%Y-%m-%d'
                ) as lastIncrement
            FROM employee e
            LEFT JOIN salary s ON e.empId = s.empId
            LEFT JOIN kpi k ON e.empId = k.empId
            WHERE e.status = 'Active'
        `;

        const params = [];

        if (empId) {
            query += ' AND e.empId = ?';
            params.push(empId);
        }

        query += ' ORDER BY e.first_name ASC';

        const [rows] = await connection.query(query, params);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getIncrementsByEmployee = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT 
                i.incrementId,
                i.percenatge as percentage,
                i.amount,
                i.lastIncrementDate,
                i.nextIncrementDate,
                i.approval,
                i.processed_by as processedBy,
                i.created_at,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                CONCAT(a.first_name, ' ', a.last_name) as accountantName
            FROM increment i
            JOIN employee e ON i.empId = e.empId
            LEFT JOIN employee a ON i.processed_by = a.empId
            WHERE i.empId = ?
            ORDER BY i.lastIncrementDate DESC
        `, [empId]);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getAllIncrements = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT 
                i.incrementId,
                i.empId,
                i.percenatge as percentage,
                i.amount,
                i.lastIncrementDate,
                i.nextIncrementDate,
                i.approval,
                i.remarks,
                i.processed_by as processedBy,
                i.created_at,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                CONCAT(a.first_name, ' ', a.last_name) as accountantName
            FROM increment i
            JOIN employee e ON i.empId = e.empId
            LEFT JOIN employee a ON i.processed_by = a.empId
            ORDER BY i.lastIncrementDate DESC
        `);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};