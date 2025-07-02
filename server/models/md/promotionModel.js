import pool from '../../config/database.js';

export const getPromotionCandidates = async () => {
    const query = `
        SELECT 
            e.empId,
            CONCAT(e.first_name, ' ', e.last_name) as name,
            e.role as position,  -- Using role instead of position
            e.department,
            e.kpiScore,
            e.created_at,
            e.avatarUrl as avatar,
            s.basicSalary as currentSalary
        FROM employee e
        LEFT JOIN salary s ON e.empId = s.empId
        WHERE e.kpiScore >= 400
        ORDER BY e.kpiScore DESC
        LIMIT 4
    `;

    try {
        const [rows] = await pool.query(query);
        return rows.map(emp => {
            const hireDate = new Date(emp.hireDate);
            const today = new Date();
            const tenure = (today.getFullYear() - hireDate.getFullYear()) +
                (today.getMonth() - hireDate.getMonth()) / 12;
            return {
                ...emp,
                tenure: parseFloat(tenure.toFixed(1))
            };
        });
    } catch (error) {
        console.error('Error fetching promotion candidates:', error);
        throw error;
    }
};

export const getRequiredApprovers = async () => {
    const query = `
        SELECT 
            e.empId,
            CONCAT(e.first_name, ' ', e.last_name) as name,
            e.role as position,
            e.role,
            e.avatarUrl as avatar
        FROM employee e
        WHERE e.role IN ('md', 'hr_manager', 'department_manager')
        LIMIT 3
    `;

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching required approvers:', error);
        throw error;
    }
};

export const getPromotionHistory = async () => {
    const query = `
        SELECT 
            p.promotionId,
            p.oldPosition,
            p.newPosition,
            p.promotionDate,
            p.salaryIncrease,
            'Approved' as status,
            e.first_name,
            e.last_name
        FROM promotion p
        JOIN employee e ON p.empId = e.empId
        ORDER BY p.promotionDate DESC
        LIMIT 3
    `;

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching promotion history:', error);
        throw error;
    }
};

export const getPromotionCriteria = async () => {
    const query = `
        SELECT 
            position,
            requirements,
            qualifications,
            salary_range
        FROM promotion_criteria
        ORDER BY position
    `;

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching promotion criteria:', error);
        throw error;
    }
};

export const getPromotionStats = async () => {
    // Simplified stats query since status column doesn't exist
    const query = `
        SELECT 
            COUNT(DISTINCT e.empId) as candidates,
            0 as pendingReviews,  -- Default value
            COUNT(CASE WHEN YEAR(p.promotionDate) = YEAR(CURRENT_DATE) THEN 1 END) as promotionsThisYear,
            94 as successRate  -- Default value
        FROM employee e
        LEFT JOIN promotion p ON e.empId = p.empId
        WHERE e.kpiScore >= 400
    `;

    try {
        const [rows] = await pool.query(query);
        return rows[0] || {
            candidates: 0,
            pendingReviews: 0,
            promotionsThisYear: 0,
            successRate: 0
        };
    } catch (error) {
        console.error('Error fetching promotion stats:', error);
        return {
            candidates: 0,
            pendingReviews: 0,
            promotionsThisYear: 0,
            successRate: 0
        };
    }
};

export const createPromotion = async (promotionData) => {
    const {
        employeeId,
        oldPosition,
        newPosition,
        salaryIncrease,
        effectiveDate,
    } = promotionData;

    // Use parameterized queries to prevent SQL injection
    const query = `
        INSERT INTO promotion (
            empId,
            oldPosition,
            newPosition,
            promotionDate,
            salaryIncrease,
            department
        ) VALUES (?, ?, ?, ?, ?, (
            SELECT department FROM employee WHERE empId = ?
        ))
    `;

    const params = [
        employeeId,
        oldPosition,
        newPosition,
        effectiveDate ? new Date(effectiveDate) : new Date(),
        salaryIncrease || 0,
        employeeId
    ];

    try {
        const [result] = await pool.query(query, params);
        return result.insertId;
    } catch (error) {
        console.error('Error creating promotion:', error);
        throw error;
    }
};