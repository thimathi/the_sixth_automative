import * as epfEtfService from '../../services/accountant/epfEtfService.js';

export const getEmployees = async (req, res) => {
    try {
        const { empId, year } = req.query;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const contributions = await epfEtfService.getEmployeeEpfEtfDetails(empId, year);
        res.json({ success: true, data: contributions });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch EPF/ETF details'
        });
    }
};

export const generateEpfReport = async (req, res) => {
    try {
        const { empId } = req.query;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required',
                code: 'EMP400'
            });
        }

        const report = await epfEtfService.generateEpfReport(empId);

        return res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Controller error generating EPF report:', error);

        if (error.type === 'EMPLOYEE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: error.message,
                code: error.code
            });
        } else if (error.type === 'EMPLOYEE_INACTIVE') {
            return res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
                employee: error.employeeData || {
                    name: 'Unknown employee',
                    status: 'Unknown'
                }
            });
        } else if (error.type === 'SALARY_DATA_MISSING') {
            return res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
                details: {
                    ...error.details,
                    actionRequired: true,
                    contact: 'hr@company.com'
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error while generating EPF report',
            code: 'SRV500',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};

export const generateEtfReport = async (req, res) => {
    try {
        const { empId } = req.query;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required',
                code: 'EMP400'
            });
        }

        const report = await epfEtfService.generateEtfReport(empId);

        return res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('Controller error generating ETF report:', error);

        if (error.type === 'EMPLOYEE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: error.message,
                code: error.code
            });
        } else if (error.type === 'EMPLOYEE_INACTIVE') {
            return res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
                employee: error.employeeData || {
                    name: 'Unknown employee',
                    status: 'Unknown'
                }
            });
        } else if (error.type === 'SALARY_DATA_MISSING') {
            return res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
                details: {
                    ...error.details,
                    actionRequired: true,
                    contact: 'hr@company.com'
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error while generating ETF report',
            code: 'SRV500',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};