import pool from '../../config/database.js';

export const createReport = async (reportData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO reports (
                id, name, type, format, status, created_by, download_url, config
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
            [
                reportData.name,
                reportData.type,
                reportData.format || 'PDF',
                reportData.status || 'Generated',
                reportData.created_by,
                reportData.download_url,
                reportData.config ? JSON.stringify(reportData.config) : null
            ]
        );

        // Return the inserted report's ID and other info
        return {
            id: result.insertId,
            ...reportData
        };
    } catch (error) {
        console.error('Error creating report:', error);
        throw new Error('Failed to create report record');
    } finally {
        if (connection) connection.release();
    }
};

export const logReportAction = async (logData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            `INSERT INTO report_logs (
                id, report_id, action, status, message, user_id, details
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
            [
                logData.report_id,
                logData.action,
                logData.status,
                logData.message,
                logData.user_id,
                logData.details ? JSON.stringify(logData.details) : null
            ]
        );
    } catch (error) {
        console.error('Error logging report action:', error);
        throw new Error('Failed to log report action');
    } finally {
        if (connection) connection.release();
    }
};

export const getReportData = async (type, filters) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const queries = {
            otReport: `
                    SELECT e.empId, e.first_name, e.last_name, 
                        SUM(o.otHours) as totalHours, SUM(o.amount) as totalAmount
                    FROM ot o
                    JOIN employee e ON o.empId = e.empId
                    WHERE o.status = 'Approved'
                    ${filters.startDate ? 'AND o.created_at >= ?' : ''}
                    ${filters.endDate ? 'AND o.created_at <= ?' : ''}
                    GROUP BY e.empId
                `,
            kpiReport: `
                    SELECT e.empId, e.first_name, e.last_name, 
                        k.kpiValue, kr.kpiRank, d.departmentName
                    FROM kpi k
                    JOIN employee e ON k.empId = e.empId
                    JOIN kpiranking kr ON k.kpiRankingId = kr.kpiRankingId
                    JOIN department d ON e.department = d.departmentId
                    WHERE 1=1
                    ${filters.department ? 'AND d.departmentId = ?' : ''}
                    ${filters.year ? 'AND YEAR(k.calculateDate) = ?' : ''}
                    ORDER BY k.kpiValue DESC
                `,
            employeeReport: `
                    SELECT empId, first_name, last_name, email, 
                        department, role, status, phone
                    FROM employee
                    WHERE 1=1
                    ${filters.department ? 'AND department = ?' : ''}
                    ${filters.status ? 'AND status = ?' : ''}
                `,
            leaveReport: `
                    SELECT l.leaveId, e.empId, e.first_name, e.last_name,
                        lt.leaveType, l.leaveFromDate, l.leaveToDate,
                        l.duration, l.leaveStatus
                    FROM employeeleave l
                    JOIN employee e ON l.empId = e.empId
                    JOIN leavetype lt ON l.leaveTypeId = lt.leaveTypeId
                    WHERE 1=1
                    ${filters.startDate ? 'AND l.leaveFromDate >= ?' : ''}
                    ${filters.endDate ? 'AND l.leaveToDate <= ?' : ''}
                    ${filters.status ? 'AND l.leaveStatus = ?' : ''}
                `,
            loanReport: `
                    SELECT l.loanRequestId, e.empId, e.first_name, e.last_name,
                        lt.loanType, l.amount, l.interestRate, l.duration,
                        l.status, l.processedAt
                    FROM loanrequest l
                    JOIN employee e ON l.empId = e.empId
                    JOIN loantype lt ON l.loanTypeId = lt.loanTypeId
                    WHERE 1=1
                    ${filters.startDate ? 'AND l.created_at >= ?' : ''}
                    ${filters.endDate ? 'AND l.created_at <= ?' : ''}
                    ${filters.status ? 'AND l.status = ?' : ''}
                `,
            meetingsReport: `
                    SELECT m.meetingId, e.empId, e.first_name, e.last_name,
                        m.topic, m.date, m.type, em.startTime, em.endTime
                    FROM meeting m
                    JOIN employeemeeting em ON m.meetingId = em.meetingId
                    JOIN employee e ON em.empId = e.empId
                    WHERE 1=1
                    ${filters.startDate ? 'AND m.date >= ?' : ''}
                    ${filters.endDate ? 'AND m.date <= ?' : ''}
                    ${filters.type ? 'AND m.type = ?' : ''}
                `,
            noPayReport: `
                    SELECT n.noPayId, e.empId, e.first_name, e.last_name,
                        n.noPayDays, n.startDate, n.endDate, n.deductionAmount
                    FROM nopay n
                    JOIN employee e ON n.empId = e.empId
                    WHERE 1=1
                    ${filters.startDate ? 'AND n.startDate >= ?' : ''}
                    ${filters.endDate ? 'AND n.endDate <= ?' : ''}
                `,
            salaryReport: `
                    SELECT s.salaryId, e.empId, e.first_name, e.last_name,
                        s.basicSalary, s.otPay, s.incrementPay, s.bonusPay,
                        s.totalSalary, s.salaryDate
                    FROM salary s
                    JOIN employee e ON s.empId = e.empId
                    WHERE 1=1
                    ${filters.startDate ? 'AND s.salaryDate >= ?' : ''}
                    ${filters.endDate ? 'AND s.salaryDate <= ?' : ''}
                    ${filters.empId ? 'AND s.empId = ?' : ''}
                `
        };

        const query = queries[type];
        if (!query) throw new Error('Invalid report type');

        const params = [];
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        if (filters.department) params.push(filters.department);
        if (filters.year) params.push(filters.year);
        if (filters.status) params.push(filters.status);
        if (filters.type) params.push(filters.type);
        if (filters.empId) params.push(filters.empId);

        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error getting report data:', error);
        throw new Error(`Failed to get ${type} report data`);
    } finally {
        if (connection) connection.release();
    }
};