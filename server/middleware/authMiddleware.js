import pool from '../config/database.js';

// Role-based access control middleware
export const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const [rows] = await pool.execute(
                'SELECT role FROM employee WHERE empId = ?',
                [req.userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userRole = rows[0].role;

            if (!roles.includes(userRole)) {
                return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
            }

            req.userRole = userRole;
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Specific role middlewares
export const verifyMD = checkRole(['md']);
export const verifyHR = checkRole(['hr']);
export const verifyManager = checkRole(['manager']);
export const verifyAccountant = checkRole(['accountant']);
export const verifyEmployee = checkRole(['employee']);
