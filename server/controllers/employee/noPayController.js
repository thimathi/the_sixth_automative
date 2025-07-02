import * as noPayService from '../../services/employee/noPayService.js';

export const getRecords = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await noPayService.getRecords(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'noPay retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getEmployeenoPay:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching noPay'
        });
    }
};

export const getStats = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const stats = await noPayService.getStats(empId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch no-pay stats'
        });
    }
};

export const getPolicies = async (req, res) => {
    try {
        const policies = await noPayService.getPolicies();
        res.json({ success: true, data: policies });
    } catch (error) {
        console.error('Error in getPolicies:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch no-pay policies'
        });
    }
};