import pool from '../../config/database.js';

export const getRecentReports = async () => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [reports] = await connection.execute('SELECT * FROM reports');
        return reports;
    }
    catch (error) {
        console.error('Error in getReports:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}


export const getScheduledReports = async () => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [reports] = await connection.execute('SELECT * FROM scheduled_reports');
        return reports;
    }
    catch (error) {
        console.error('Error in getReports:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

export const getTemplates = async () => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [reports] = await connection.execute('SELECT * FROM report_templates');
        return reports;
    }
    catch (error) {
        console.error('Error in getReports:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}