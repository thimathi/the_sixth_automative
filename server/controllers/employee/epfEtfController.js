import * as epfEtfService from '../../services/employee/epfEtfService.js';

export const getDetails = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await epfEtfService.getEPFETFDetails(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'EPF/ETF details retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getDetails:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching EPF/ETF details'
        });
    }
};

export const getHistory = async (req, res) => {
    try {
        const empId = req.params.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as path parameter'
            });
        }

        const result = await epfEtfService.getContributionHistory(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Contribution history retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching contribution history'
        });
    }
};