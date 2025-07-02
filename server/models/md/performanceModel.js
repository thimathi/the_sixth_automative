import * as pool from '../../config/database.js';

export const getOverallPerformance = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT kpiValue FROM kpi ORDER BY calculateDate DESC LIMIT 1'
        );
        return rows[0]?.kpiValue ? (rows[0].kpiValue / 100) : 87.5;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getDepartmentPerformance = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT 
                department, 
                AVG(kpiScore) as avg_score, 
                COUNT(*) as employee_count 
            FROM employee 
            GROUP BY department`
        );
        return rows.map(dept => ({
            name: dept.department,
            score: dept.avg_score ? (dept.avg_score / 100) : 0,
            color: getDepartmentColor(dept.department)
        }));
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getEmployeePerformance = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT 
                e.empId,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.position,
                e.department,
                e.kpiScore,
                e.avatarUrl as avatar
            FROM employee e
            ORDER BY e.kpiScore DESC
            LIMIT 5`
        );
        return rows.map(emp => ({
            id: emp.empId,
            name: emp.name,
            position: emp.position,
            department: emp.department,
            rating: emp.kpiScore ? (emp.kpiScore / 100) : 0,
            avatar: emp.avatar || "/placeholder.svg?height=40&width=40",
            metrics: {
                technical: Math.floor(Math.random() * 20) + 80,
                customerService: Math.floor(Math.random() * 20) + 80,
                efficiency: Math.floor(Math.random() * 20) + 80
            }
        }));
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Helper function
function getDepartmentColor(department) {
    const colors = {
        'Service': 'primary.main',
        'Parts': 'success.main',
        'Sales': 'warning.main',
        'Admin': 'secondary.main',
        'Administrative': 'secondary.main'
    };
    return colors[department] || 'text.secondary';
}