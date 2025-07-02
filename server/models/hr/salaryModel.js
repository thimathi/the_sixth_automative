import pool from '../../config/database.js';

const DEFAULT_SALARY_COLUMNS = [
    'salaryId',
    'created_at AS createdAt',
    'basicSalary',
    'salaryDate',
    'processed_by AS processedBy',
    'otPay',
    'incrementPay',
    'bonusPay',
    'totalSalary',
    'empId'
];

const VALID_COLUMNS = new Set([
    'salaryId', 'created_at', 'basicSalary', 'salaryDate',
    'processed_by', 'otPay', 'incrementPay', 'bonusPay',
    'totalSalary', 'empId'
]);

const DEFAULT_HISTORY_COLUMNS = [
    'historyId',
    'created_at AS createdAt',
    'empId',
    'name',
    'changeType',
    'previousSalary',
    'currentSalary',
    'effectiveDate',
    'status'
];

const VALID_COLUMNS2 = new Set([
    'historyId', 'created_at', 'empId', 'name',
    'changeType', 'previousSalary', 'currentSalary',
    'effectiveDate', 'status'
]);

export const getSalaryData = async (filters = {}, columns = DEFAULT_SALARY_COLUMNS, pagination = {}) => {
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

        if (filters.processedBy) {
            if (typeof filters.processedBy !== 'string') {
                throw new Error('processedBy must be a string');
            }
            whereClauses.push('processed_by = ?');
            params.push(filters.processedBy);
        }

        // Date range filters
        if (filters.fromDate) {
            if (isNaN(Date.parse(filters.fromDate))) {
                throw new Error('Invalid fromDate format');
            }
            whereClauses.push('salaryDate >= ?');
            params.push(new Date(filters.fromDate).toISOString().slice(0, 10));
        }

        if (filters.toDate) {
            if (isNaN(Date.parse(filters.toDate))) {
                throw new Error('Invalid toDate format');
            }
            whereClauses.push('salaryDate <= ?');
            params.push(new Date(filters.toDate).toISOString().slice(0, 10));
        }

        // Salary amount filters
        if (filters.minSalary) {
            const minSalary = parseFloat(filters.minSalary);
            if (isNaN(minSalary) || minSalary < 0) {
                throw new Error('Invalid minSalary value');
            }
            whereClauses.push('totalSalary >= ?');
            params.push(minSalary);
        }

        if (filters.maxSalary) {
            const maxSalary = parseFloat(filters.maxSalary);
            if (isNaN(maxSalary) || maxSalary < 0) {
                throw new Error('Invalid maxSalary value');
            }
            whereClauses.push('totalSalary <= ?');
            params.push(maxSalary);
        }

        // Build query
        let query = `SELECT ${validatedColumns.join(', ')} FROM salary`;

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Sorting
        query += ' ORDER BY salaryDate DESC';

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
        throw new Error(`Failed to retrieve salary data: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

export const getSalaryHistoryData = async (filters = {}, columns = DEFAULT_HISTORY_COLUMNS, pagination = {}) => {
    let connection;
    try {
        // Validate columns
        const validatedColumns2 = columns.filter(col => {
            const baseCol2 = col.split(' AS ')[0].trim();
            return VALID_COLUMNS2.has(baseCol2);
        });

        if (validatedColumns2.length === 0) {
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

        if (filters.changeType) {
            if (typeof filters.changeType !== 'string') {
                throw new Error('changeType must be a string');
            }
            whereClauses.push('changeType = ?');
            params.push(filters.changeType);
        }

        if (filters.status) {
            if (typeof filters.status !== 'string') {
                throw new Error('status must be a string');
            }
            whereClauses.push('status = ?');
            params.push(filters.status);
        }

        // Date range filters
        if (filters.fromDate) {
            if (isNaN(Date.parse(filters.fromDate))) {
                throw new Error('Invalid fromDate format');
            }
            whereClauses.push('effectiveDate >= ?');
            params.push(new Date(filters.fromDate).toISOString().slice(0, 10));
        }

        if (filters.toDate) {
            if (isNaN(Date.parse(filters.toDate))) {
                throw new Error('Invalid toDate format');
            }
            whereClauses.push('effectiveDate <= ?');
            params.push(new Date(filters.toDate).toISOString().slice(0, 10));
        }

        // Salary change filters
        if (filters.minChange) {
            const minChange = parseFloat(filters.minChange);
            if (isNaN(minChange)) {
                throw new Error('Invalid minChange value');
            }
            whereClauses.push('(currentSalary - previousSalary) >= ?');
            params.push(minChange);
        }

        if (filters.maxChange) {
            const maxChange = parseFloat(filters.maxChange);
            if (isNaN(maxChange)) {
                throw new Error('Invalid maxChange value');
            }
            whereClauses.push('(currentSalary - previousSalary) <= ?');
            params.push(maxChange);
        }

        // Build query
        let query = `SELECT ${validatedColumns2.join(', ')} FROM salaryhistory`;

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Sorting
        query += ' ORDER BY effectiveDate DESC, created_at DESC';

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
        throw new Error(`Failed to retrieve salary history data: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};