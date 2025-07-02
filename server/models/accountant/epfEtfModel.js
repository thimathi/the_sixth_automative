import pool from '../../config/database.js';
import db from '../../config/database.js';

export const getEmployees = async (employeeId, year = null) => {
    let connection;
    try {
        connection = await pool.getConnection();

        let query = `
            SELECT 
                e.empId,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                e.department,
                s.basicSalary as monthlySalary,
                epf.employeeContribution,
                epf.employerContribution,
                epf.totalContribution,
                DATE_FORMAT(epf.month, '%Y-%m') as contributionMonth,
                epf.paidDate
            FROM employee e
            JOIN salary s ON e.empId = s.empId
            JOIN epf_contributions epf ON e.empId = epf.empId
            WHERE e.empId = ?
        `;

        const params = [employeeId];

        if (year) {
            query += ` AND YEAR(epf.month) = ?`;
            params.push(year);
        }

        query += ` ORDER BY epf.month DESC`;

        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const processEmployeeContributions = async (employeeId, basicSalary, month, accountantId) => {
    try {
        // Validate inputs
        if (!employeeId || !basicSalary || !month || !accountantId) {
            throw new Error('Missing required parameters');
        }

        // Convert month to Date object (first day of month)
        const monthDate = new Date(`${month}-01`);

        // EPF calculation (employee: 8%, employer: 12%)
        const employeeContribution = basicSalary * 0.08;
        const employerContribution = basicSalary * 0.12;
        const totalEpfContribution = employeeContribution + employerContribution;

        // ETF calculation (employer: 3%)
        const etfContribution = basicSalary * 0.03;

        // Create records in database
        const epfRecord = await createEpfRecord(
            employeeId,
            monthDate,
            basicSalary,
            employeeContribution,
            employerContribution,
            totalEpfContribution,
            accountantId
        );

        const etfRecord = await createEtfRecord(
            employeeId,
            monthDate,
            basicSalary,
            etfContribution,
            accountantId
        );

        // Create batch contribution record
        await createBatchContributionRecord(
            epfRecord.id,
            etfRecord.id
        );

        return {
            employeeId,
            epf: {
                employeeContribution: parseFloat(employeeContribution.toFixed(2)),
                employerContribution: parseFloat(employerContribution.toFixed(2)),
                totalContribution: parseFloat(totalEpfContribution.toFixed(2)),
                recordId: epfRecord.id
            },
            etf: {
                contribution: parseFloat(etfContribution.toFixed(2)),
                recordId: etfRecord.id
            }
        };
    } catch (error) {
        console.error('Error processing employee contributions:', error);
        throw error;
    }
};

const createBatchContributionRecord = async (epfId, etfId) => {
    const [record] = await db.query(`
        INSERT INTO epf_etf_batch_contributions 
        (epf_contribution_id, etf_contribution_id)
        VALUES (?, ?)
        RETURNING *
    `, [epfId, etfId]);

    return record;
};

export const getEmployeesForProcessing = async (month) => {
    const [employees] = await db.query(`
        SELECT e.empId, s.basicSalary
        FROM employee e
        JOIN salary s ON e.empId = s.empId
        WHERE e.status = 'Active'
        AND s.salaryDate = (
            SELECT MAX(salaryDate) 
            FROM salary 
            WHERE empId = e.empId 
            AND salaryDate <= ?
        )
    `, [`${month}-01`]);

    return employees;
};

export const createBatchRecord = async (month, accountantId, contributions) => {
    const totalEpf = contributions.reduce((sum, c) => sum + c.epf.totalContribution, 0);
    const totalEtf = contributions.reduce((sum, c) => sum + c.etf.contribution, 0);

    const [batch] = await db.query(`
        INSERT INTO epf_etf_payment_batches
        (payment_month, total_epf_amount, total_etf_amount, total_transactions, initiated_by)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
    `, [`${month}-01`, totalEpf, totalEtf, contributions.length, accountantId]);

    return batch.id;
};


// Helper function to safely access nested properties
export const getEmployeeInfo = async (empId) => {
    try {
        const [employees] = await db.query(`
            SELECT 
                empId, 
                first_name, 
                last_name, 
                department,
                status
            FROM employee 
            WHERE empId = ?
        `, [empId]);

        if (!employees || employees.length === 0) {
            throw {
                type: 'EMPLOYEE_NOT_FOUND',
                message: `Employee ${empId} not found in system`,
                code: 'EMP404'
            };
        }

        const employee = employees[0];
        const status = employee.status || 'Unknown';

        if (status !== 'Active') {
            throw {
                type: 'EMPLOYEE_INACTIVE',
                message: `Employee ${empId} is not active (current status: ${status})`,
                code: 'EMP400',
                employeeData: {
                    id: employee.empId,
                    name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Name not available',
                    department: employee.department || 'Unknown department',
                    status: status
                }
            };
        }

        return employee;
    } catch (error) {
        console.error('Error in getEmployeeInfo:', error);
        throw error;
    }
};

export const getEmployeeSalaryData = async (empId) => {
    try {
        // Try primary salary table first
        const [salaryRows] = await db.query(`
            SELECT 
                basicSalary,
                salaryDate,
                processed_by
            FROM salary 
            WHERE empId = ?
            ORDER BY salaryDate DESC
            LIMIT 1
        `, [empId]);

        if (salaryRows?.length > 0 && salaryRows[0]?.basicSalary) {
            return {
                source: 'salary',
                basicSalary: salaryRows[0].basicSalary,
                lastUpdated: salaryRows[0].salaryDate,
                updatedBy: salaryRows[0].processed_by || 'system'
            };
        }

        // Fallback to epfnetf table
        const [epfRows] = await db.query(`
            SELECT 
                basicSalary,
                processedAt as lastUpdated,
                processedBy as updatedBy
            FROM epfnetf 
            WHERE empId = ?
            ORDER BY processedAt DESC
            LIMIT 1
        `, [empId]);

        if (epfRows?.length > 0 && epfRows[0]?.basicSalary) {
            return {
                source: 'epfnetf',
                basicSalary: epfRows[0].basicSalary,
                lastUpdated: epfRows[0].lastUpdated,
                updatedBy: epfRows[0].updatedBy || 'system'
            };
        }

        // If no salary data found, try to get employee info for better error message
        const [employee] = await db.query(`
            SELECT empId, first_name, last_name 
            FROM employee 
            WHERE empId = ?
        `, [empId]);

        const employeeName = employee?.length > 0
            ? `${employee[0].first_name || ''} ${employee[0].last_name || ''}`.trim()
            : 'Unknown employee';

        throw {
            type: 'SALARY_DATA_MISSING',
            message: `No salary records found for employee ${employeeName} (ID: ${empId})`,
            code: 'SAL404',
            details: {
                suggestion: 'Please add salary data through HR system',
                potentialSourcesChecked: ['salary', 'epfnetf'],
                employee: {
                    id: empId,
                    name: employeeName || 'Name not available'
                }
            }
        };

    } catch (error) {
        console.error('Error in getEmployeeSalaryData:', error);
        throw error;
    }
};

export const getEpfPaymentHistory = async (empId) => {
    const [history2] = await db.query(`
        SELECT 
            id,
            DATE_FORMAT(month, '%Y-%m') as month,
            basicSalary,
            employerContribution as contribution,
            paidDate,
            processed_by as processedBy,
            created_at as processedAt
        FROM epf_contributions
        WHERE empId = ?
        ORDER BY month DESC
        LIMIT 12
    `, [empId]);

    return history2;

};

export const getEtfPaymentHistory = async (empId) => {
    const [history] = await db.query(`
        SELECT 
            id,
            DATE_FORMAT(month, '%Y-%m') as month,
            basicSalary,
            employerContribution as contribution,
            paidDate,
            processed_by as processedBy,
            created_at as processedAt
        FROM etf_contributions
        WHERE empId = ?
        ORDER BY month DESC
        LIMIT 12
    `, [empId]);

    return history;
};