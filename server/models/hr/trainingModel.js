import pool from '../../config/database.js';

const DEFAULT_TRAINING_COLUMNS = [
    'trainingId',
    'created_at AS createdAt',
    'venue',
    'trainer',
    'topic',
    'duration',
    'date',
    'empId'
];

const VALID_COLUMNS = new Set([
    'trainingId', 'created_at', 'venue', 'trainer',
    'topic', 'duration', 'date', 'empId'
]);

export const getTrainingData = async (filters = {}, columns = DEFAULT_TRAINING_COLUMNS, pagination = {}) => {
    let connection;
    try {
        // Validate columns
        const validatedColumns = columns.filter(col => {
            const baseCol = col.split(' AS ')[0].trim();
            return VALID_COLUMNS.has(baseCol);
        });

        if (validatedColumns.length === 0) {
            throw new Error('No valid columns specified');
        }

        connection = await pool.getConnection();

        // Build WHERE clause
        const whereClauses = [];
        const params = [];

        // Supported filters with validation
        if (filters.empId) {
            if (typeof filters.empId !== 'string') {
                throw new Error('empId must be a string');
            }
            whereClauses.push('empId = ?');
            params.push(filters.empId);
        }

        if (filters.topic) {
            if (typeof filters.topic !== 'string') {
                throw new Error('topic must be a string');
            }
            whereClauses.push('topic LIKE ?');
            params.push(`%${filters.topic}%`);
        }

        if (filters.trainer) {
            if (typeof filters.trainer !== 'string') {
                throw new Error('trainer must be a string');
            }
            whereClauses.push('trainer LIKE ?');
            params.push(`%${filters.trainer}%`);
        }

        if (filters.venue) {
            if (typeof filters.venue !== 'string') {
                throw new Error('venue must be a string');
            }
            whereClauses.push('venue LIKE ?');
            params.push(`%${filters.venue}%`);
        }

        // Date range filters
        if (filters.fromDate) {
            if (isNaN(Date.parse(filters.fromDate))) {
                throw new Error('Invalid fromDate format');
            }
            whereClauses.push('date >= ?');
            params.push(new Date(filters.fromDate).toISOString().slice(0, 10));
        }

        if (filters.toDate) {
            if (isNaN(Date.parse(filters.toDate))) {
                throw new Error('Invalid toDate format');
            }
            whereClauses.push('date <= ?');
            params.push(new Date(filters.toDate).toISOString().slice(0, 10));
        }

        // Duration filters
        if (filters.minDuration) {
            const minDuration = parseInt(filters.minDuration, 10);
            if (isNaN(minDuration) || minDuration < 0) {
                throw new Error('Invalid minDuration value');
            }
            whereClauses.push('duration >= ?');
            params.push(minDuration);
        }

        if (filters.maxDuration) {
            const maxDuration = parseInt(filters.maxDuration, 10);
            if (isNaN(maxDuration) || maxDuration < 0) {
                throw new Error('Invalid maxDuration value');
            }
            whereClauses.push('duration <= ?');
            params.push(maxDuration);
        }

        // Build query
        let query = `SELECT ${validatedColumns.join(', ')} FROM training`;

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Sorting - default by date descending, then by creation time
        query += ' ORDER BY date DESC, created_at DESC';

        // Pagination
        if (pagination.limit) {
            const limit = parseInt(pagination.limit, 10);
            if (isNaN(limit) || limit <= 0) {
                throw new Error('Invalid limit value');
            }
            query += ' LIMIT ?';
            params.push(limit);

            if (pagination.offset) {
                const offset = parseInt(pagination.offset, 10);
                if (isNaN(offset) || offset < 0) {
                    throw new Error('Invalid offset value');
                }
                query += ' OFFSET ?';
                params.push(offset);
            }
        }

        const [rows] = await connection.execute(query, params);
        return rows;

    } catch (error) {
        console.error('Database operation failed:', error.message);
        throw new Error(`Failed to retrieve training data: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

export const createTrainingSession = async (trainingData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO training (venue, trainer, topic, duration, date, empId) VALUES (?, ?, ?, ?, ?, ?)',
            [trainingData.venue, trainingData.trainer, trainingData.topic, trainingData.duration, trainingData.date, trainingData.empId],
        );
        return { id: result.insertId, ...trainingData };
    } catch (error) {
        console.error('Error in trainingModel.createTrainingSession:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

