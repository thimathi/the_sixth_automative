import pool from '../../config/database.js';
import { generatePDF } from '../../utils/pdfGenerator.js';
import OT from '../../models/accountant/otModel.js';

export const fetchEmployees = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.empId as id,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.department,
                s.basicSalary / 2080 as hourlyRate,
                40 as regularHours
            FROM employee e
            LEFT JOIN salary s ON e.empId = s.empId
            WHERE e.status = 'Active'
            ORDER BY e.first_name ASC
        `);
        return rows;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const fetchOTRecords = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                o.otId as id,
                o.empId as employeeId,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                o.otHours,
                o.rate,
                o.amount,
                DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                o.type,
                o.status,
                CONCAT(a.first_name, ' ', a.last_name) as processedBy
            FROM ot o
            JOIN employee e ON o.empId = e.empId
            LEFT JOIN employee a ON o.processed_by = a.empId
        `;

        const whereClauses = [];
        const params = [];

        if (filters.status) {
            whereClauses.push('o.status = ?');
            params.push(filters.status);
        }

        if (filters.type) {
            whereClauses.push('o.type = ?');
            params.push(filters.type);
        }

        if (filters.startDate) {
            whereClauses.push('o.created_at >= ?');
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClauses.push('o.created_at <= ?');
            params.push(filters.endDate);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY o.created_at DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching OT records:', error);
        throw error;
    }
};

export const calculateOTPayment = async (employeeId, hours, type) => {
    try {
        if (!employeeId || !hours || !type) {
            throw new Error('Employee ID, hours, and type are required');
        }

        const [employee] = await pool.query(`
            SELECT s.basicSalary / 2080 as hourlyRate
            FROM employee e
            JOIN salary s ON e.empId = s.empId
            WHERE e.empId = ? AND e.status = 'Active'
        `, [employeeId]);

        if (!employee.length) throw new Error('Employee not found or inactive');

        const hourlyRate = employee[0].hourlyRate;
        let multiplier = 1.5;

        switch (type) {
            case "weekend": multiplier = 2.0; break;
            case "holiday": multiplier = 2.5; break;
            case "night": multiplier = 1.75; break;
        }

        const rate = hourlyRate * multiplier;
        const amount = hours * rate;

        return {
            hours: parseFloat(hours),
            rate: parseFloat(rate.toFixed(2)),
            amount: parseFloat(amount.toFixed(2)),
            type
        };
    } catch (error) {
        console.error('Error calculating OT payment:', error);
        throw error;
    }
};

export const submitOTRequest = async ({
                                          accountantId,
                                          employeeId,
                                          hours,
                                          rate,
                                          amount,
                                          date,
                                          type,
                                          status = 'Pending'
                                      }) => {
    try {
        const otRecord = new OT({
            empId: employeeId,
            otHours: hours,
            rate,
            amount,
            created_at: date || new Date(),
            type,
            status,
            processed_by: accountantId
        });

        await otRecord.save();
        return true;
    } catch (error) {
        console.error('Error submitting OT request:', error);
        throw error;
    }
};

export const approveOTRequest = async (otId, accountantId) => {
    try {
        await pool.query('START TRANSACTION');

        // Update OT record status
        await pool.query(`
            UPDATE ot 
            SET status = 'Approved',
                processed_by = ?
            WHERE otId = ?
        `, [accountantId, otId]);

        // Get OT data
        const [otData] = await pool.query(`
            SELECT empId, amount FROM ot WHERE otId = ?
        `, [otId]);

        if (otData.length === 0) throw new Error('OT record not found');

        const { empId, amount } = otData[0];

        // Update employee's salary with OT pay
        await pool.query(`
            UPDATE salary 
            SET otPay = otPay + ?,
                processed_by = ?
            WHERE empId = ?
        `, [amount, accountantId, empId]);

        await pool.query('COMMIT');
        return true;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error approving OT request:', error);
        throw error;
    }
};

export const generateOTReport = async (params) => {
    try {
        // Fetch your data from database
        const otData = await fetchOTRecords(params); // Implement your data fetching logic

        // Structure data for PDF generation
        const pdfData = {
            startDate: params.startDate,
            endDate: params.endDate,
            status: params.status,
            type: params.type,
            rows: otData.map(item => ({
                // Map your database fields to PDF display fields
                employee: item.employeeName,
                date: item.otDate,
                hours: item.otHours,
                // etc.
            }))
        };

        return await generatePDF(pdfData);
    } catch (error) {
        console.error('Error generating OT report:', error);
        throw error;
    }
};