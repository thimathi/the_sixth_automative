import pool from "../../config/database.js";

export const getIncrementDetails = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Get current salary
        const [salaryData] = await connection.execute(
            `SELECT basicSalary, salaryDate 
             FROM salary 
             WHERE empId = ? 
             ORDER BY salaryDate DESC 
             LIMIT 1`,
            [empId]
        );

        if (salaryData.length === 0) {
            throw new Error('Salary data not found');
        }

        // Get increment data
        const [incrementData] = await connection.execute(
            `SELECT amount, lastIncrementDate, nextIncrementDate, percenatge 
             FROM increment 
             WHERE empId = ? 
             ORDER BY lastIncrementDate DESC 
             LIMIT 1`,
            [empId]
        );

        const currentSalary = salaryData[0]?.basicSalary || 0;
        const lastIncrementDate = incrementData[0]?.lastIncrementDate || new Date().toISOString().split('T')[0];
        const nextReviewDate = incrementData[0]?.nextIncrementDate ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        const today = new Date();
        const nextReview = new Date(nextReviewDate);
        const monthsToNextReview = (nextReview.getFullYear() - today.getFullYear()) * 12 +
            (nextReview.getMonth() - today.getMonth());

        const lastReview = new Date(lastIncrementDate);
        const totalMonthsInCycle = 12;
        const monthsSinceLastReview = (today.getFullYear() - lastReview.getFullYear()) * 12 +
            (today.getMonth() - lastReview.getMonth());
        const reviewProgress = Math.min(100, (monthsSinceLastReview / totalMonthsInCycle) * 100);

        return {
            currentSalary,
            lastIncrement: {
                date: lastIncrementDate,
                amount: incrementData[0]?.amount || 0,
                percentage: incrementData[0]?.percenatge || 0,
                type: "Annual"
            },
            nextReviewDate,
            monthsToNextReview,
            reviewProgress
        };
    } catch (error) {
        console.error('Error in getIncrementDetails:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getIncrementHistory = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Get increment history
        const [incrementData] = await connection.execute(
            `SELECT 
                incrementId as id, 
                lastIncrementDate as date, 
                amount, 
                percenatge as percentage 
             FROM increment 
             WHERE empId = ? 
             ORDER BY lastIncrementDate DESC`,
            [empId]
        );

        // Get salary history for comparison
        const [salaryData] = await connection.execute(
            `SELECT basicSalary, salaryDate 
             FROM salary 
             WHERE empId = ? 
             ORDER BY salaryDate ASC`,
            [empId]
        );

        return incrementData.map((inc) => {
            const incrementDate = new Date(inc.date);
            const previousSalaries = salaryData.filter((s) => new Date(s.salaryDate) < incrementDate);
            const previousSalary = previousSalaries.length > 0 ?
                previousSalaries[previousSalaries.length - 1].basicSalary :
                (salaryData[0]?.basicSalary || 0) - inc.amount;

            return {
                ...inc,
                previousSalary,
                newSalary: previousSalary + inc.amount,
                type: "Annual",
                reason: "Performance review"
            };
        });
    } catch (error) {
        console.error('Error in getIncrementHistory:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};