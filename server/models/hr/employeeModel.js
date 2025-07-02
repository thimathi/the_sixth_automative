import pool from '../../config/database.js';

export const getDepartments = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [departments] = await connection.execute('SELECT * FROM department');
        return departments;
    } catch (error) {
        console.error('Error in departmentModel.getDepartments:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const createDepartment = async (departmentData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO department (departmentName, managerId) VALUES (?, ?)',
            [departmentData.departmentName, departmentData.managerId]
        );
        return { id: result.insertId, ...departmentData };
    } catch (error) {
        console.error('Error in departmentModel.createDepartment:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const updateDepartment = async (departmentId, { departmentName, managerId }) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE department
             SET departmentName = ?, 
                 managerId = ?
             WHERE departmentId = ?`,
            [
                departmentName,
                managerId || null,
                departmentId
            ]
        );

        if (result.affectedRows === 0) {
            throw new Error('Department not found or no changes made');
        }

        return {
            departmentId,
            departmentName,
            managerId: managerId || null
        };
    } catch (error) {
        console.error('Error in departmentModel.updateDepartment:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getEmployees = async (filters) => {
    let connection;
    try {
        connection = await pool.getConnection();
        let query = `
            SELECT 
                empId,
                first_name as firstName,
                last_name as lastName,
                email,
                phone,
                department,
                role,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d') as joinDate
            FROM employee 
        `;

        const params = [];

        query += ` ORDER BY first_name, last_name`;

        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};


export const updateEmployee = async (empId, { department, role, status, otHours, kpiScore,
    satisfaction_score }) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE employee
             SET department = ?, 
                 role = ?,
                 status = ?,
                 otHours = ?,
                 kpiScore = ?,
                 satisfaction_score = ?
             WHERE empId = ?`,
            [
                department,
                role,
                status,
                otHours,
                kpiScore,
                satisfaction_score,
                empId
            ]
        );

        if (result.affectedRows === 0) {
            throw new Error('Employee not found or no changes made');
        }

        return {
            empId,
            department,
            role,
            status,
            otHours,
            kpiScore,
            satisfaction_score
        };
    } catch (error) {
        console.error('Error in employeeModel.updateEmployee:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const deleteDepartment = async (departmentId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            'DELETE FROM department WHERE departmentId = ?',
            [departmentId]
        );
        return { departmentId };
    } catch (error) {
        console.error('Error in departmentModel.deleteDepartment:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const deleteEmployee = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM employee WHERE empId = ?',
            [empId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Employee not found');
        }

        return { empId };
    } catch (error) {
        console.error('Error in employeeModel.deleteEmployee:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};