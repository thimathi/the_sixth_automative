import pool from '../config/database.js';

class User {

    static async findByEmail(email) {
        const [result] = await pool.execute(
            'SELECT * FROM employee WHERE email = ?', [email]
        );
        return result.length > 0 ? result[0] : null;
    }



static async create(userData) {
    const [result] = await pool.execute(
        'INSERT INTO employee (empId, first_name, last_name, email, phone, role, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            userData.empId,
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.phone,
            userData.role,
            userData.status,
            userData.password
        ]
    );
    return result;
}


    static async updatePassword(email, newPassword) {
        const [result] = await pool.execute(
            'UPDATE employee SET password = ? WHERE email = ?',
            [newPassword, email]
        );
        return result;
    }
}

export default User;