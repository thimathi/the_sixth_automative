import pool from "../../config/database.js";

export const getEPFETFDetails = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [epfEtfDetails] = await connection.execute(
            `SELECT 
                epfAndEtfId, 
                appliedDate, 
                basicSalary, 
                processedBy, 
                processedAt, 
                empIdNumber,
                epfCalculation,
                etfCalculation
             FROM epfnetf 
             WHERE empId = ? 
             ORDER BY appliedDate DESC`,
            [empId]
        );

        return epfEtfDetails;
    } catch (error) {
        console.error('Error in getEPFETFDetails:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getContributionHistory = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [history] = await connection.execute(
            `SELECT 
                appliedDate, 
                epfCalculation, 
                etfCalculation 
             FROM epfnetf 
             WHERE empId = ?
             ORDER BY appliedDate DESC
             LIMIT 12`,
            [empId]
        );

        return history;
    } catch (error) {
        console.error('Error in getContributionHistory:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};