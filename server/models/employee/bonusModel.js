import pool from "../../config/database.js";


export const getEmployeeBonuses = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Using parameterized query to prevent SQL injection
        const [bonuses] = await connection.execute(
            `SELECT 
                bonusId, 
                type, 
                reason, 
                bonusDate, 
                amount, 
                created_at 
             FROM bonus 
             WHERE empId = ? 
             ORDER BY bonusDate DESC`,
            [empId]
        );

        return bonuses;
    } catch (error) {
        console.error('Error in getEmployeeBonuses:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
