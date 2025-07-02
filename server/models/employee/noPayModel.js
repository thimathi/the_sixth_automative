import pool from '../../config/database.js';

export const getRecords = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Using parameterized query to prevent SQL injection
        const [noPays] = await connection.execute(
            `SELECT 
                noPayId, 
                deductionAmount, 
                startDate, 
                endDate, 
                created_at 
             FROM nopay 
             WHERE empId = ? 
             ORDER BY deductionAmount DESC`,
            [empId]
        );

        return noPays;
    } catch (error) {
        console.error('Error in getEmployeenoPayes:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getStats = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;

        const [records] = await connection.execute(`
            SELECT 
                startDate,
                deductionAmount,
                status
            FROM noPay
            WHERE empId = ?
            AND startDate >= ?
            ORDER BY startDate DESC
        `, [empId, startOfYear]);

        const totalDeductions = records
            .filter(record => record.status === "Processed")
            .reduce((sum, record) => sum + (record.deductionAmount || 0), 0);

        const pendingDeductions = records
            .filter(record => record.status === "Under Review")
            .reduce((sum, record) => sum + (record.deductionAmount || 0), 0);

        const lastIncident = records.length > 0 ? records[0].startDate : null;

        return {
            totalDeductions,
            pendingDeductions,
            totalIncidents: records.length,
            lastIncidentDate: lastIncident
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getPolicies = async () => {
    try {
        return [
            {
                category: "Unauthorized Absence",
                description: "Full day salary deduction for absence without approval",
                deductionRate: "1 day salary",
            },
            {
                category: "Late Arrival",
                description: "Hourly deduction for late arrival beyond grace period",
                deductionRate: "Hourly rate",
            },
            {
                category: "Extended Breaks",
                description: "Deduction for exceeding authorized break time",
                deductionRate: "Hourly rate",
            },
            {
                category: "Early Departure",
                description: "Deduction for leaving before scheduled time",
                deductionRate: "Hourly rate",
            },
        ];
    } catch (error) {
        throw error;
    }
};