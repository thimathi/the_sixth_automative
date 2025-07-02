import pool from '../config/database.js';

class HrUtils {
    static async validateHR(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT role FROM employee WHERE empId = ?',
                [userId]
            );

            if (rows.length === 0) return false;
            return rows[0].role === 'hr';
        } catch (error) {
            console.error('Error validating HR:', error);
            return false;
        }
    }

    static async trackHROperation(operation, hrId, targetEmployeeId, details = {}) {
        try {
            await pool.execute(
                `INSERT INTO hr_operations 
                 (id, operation, hr_id, target_employee_id, details, operation_time)
                 VALUES (UUID(), ?, ?, ?, ?, NOW())`,
                [operation, hrId, targetEmployeeId, JSON.stringify(details)]
            );
        } catch (error) {
            console.error('Error tracking HR operation:', error);
        }
    }

    static async getDepartmentManager(department) {
        try {
            const [rows] = await pool.execute(
                `SELECT managerId FROM department 
                 WHERE departmentName = ?`,
                [department]
            );
            return rows.length > 0 ? rows[0].managerId : null;
        } catch (error) {
            console.error('Error getting department manager:', error);
            return null;
        }
    }

    static async canModifyEmployee(hrId, targetEmployeeId) {
        try {
            // HR can modify any employee except other HR/MD unless they are MD themselves
            const [hrRow] = await pool.execute(
                'SELECT role FROM employee WHERE empId = ?',
                [hrId]
            );

            const [targetRow] = await pool.execute(
                'SELECT role FROM employee WHERE empId = ?',
                [targetEmployeeId]
            );

            if (hrRow.length === 0 || targetRow.length === 0) return false;

            // MD can modify anyone
            if (hrRow[0].role === 'md') return true;

            // HR can't modify other HR or MD
            return !['hr', 'md'].includes(targetRow[0].role);
        } catch (error) {
            console.error('Error checking modify permissions:', error);
            return false;
        }
    }

    static async logSalaryApproval(salaryChangeId, approvedBy, comments = '') {
        try {
            await pool.execute(
                `UPDATE salaryHistory 
                 SET approved_by = ?, approval_time = NOW(), comments = ?
                 WHERE historyId = ?`,
                [approvedBy, comments, salaryChangeId]
            );
        } catch (error) {
            console.error('Error logging salary approval:', error);
        }
    }

    static async getPendingSalaryChanges() {
        try {
            const [rows] = await pool.execute(
                `SELECT sh.*, e.first_name, e.last_name 
                 FROM salaryHistory sh
                 JOIN employee e ON sh.empId = e.empId
                 WHERE sh.status = 'Pending'
                 ORDER BY sh.effectiveDate DESC`
            );
            return rows;
        } catch (error) {
            console.error('Error getting pending salary changes:', error);
            return [];
        }
    }
}

// ES Module Exports
export const validateHR = HrUtils.validateHR;
export const trackHROperation = HrUtils.trackHROperation;
export const getDepartmentManager = HrUtils.getDepartmentManager;
export const canModifyEmployee = HrUtils.canModifyEmployee;
export const logSalaryApproval = HrUtils.logSalaryApproval;
export const getPendingSalaryChanges = HrUtils.getPendingSalaryChanges;