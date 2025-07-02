import * as pool from "../config/database.js";

export default function logReportAction({ reportId, templateId, userId, action, status, message = '', details = {} }) {
    try {
        pool.execute(
            `INSERT INTO report_logs 
       (report_id, action, status, message, user_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                reportId || null,
                action,
                status,
                message,
                userId,
                JSON.stringify(details)
            ]
        );
    } catch (error) {
        console.error('Failed to log report action:', error);
    }
}
