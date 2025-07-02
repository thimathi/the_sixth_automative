import pool from '../../config/database.js';

export const getMeetingStats = async () => {
    let connection;
    try {
        console.log("Connected to the database");
        connection = await pool.getConnection();
        console.log("Connected to the database" + connection);
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

        // Get upcoming meetings count
        const [upcoming] = await connection.execute(
            'SELECT COUNT(*) AS count FROM meeting WHERE date >= ?',
            [today]
        );

        // Get today's meetings count
        const [todayMeetings] = await connection.execute(
            'SELECT COUNT(*) AS count FROM meeting WHERE date = ?',
            [today]
        );

        // Get completed meetings count (last 30 days)
        const [completed] = await connection.execute(
            'SELECT COUNT(*) AS count FROM meeting WHERE date < ? AND date >= ?',
            [today, thirtyDaysAgo]
        );

        return {
            upcomingCount: upcoming[0].count,
            todayCount: todayMeetings[0].count,
            completedCount: completed[0].count
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getMeeting = async () => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [reports] = await connection.execute('SELECT * FROM meeting');
        return reports;
    }
    catch (error) {
        console.error('Error in getReports:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
};