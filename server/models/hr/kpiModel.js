import pool from '../../config/database.js';

const DEFAULT_KPI_COLUMNS = [
    'kpiId',
    'created_at',
    'kpiValue',
    'calculateDate',
    'kpiYear',
    'kpiRankingId',
    'empId'
];

export const getKPIData = async (filters = {}, columns = DEFAULT_KPI_COLUMNS, pagination = {}) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Build WHERE clause based on filters
        const whereClauses = [];
        const params = [];

        if (filters.empId) {
            whereClauses.push('empId = ?');
            params.push(filters.empId);
        }

        if (filters.kpiYear) {
            whereClauses.push('kpiYear = ?');
            params.push(filters.kpiYear);
        }

        if (filters.kpiRankingId) {
            whereClauses.push('kpiRankingId = ?');
            params.push(filters.kpiRankingId);
        }

        if (filters.startDate) {
            whereClauses.push('calculateDate >= ?');
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClauses.push('calculateDate <= ?');
            params.push(filters.endDate);
        }

        if (filters.minValue !== undefined) {
            whereClauses.push('kpiValue >= ?');
            params.push(filters.minValue);
        }

        if (filters.maxValue !== undefined) {
            whereClauses.push('kpiValue <= ?');
            params.push(filters.maxValue);
        }

        // Build the query
        let query = `
            SELECT ${columns.join(', ')}
            FROM kpi
        `;

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Add sorting (default by creation date descending)
        query += ' ORDER BY created_at DESC';

        // Add pagination if needed
        if (pagination.limit) {
            query += ' LIMIT ?';
            params.push(pagination.limit);

            if (pagination.offset) {
                query += ' OFFSET ?';
                params.push(pagination.offset);
            }
        }

        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching KPI data:', error);
        throw new Error('Failed to retrieve KPI data');
    } finally {
        if (connection) connection.release();
    }
};