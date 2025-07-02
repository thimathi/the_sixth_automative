import pool from '../../config/database.js';

const DEFAULT_LEAVE_COLUMNS = [
    'leaveId',
    'created_at AS createdAt',
    'leaveStatus',
    'duration',
    'leaveFromDate AS fromDate',
    'leaveToDate AS toDate',
    'empId'
];

const VALID_COLUMNS = new Set([
    'leaveId', 'created_at', 'leaveStatus', 'duration',
    'leaveFromDate', 'leaveToDate', 'empId'
]);

export const getLeaveData = async (filters = {}, columns = DEFAULT_LEAVE_COLUMNS, pagination = {}) => {
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

        if (filters.leaveStatus) {
            if (typeof filters.leaveStatus !== 'string') {
                throw new Error('leaveStatus must be a string');
            }
            whereClauses.push('leaveStatus = ?');
            params.push(filters.leaveStatus);
        }

        // Date range filters
        if (filters.fromDate) {
            if (isNaN(Date.parse(filters.fromDate))) {
                throw new Error('Invalid fromDate format');
            }
            whereClauses.push('leaveFromDate >= ?');
            params.push(new Date(filters.fromDate).toISOString().slice(0, 10));
        }

        if (filters.toDate) {
            if (isNaN(Date.parse(filters.toDate))) {
                throw new Error('Invalid toDate format');
            }
            whereClauses.push('leaveToDate <= ?');
            params.push(new Date(filters.toDate).toISOString().slice(0, 10));
        }

        // Build query
        let query = `SELECT ${validatedColumns.join(', ')} FROM employeeleave`;

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Sorting
        query += ' ORDER BY created_at DESC';

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
        throw new Error(`Failed to retrieve leave data: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};