import * as pool from '../config/database.js';

export const logAccountantOperation = async (accountantId, operation, recordId, details) => {
    try {
        await pool.query(`
      INSERT INTO accountant_operations (
        id,
        operation,
        record_id,
        accountant_id,
        details
      ) VALUES (
        UUID(),
        ?,
        ?,
        ?,
        ?
      )
    `, [operation, recordId, accountantId, JSON.stringify(details)]);
    } catch (error) {
        console.error('Error logging accountant operation:', error);
    }
};