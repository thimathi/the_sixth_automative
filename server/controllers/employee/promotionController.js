import * as promotionService from '../../services/employee/promotionService.js';

export const getCurrentPosition = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const position = await promotionService.getCurrentPosition(empId);
        res.json({ success: true, data: position });
    } catch (error) {
        console.error('Error in getCurrentPosition:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch current position'
        });
    }
};

export const getPromotionHistory = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const history = await promotionService.getPromotionHistory(empId);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error in getPromotionHistory:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch promotion history'
        });
    }
};

export const getEligiblePositions = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const positions = await promotionService.getEligiblePositions(empId);
        res.json({ success: true, data: positions });
    } catch (error) {
        console.error('Error in getEligiblePositions:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch eligible positions'
        });
    }
};

export const getPromotionCriteria = async (req, res) => {
    try {
        const empId = req.query.empId;
        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const criteria = await promotionService.getPromotionCriteria(empId);
        res.json({ success: true, data: criteria });
    } catch (error) {
        console.error('Error in getPromotionCriteria:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch promotion criteria'
        });
    }
};