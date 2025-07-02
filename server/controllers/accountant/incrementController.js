import * as incrementService from '../../services/accountant/incrementService.js';

export const getEmployees = async (req, res) => {
    try {
        const { empId } = req.query;
        const employees = await incrementService.getEmployees(empId);
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch employees'
        });
    }
};

export const getIncrementHistory = async (req, res) => {
    try {
        const { empId } = req.query;
        const history = await incrementService.getIncrementHistory(empId);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch increment history'
        });
    }
};