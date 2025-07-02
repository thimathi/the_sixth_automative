import * as pool from '../../config/database.js';

export const getCurrentPosition = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [promotion] = await connection.execute(`
            SELECT 
                newPosition, 
                DATE_FORMAT(promotionDate, '%Y-%m-%d') as promotionDate
            FROM promotion
            WHERE empId = ?
            ORDER BY promotionDate DESC
            LIMIT 1
        `, [empId]);

        const [employee] = await connection.execute(`
            SELECT department 
            FROM employee 
            WHERE empId = ?
        `, [empId]);

        const currentPromotion = promotion[0];
        const currentEmployee = employee[0];

        const level = currentPromotion?.newPosition.includes('Senior') ? 'Level 3' :
            currentPromotion?.newPosition.includes('Technician') ? 'Level 2' : 'Level 1';

        return {
            title: currentPromotion?.newPosition || 'Automotive Technician',
            level,
            department: currentEmployee?.department || 'Service Department',
            startDate: currentPromotion?.promotionDate || new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getPromotionHistory = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                promotionId,
                oldPosition,
                newPosition,
                DATE_FORMAT(promotionDate, '%Y-%m-%d') as promotionDate,
                salaryIncrease,
                reason
            FROM promotion
            WHERE empId = ?
            ORDER BY promotionDate DESC
        `, [empId]);

        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const getEligiblePositions = async (empId) => {
    try {
        const currentPosition = await getCurrentPosition(empId);

        if (currentPosition.level === 'Level 3') {
            return [
                {
                    title: "Lead Automotive Technician",
                    level: "Level 4",
                    department: currentPosition.department,
                    requirements: [
                        "3+ years as Senior Technician",
                        "Leadership certification",
                        "ASE Master certification"
                    ],
                    estimatedSalaryIncrease: 6000,
                    eligibilityStatus: "Eligible in 1.3 years"
                }
            ];
        } else if (currentPosition.level === 'Level 2') {
            return [
                {
                    title: "Senior Automotive Technician",
                    level: "Level 3",
                    department: currentPosition.department,
                    requirements: [
                        "2+ years as Technician",
                        "Advanced certification",
                        "Mentorship experience"
                    ],
                    estimatedSalaryIncrease: 4000,
                    eligibilityStatus: "Eligible in 0.5 years"
                }
            ];
        } else {
            return [
                {
                    title: "Automotive Technician",
                    level: "Level 2",
                    department: currentPosition.department,
                    requirements: [
                        "1+ year experience",
                        "Basic certification",
                        "Good performance record"
                    ],
                    estimatedSalaryIncrease: 3000,
                    eligibilityStatus: "Eligible now"
                }
            ];
        }
    } catch (error) {
        throw error;
    }
};

export const getPromotionCriteria = async (empId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [kpi] = await connection.execute(`
            SELECT kpiValue 
            FROM kpi
            WHERE empId = ?
            ORDER BY calculateDate DESC
            LIMIT 1
        `, [empId]);

        const currentPosition = await getCurrentPosition(empId);
        const startDate = new Date(currentPosition.startDate);
        const yearsInPosition = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        const [training] = await connection.execute(`
            SELECT * 
            FROM employeeTraining
            WHERE empId = ?
        `, [empId]);

        return [
            {
                category: "Performance Rating",
                requirement: "Excellent (4.5+)",
                currentStatus: kpi[0]?.kpiValue ? `${(kpi[0].kpiValue / 20).toFixed(1)}/5.0` : "Not rated",
                met: kpi[0]?.kpiValue ? kpi[0].kpiValue >= 90 : false
            },
            {
                category: "Years in Position",
                requirement: "Minimum 2 years",
                currentStatus: `${yearsInPosition.toFixed(1)} years`,
                met: yearsInPosition >= 2
            },
            {
                category: "Training Completion",
                requirement: "All required certifications",
                currentStatus: training.length ? `${Math.min(100, training.length * 25)}% complete` : "0% complete",
                met: training.length ? training.length >= 4 : false
            }
        ];
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
};