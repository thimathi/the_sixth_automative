import pool from '../../config/database.js';

export const getTasks = async () => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [tasks] = await connection.execute('SELECT * FROM tasks');
        return tasks;
    }
    catch (error) {
        console.error('Error in getTasks:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}
