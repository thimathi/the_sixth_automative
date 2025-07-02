import pool from '../../config/database.js';

export const fetchEmployees = async (filters) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Base query
        let query = `
            SELECT 
                e.empId as id,
                e.empId as employeeId,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.department,
                e.email,
                e.avatarUrl,
                d.departmentName as departmentName,
                s.basicSalary as baseSalary,
                k.kpiValue as performance,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'amount', b.amount,
                            'date', DATE_FORMAT(b.bonusDate, '%Y-%m-%d'),
                            'type', b.type
                        )
                    )
                    FROM bonus b
                    WHERE b.empId = e.empId
                    AND YEAR(b.bonusDate) = ?
                    ORDER BY b.bonusDate DESC
                    LIMIT 3
                ) as recentBonuses
            FROM employee e
            LEFT JOIN department d ON e.department = d.departmentId
            LEFT JOIN (
                SELECT empId, basicSalary
                FROM salary
                WHERE salaryDate = (
                    SELECT MAX(salaryDate) 
                    FROM salary s2 
                    WHERE s2.empId = salary.empId
                )
            ) s ON e.empId = s.empId
            LEFT JOIN (
                SELECT empId, kpiValue
                FROM kpi
                WHERE kpiYear = ?
                AND calculateDate = (
                    SELECT MAX(calculateDate)
                    FROM kpi k2
                    WHERE k2.empId = kpi.empId
                    AND k2.kpiYear = kpi.kpiYear
                )
            ) k ON e.empId = k.empId
            WHERE e.status = 'Active'
        `;

        const params = [filters.year, filters.year];

        // Add filters
        if (filters.department) {
            query += ` AND e.department = ?`;
            params.push(filters.department);
        }

        if (filters.performanceThreshold) {
            query += ` AND k.kpiValue >= ?`;
            params.push(filters.performanceThreshold);
        }

        query += ` ORDER BY performance DESC, name ASC`;

        const [rows] = await connection.query(query, params);

        // Parse JSON fields
        return rows.map(row => ({
            ...row,
            recentBonuses: row.recentBonuses ? JSON.parse(row.recentBonuses) : []
        }));
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to fetch employee data from database');
    } finally {
        if (connection) connection.release();
    }
};

export const fetchBonusHistory = async (filters) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Base query for data
        let dataQuery = `
            SELECT 
                b.bonusId as id,
                b.empId as employeeId,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                e.department,
                d.departmentName,
                b.type,
                b.reason,
                b.amount,
                DATE_FORMAT(b.bonusDate, '%Y-%m-%d') as date,
                DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as processedAt,
                b.amount / s.basicSalary * 100 as percentageOfSalary
            FROM bonus b
            JOIN employee e ON b.empId = e.empId
            LEFT JOIN department d ON e.department = d.departmentId
            LEFT JOIN salary s ON e.empId = s.empId 
                AND s.salaryDate = (
                    SELECT MAX(salaryDate) 
                    FROM salary 
                    WHERE empId = e.empId 
                    AND salaryDate <= b.bonusDate
                )
            WHERE YEAR(b.bonusDate) = ?
        `;

        // Count query for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM bonus b
            WHERE YEAR(b.bonusDate) = ?
        `;

        const params = [filters.year];
        const countParams = [filters.year];

        // Add filters
        const addFilter = (field, value, paramType = '') => {
            if (value) {
                const operator = paramType === 'range' ? 'BETWEEN ? AND ?' : '= ?';
                dataQuery += ` AND b.${field} ${operator}`;
                countQuery += ` AND b.${field} ${operator}`;

                if (paramType === 'range') {
                    params.push(filters.minAmount, filters.maxAmount);
                    countParams.push(filters.minAmount, filters.maxAmount);
                } else {
                    params.push(value);
                    countParams.push(value);
                }
            }
        };

        addFilter('empId', filters.employeeId);
        addFilter('type', filters.type);

        if (filters.minAmount !== null && filters.maxAmount !== null) {
            addFilter('amount', null, 'range');
        }

        // Add sorting and pagination
        dataQuery += ` ORDER BY b.bonusDate DESC, b.amount DESC`;
        dataQuery += ` LIMIT ? OFFSET ?`;
        params.push(filters.pageSize, (filters.page - 1) * filters.pageSize);

        // Execute queries
        const [rows] = await connection.query(dataQuery, params);
        const [count] = await connection.query(countQuery, countParams);

        return {
            results: rows,
            totalCount: count[0].total
        };
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to fetch bonus history from database');
    } finally {
        if (connection) connection.release();
    }
};

export const processBonus = async (employeeId, type, amount, reason) => {
    try {
        // Assuming your bonuses table has these exact 4 columns
        const query = 'INSERT INTO bonus (empId, type, amount, reason) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [employeeId, type, amount, reason]);

        return {
            success: true,
            bonusId: result.insertId
        };
    } catch (error) {
        console.error('Error in bonus model:', error);
        return {
            success: false,
            error: error.message
        };
    }
};