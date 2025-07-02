import * as salaryService from '../../services/employee/salaryService.js';

export const getCurrentSalary = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await salaryService.getRecords(empId);

        if (!result.success) {
            const statusCode = result.error.includes('not found') ? 404 : 400;
            return res.status(statusCode).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'salary retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getEmployeesalary:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching salary'
        });
    }
};

export const getLatestPayslip = async (req, res) => {
    try {
        const payslip = await salaryService.getLatestPayslip(req.params.empId);
        res.json({ success: true, data: payslip });
    } catch (error) {
        console.error('Error getting latest payslip:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch latest payslip'
        });
    }
};

export const getSalaryHistory = async (req, res) => {
    try {
        const history = await salaryService.getSalaryHistory(req.params.empId);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error getting salary history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch salary history'
        });
    }
};

export const getYearToDateSummary = async (req, res) => {
    try {
        const summary = await salaryService.getYearToDateSummary(req.params.empId);
        res.json({ success: true, data: summary });
    } catch (error) {
        console.error('Error getting year-to-date summary:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch year-to-date summary'
        });
    }
};