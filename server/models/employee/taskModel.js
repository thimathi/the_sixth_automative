import pool from '../../config/database.js';

export async function getTaskRecords(empId) {
    let connection;
    try {
        connection = await pool.getConnection();

        const [tasks] = await connection.execute(
            `SELECT 
                t.id,
                t.title,
                t.description,
                t.priority,
                t.type,
                t.due_date,
                t.status,
                t.created_at,
                t.updated_at,
                creator.first_name AS creator_first_name,
                creator.last_name AS creator_last_name,
                creator.email AS creator_email
             FROM tasks t
             JOIN employee creator ON t.created_by = creator.empId
             WHERE t.assignee_id = ?
             ORDER BY 
                 CASE 
                     WHEN t.status = 'pending' THEN 1
                     WHEN t.status = 'in progress' THEN 2
                     ELSE 3
                 END,
                 CASE 
                     WHEN t.priority = 'High' THEN 1
                     WHEN t.priority = 'Medium' THEN 2
                     ELSE 3
                 END,
                 t.due_date ASC`,
            [empId]
        );

        return tasks;
    } catch (error) {
        console.error('Error in getTaskRecords:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

export const getTaskHistory = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [tasks] = await connection.execute(`
            SELECT 
                t.taskId,
                t.title,
                DATE_FORMAT(et.endDate, '%Y-%m-%d') as completedDate,
                CONCAT(e.first_name, ' ', e.last_name) as assignedBy,
                t.status,
                k.kpiValue,
                k.feedback
            FROM employeeTask et
            JOIN task t ON et.taskId = t.taskId
            JOIN employee e ON t.created_by = e.empId
            LEFT JOIN kpi k ON t.taskId = k.taskId AND k.empId = ?
            WHERE et.empId = ?
                AND t.status != 'Active'
            ORDER BY et.endDate DESC
            LIMIT 50
        `, [empId, empId]);

        return tasks.map(task => ({
            taskId: task.taskId,
            title: task.title || 'Unnamed Task',
            completedDate: task.completedDate,
            assignedBy: task.assignedBy || 'Manager',
            status: task.status || 'Completed',
            rating: task.kpiValue ? task.kpiValue / 20 : 4,
            feedback: task.feedback || 'No feedback provided'
        }));
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getTaskStats = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [allTasks] = await connection.execute(`
            SELECT 
                t.status,
                et.endDate,
                t.dueDate
            FROM employeeTask et
            JOIN task t ON et.taskId = t.taskId
            WHERE et.empId = ?
        `, [empId]);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

        const [monthlyTasks] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM employeeTask et
            JOIN task t ON et.taskId = t.taskId
            WHERE et.empId = ?
                AND t.status = 'Completed'
                AND et.endDate >= ?
        `, [empId, startOfMonth]);

        const totalTasks = allTasks.filter(t => t.status !== 'Completed').length;
        const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
        const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
        const overdueTasks = allTasks.filter(t =>
            t.status !== 'Completed' &&
            t.dueDate &&
            new Date(t.dueDate) < currentDate
        ).length;

        const completedOnTime = allTasks.filter(t =>
            t.status === 'Completed' &&
            t.endDate &&
            t.dueDate &&
            new Date(t.endDate) <= new Date(t.dueDate)
        ).length;

        const onTimeCompletion = completedTasks > 0
            ? Math.round((completedOnTime / completedTasks) * 100)
            : 0;

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            onTimeCompletion,
            monthlyCompleted: monthlyTasks[0]?.count || 0
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};