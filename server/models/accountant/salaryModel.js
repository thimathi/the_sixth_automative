import pool from '../../config/database.js';

export const getEmployeesForSalaryProcessing = async () => {
    const [rows] = await pool.query(`
        SELECT 
            e.empId as id,
            CONCAT(e.first_name, ' ', e.last_name) as name,
            e.department,
            e.role,
            e.otHours,
            e.tenture,
            s.basicSalary as baseSalary,
            IFNULL(b.amount, 0) as bonus,
            IFNULL(epf.epfCalculation, 0) as epf
        FROM employee e
        LEFT JOIN salary s ON e.empId = s.empId
        LEFT JOIN bonus b ON e.empId = b.empId
        LEFT JOIN epfNetf epf ON e.empId = epf.empId
        WHERE e.status = 'Active'
        ORDER BY e.first_name ASC
    `);

    return rows;
};
