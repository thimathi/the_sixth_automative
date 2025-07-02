import * as incrementService from '../../services/employee/incrementService.js';

export const getIncrementDetails = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await incrementService.getIncrementDetails(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Increment details retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getIncrementDetails:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching increment details'
        });
    }
};

export const getIncrementHistory = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await incrementService.getIncrementHistory(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Increment history retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getIncrementHistory:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching increment history'
        });
    }
};