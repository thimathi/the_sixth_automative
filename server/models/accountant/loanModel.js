import pool from '../../config/database.js';

export const getLoanEmployees = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`
      SELECT 
        e.empId as id,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        s.basicSalary * 12 as salary,
        TIMESTAMPDIFF(MONTH, e.created_at, NOW()) as tenure,
        FLOOR(600 + RAND() * 150) as creditScore,
        IFNULL((
          SELECT SUM(amount) 
          FROM loanRequest 
          WHERE empId = e.empId AND status = 'Approved'
        ), 0) as existingLoans,
        e.department
      FROM employee e
      LEFT JOIN salary s ON e.empId = s.empId
      ORDER BY e.first_name ASC
    `);

        return rows;
    } catch (error) {
        console.error('Error in loanModel.getLoanEmployees:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getLoanApplications = async () => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
      SELECT 
        lr.loanRequestId as id,
        CONCAT(e.first_name, ' ', e.last_name) as employeeName,
        e.empId as employeeId,
        lt.loanType,
        lr.amount,
        lr.interestRate,
        lr.duration as months,
        lr.date as applicationDate,
        lr.status,
        lr.processedAt,
        CONCAT(p.first_name, ' ', p.last_name) as processedByName
      FROM loanRequest lr
      JOIN employee e ON lr.empId = e.empId
      JOIN loanType lt ON lr.loanTypeId = lt.loanTypeId
      LEFT JOIN employee p ON lr.processedBy = p.empId
      ORDER BY lr.date DESC
    `);

        return rows;
    } catch (error) {
        console.error('Error in loanModel.getLoanApplications:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};