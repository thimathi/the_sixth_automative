import pool from '../../config/database.js';

const DEFAULT_LOAN_COLUMNS = [
    'loanRequestId',
    'created_at AS createdAt',
    'duration',
    'date',
    'amount',
    'interestRate',
    'empId',
    'loanTypeId',
    'processedBy',
    'processedAt',
    'status'
];

const VALID_COLUMNS = new Set([
    'loanRequestId', 'created_at', 'duration', 'date',
    'amount', 'interestRate', 'empId', 'loanTypeId',
    'processedBy', 'processedAt', 'status'
]);

export const getLoanRequests = async (filters = {}, columns = DEFAULT_LOAN_COLUMNS, pagination = {}) => {
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

        if (filters.status) {
            if (typeof filters.status !== 'string') {
                throw new Error('status must be a string');
            }
            whereClauses.push('status = ?');
            params.push(filters.status);
        }

        if (filters.loanTypeId) {
            if (typeof filters.loanTypeId !== 'string') {
                throw new Error('loanTypeId must be a string');
            }
            whereClauses.push('loanTypeId = ?');
            params.push(filters.loanTypeId);
        }

        // Date filter
        if (filters.date) {
            if (isNaN(Date.parse(filters.date))) {
                throw new Error('Invalid date format');
            }
            whereClauses.push('date = ?');
            params.push(new Date(filters.date).toISOString().slice(0, 10));
        }

        // Amount range filters
        if (filters.minAmount) {
            const minAmount = parseInt(filters.minAmount, 10);
            if (isNaN(minAmount) || minAmount < 0) {
                throw new Error('Invalid minAmount value');
            }
            whereClauses.push('amount >= ?');
            params.push(minAmount);
        }

        if (filters.maxAmount) {
            const maxAmount = parseInt(filters.maxAmount, 10);
            if (isNaN(maxAmount) || maxAmount < 0) {
                throw new Error('Invalid maxAmount value');
            }
            whereClauses.push('amount <= ?');
            params.push(maxAmount);
        }

        // Build query
        let query = `SELECT ${validatedColumns.join(', ')} FROM loanrequest`;

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
        throw new Error(`Failed to retrieve loan data: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

export const approveLoanRequest = async (loanRequestId, {status}) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Update loan request status to 'Approved' in loan request table
        const [result] = await connection.execute(
            `UPDATE loanrequest 
             SET status = ? 
             WHERE loanRequestId = ?`,  // Removed the trailing comma
            [status, loanRequestId]
        );

        if (result.affectedRows === 0){
            throw new Error("Loan not approved");
        }

        return {
            loanRequestId,
            status
        };
    } catch (error) {
        console.error('Error in loanModel.approveLoanRequest:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const rejectLoanRequest = async (loanRequestId, {status}) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Update loan request status to 'Approved' in loan request table
        const [result] = await connection.execute(
            `UPDATE loanrequest 
             SET status = ? 
             WHERE loanRequestId = ?`,  // Removed the trailing comma
            [status, loanRequestId]
        );

        if (result.affectedRows === 0){
            throw new Error("Loan not rejected");
        }

        return {
            loanRequestId,
            status
        };
    } catch (error) {
        console.error('Error in loanModel.rejectLoanRequest:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};