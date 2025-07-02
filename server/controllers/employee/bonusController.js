import * as bonusService from '../../services/employee/bonusService.js';

export const getEmployeeBonuses = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await bonusService.getEmployeeBonuses(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Bonuses retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getEmployeeBonuses:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching bonuses'
        });
    }
};

/*
export const getBonusStats = async (req, res) => {
    try {
        const { empId } = req.params;
        const stats = await bonusService.getBonusStats(empId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching bonus stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

 */