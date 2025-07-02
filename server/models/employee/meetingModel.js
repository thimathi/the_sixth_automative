import pool from '../../config/database.js';

export const getMeetingStats = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Using parameterized query to prevent SQL injection
        const [meetings] = await connection.execute(
            `SELECT 
                meetingId, 
                type, 
                date, 
                topic, 
                created_at 
             FROM meeting 
             WHERE empId = ? 
             ORDER BY date DESC`,
            [empId]
        );

        return meetings;
    } catch (error) {
        console.error('Error in getEmployeemeetinges:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};