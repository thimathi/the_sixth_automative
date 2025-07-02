import pool from '../../config/database.js';
export const getPerformanceRatings = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [ratings] = await connection.execute('SELECT * FROM performance_rating');
        return ratings;
    } catch (error) {
        console.error('Error in getPerformanceRatings:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // Fixed the typo here
    }
};

export const updatePerformanceRating = async (rating_id, { empId, evaluator_id, rate }) => {
    let connection;
    try{
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE performance_rating
             SET empId = ?, 
                 evaluator_id = ?,
                 rate = ?,
             WHERE rating_id = ?`
            [
                empId,
                evaluator_id || null,
                rate,
                rating_id
            ]
        );

        if (result.affectedRows === 0) {
            throw new Error('Department not found or no changes made');
        }

        return {
            rating_id,
            empId,
            evaluator_id,
            rate
        }

    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const createPerformanceRating = async (ratingData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO performance_rating (empId, evaluator_id, rate, review_period_start, review_period_end, rating_date) VALUES ( ?, ?, ?, ?, ?, ?)',
            [ratingData.empId, ratingData.evaluator_id, ratingData.rate, ratingData.review_period_start, ratingData.review_period_end, ratingData.rating_date]
        );
        return { id: result.insertId, ...ratingData };
    } catch (error) {
        console.error('Error in ratingModel.createPerformanceRating:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};