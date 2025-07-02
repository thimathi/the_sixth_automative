import pool from '../../config/database.js';

class OT {
    constructor(data) {
        this.otId = data.otId || null;
        this.empId = data.empId;
        this.otHours = data.otHours;
        this.rate = data.rate;
        this.amount = data.amount;
        this.created_at = data.created_at || new Date();
        this.type = data.type;
        this.status = data.status || 'Pending';
        this.processed_by = data.processed_by || null;
    }

    async save() {
        try {
            const [result] = await pool.query(`
                INSERT INTO ot SET ?
            `, this);

            this.otId = result.insertId;
            return this;
        } catch (error) {
            throw error;
        }
    }

    static async findById(otId) {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM ot WHERE otId = ?
            `, [otId]);

            return rows.length ? new OT(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmployee(empId, options = {}) {
        try {
            let query = `
                SELECT * FROM ot WHERE empId = ?
            `;

            const params = [empId];

            if (options.status) {
                query += ' AND status = ?';
                params.push(options.status);
            }

            if (options.startDate) {
                query += ' AND created_at >= ?';
                params.push(options.startDate);
            }

            if (options.endDate) {
                query += ' AND created_at <= ?';
                params.push(options.endDate);
            }

            query += ' ORDER BY created_at DESC';

            if (options.limit) {
                query += ' LIMIT ?';
                params.push(options.limit);
            }

            const [rows] = await pool.query(query, params);
            return rows.map(row => new OT(row));
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(otId, status, processedBy) {
        try {
            const [result] = await pool.query(`
                UPDATE ot 
                SET status = ?, processed_by = ?
                WHERE otId = ?
            `, [status, processedBy, otId]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getStats(department, startDate, endDate) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as totalRequests,
                    SUM(otHours) as totalHours,
                    SUM(amount) as totalAmount,
                    status,
                    type
                FROM ot o
                JOIN employee e ON o.empId = e.empId
            `;

            const params = [];

            if (department) {
                query += ' WHERE e.department = ?';
                params.push(department);
            }

            if (startDate) {
                query += (params.length ? ' AND' : ' WHERE') + ' o.created_at >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += (params.length ? ' AND' : ' WHERE') + ' o.created_at <= ?';
                params.push(endDate);
            }

            query += ' GROUP BY status, type';

            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

export default OT;