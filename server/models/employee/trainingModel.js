import pool from'../../config/database.js';

export async function getTrainingRecords(empId) {
    let connection;
    try {
        connection = await pool.getConnection();

        // Query training records with employee details
        const [trainings] = await connection.execute(
            `SELECT 
                t.trainingId,
                t.topic,
                t.trainer,
                t.venue,
                t.duration,
                t.date AS trainingDate,
                t.created_at,
                et.startTime,
                et.endTime,
                e.first_name,
                e.last_name,
                e.department
             FROM training t
             JOIN employeetraining et ON t.trainingId = et.employeeTrainingId
             JOIN employee e ON et.empId = e.empId
             WHERE et.empId = ?
             ORDER BY t.date DESC, et.startTime ASC`,
            [empId]
        );

        // Format date/time fields for better readability
        return trainings.map(training => ({
            ...training,
            trainingDate: new Date(training.trainingDate).toLocaleDateString(),
            startTime: training.startTime ? new Date(training.startTime).toLocaleTimeString() : null,
            endTime: training.endTime ? new Date(training.endTime).toLocaleTimeString() : null,
            durationFormatted: training.duration ? `${training.duration} hours` : null
        }));
    } catch (error) {
        console.error('Error in getTrainingRecords:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

export const getCompletedTrainings = async (empId) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const [trainings] = await pool.query(`
      SELECT 
        t.trainingId,
        t.topic as title,
        t.trainer as provider,
        DATE_FORMAT(et.endTime, '%Y-%m-%d') as completedDate,
        t.duration,
        k.kpiValue as score
      FROM employeeTraining et
      JOIN training t ON et.trainingId = t.trainingId
      LEFT JOIN kpi k ON t.trainingId = k.trainingId AND k.empId = ?
      WHERE et.empId = ?
        AND et.endTime < ?
      ORDER BY et.endTime DESC
      LIMIT 50
    `, [empId, empId, currentDate]);

        return trainings.map(training => ({
            trainingId: training.trainingId,
            title: training.title || 'Unnamed Training',
            provider: training.provider || 'Internal',
            completedDate: training.completedDate,
            duration: `${training.duration || 1} day(s)`,
            score: training.score || 0,
            certificateNumber: `CERT-${training.trainingId.slice(0, 8).toUpperCase()}`,
            expiryDate: new Date(new Date(training.completedDate).setFullYear(
                new Date(training.completedDate).getFullYear() + 2
            )).toISOString().split('T')[0],
            status: 'Completed',
            progress: 100,
            mandatory: true
        }));
    } catch (error) {
        console.error('Error fetching completed trainings:', error);
        throw new Error('Failed to fetch completed trainings');
    }
};

export const getUpcomingTrainings = async (empId) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const [trainings] = await pool.query(`
      SELECT 
        t.trainingId,
        t.topic as title,
        t.trainer as provider,
        DATE_FORMAT(et.startTime, '%Y-%m-%d') as startDate,
        t.duration,
        t.venue,
        t.mandatory
      FROM employeeTraining et
      JOIN training t ON et.trainingId = t.trainingId
      WHERE et.empId = ?
        AND et.startTime > ?
      ORDER BY et.startTime ASC
    `, [empId, currentDate]);

        return trainings.map(training => ({
            trainingId: training.trainingId,
            title: training.title || 'Unnamed Training',
            provider: training.provider || 'Internal',
            startDate: training.startDate,
            duration: `${training.duration || 1} day(s)`,
            format: training.venue?.includes('Online') ? 'Online' : 'Classroom',
            mandatory: training.mandatory || false,
            registrationDeadline: new Date(new Date(training.startDate).setDate(
                new Date(training.startDate).getDate() - 7
            )).toISOString().split('T')[0],
            status: 'Upcoming'
        }));
    } catch (error) {
        console.error('Error fetching upcoming trainings:', error);
        throw new Error('Failed to fetch upcoming trainings');
    }
};

export const getTrainingStats = async (empId) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;

        const [stats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN et.endTime < ? THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN et.startTime <= ? AND et.endTime >= ? THEN 1 ELSE 0 END) as current,
        SUM(CASE WHEN et.endTime >= ? THEN 1 ELSE 0 END) as certificates
      FROM employeeTraining et
      WHERE et.empId = ?
    `, [currentDate, currentDate, currentDate, startOfYear, empId]);

        const [kpi] = await pool.query(`
      SELECT AVG(kpiValue) as avgScore
      FROM kpi
      WHERE empId = ?
        AND trainingId IS NOT NULL
    `, [empId]);

        return {
            totalCompleted: stats[0]?.completed || 0,
            currentEnrollments: stats[0]?.current || 0,
            averageScore: kpi[0]?.avgScore || 0,
            certificatesEarned: stats[0]?.certificates || 0
        };
    } catch (error) {
        console.error('Error calculating training stats:', error);
        throw new Error('Failed to calculate training stats');
    }
};