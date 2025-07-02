import pool from '../../config/database.js';

export async function getSalaryRecords(empId) {
    let connection;
    try {
        connection = await pool.getConnection();

        // Query salary data from the salary table with related information
        const [salaries] = await connection.execute(
            `SELECT 
                s.salaryId,
                s.basicSalary,
                s.salaryDate,
                s.otPay,
                s.incrementPay,
                s.bonusPay,
                s.totalSalary,
                e.first_name,
                e.last_name,
                e.email,
                e.department,
                b.bank_name,
                b.account_number
             FROM salary s
             JOIN employee e ON s.empId = e.empId
             LEFT JOIN bank_details b ON s.empId = b.empId
             WHERE s.empId = ?
             ORDER BY s.salaryDate DESC`,
            [empId]
        );

        return salaries;
    } catch (error) {
        console.error('Error in getSalaryRecords:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

export const getLatestPayslip = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        const [salary] = await connection.execute(`
            SELECT *
            FROM salary
            WHERE empId = ?
            ORDER BY salaryDate DESC
            LIMIT 1
        `, [empId]);

        const [ot] = await connection.execute(`
            SELECT amount
            FROM ot
            WHERE empId = ?
                AND DATE_FORMAT(created_at, '%Y-%m') = ?
        `, [empId, monthYear]);

        const totalOT = ot.reduce((sum, record) => sum + (record.amount || 0), 0);

        const [epfEtf] = await connection.execute(`
            SELECT epfCalculation, etfCalculation
            FROM epfNetf
            WHERE empId = ?
                AND DATE_FORMAT(appliedDate, '%Y-%m') = ?
            LIMIT 1
        `, [empId, monthYear]);

        const basicSalary = salary[0]?.basicSalary || 0;
        const transportAllowance = 200;
        const mealAllowance = 150;
        const medicalAllowance = 100;
        const insuranceDeduction = 75;
        const taxDeduction = basicSalary * 0.1;

        const allowances = {
            transport: transportAllowance,
            meal: mealAllowance,
            medical: medicalAllowance,
            overtime: totalOT
        };

        const deductions = {
            epf: epfEtf[0]?.epfCalculation || basicSalary * 0.08,
            tax: taxDeduction,
            insurance: insuranceDeduction
        };

        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        return {
            month: new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            basicSalary,
            allowances,
            deductions,
            grossSalary,
            netSalary
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getSalaryHistory = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [salaries] = await connection.execute(`
            SELECT 
                salaryId,
                DATE_FORMAT(salaryDate, '%Y-%m') as month,
                basicSalary,
                otPay,
                totalSalary
            FROM salary
            WHERE empId = ?
            ORDER BY salaryDate DESC
            LIMIT 12
        `, [empId]);

        return salaries.map(salary => ({
            salaryId: salary.salaryId,
            month: salary.month,
            basicSalary: salary.basicSalary || 0,
            allowances: salary.otPay || 0,
            deductions: (salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75,
            grossSalary: salary.totalSalary || 0,
            netSalary: salary.totalSalary ? salary.totalSalary - ((salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75) : 0,
            status: 'Paid'
        }));
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getYearToDateSummary = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;

        const [salaries] = await connection.execute(`
            SELECT basicSalary, totalSalary
            FROM salary
            WHERE empId = ?
                AND salaryDate >= ?
            ORDER BY salaryDate DESC
        `, [empId, startOfYear]);

        const [otRecords] = await connection.execute(`
            SELECT amount
            FROM ot
            WHERE empId = ?
                AND created_at >= ?
        `, [empId, startOfYear]);

        const totalOT = otRecords.reduce((sum, record) => sum + (record.amount || 0), 0);

        const totalBasic = salaries.reduce((sum, salary) => sum + (salary.basicSalary || 0), 0);
        const totalAllowances = salaries.length * (200 + 150 + 100) + totalOT;
        const totalDeductions = salaries.reduce((sum, salary) => sum + ((salary.basicSalary || 0) * 0.08 + (salary.basicSalary || 0) * 0.1 + 75), 0);
        const totalGross = totalBasic + totalAllowances;
        const totalNet = totalGross - totalDeductions;
        const averageMonthly = salaries.length ? totalNet / salaries.length : 0;

        return {
            totalGross,
            totalDeductions,
            totalNet,
            averageMonthly
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};