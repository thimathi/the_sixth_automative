import * as reportService from '../../services/md/reportService.js';

const validReports = [
    'otReport', 'kpiReport', 'employeeReport',
    'leaveReport', 'loanReport', 'meetingsReport',
    'noPayReport', 'salaryReport'
];

export const autoSaveReport = async (req, res) => {
    try {
        const { empId, reportType, savePath, ...filters } = req.body;

        // Validate inputs
        if (!empId || !reportType || !savePath) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID, report type, and save path are required'
            });
        }

        // Validate save path (basic security check)
        if (path.isAbsolute(savePath) && !savePath.startsWith('C:\\Reports')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid save path'
            });
        }

        const result = await reportService.autoSaveReport(
            empId,
            reportType,
            filters,
            savePath
        );

        res.json(result);
    } catch (error) {
        console.error('Auto-save error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to auto-save report'
        });
    }
};

export const generateReport = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { empId, reportType, ...filters } = req.body;
        console.log('Extracted parameters:', { empId, reportType, filters });

        if (!empId || !reportType) {
            return res.status(400).json({
                success: false,

                error: 'Employee ID and report type are required'
            });
        }

        if (!validReports.includes(reportType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid report type',
                validReports
            });
        }

        const data = await reportService.generateReport(empId, reportType, filters);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Report controller error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate report',
            ...(process.env.NODE_ENV === 'development' && { details: error.stack })
        });
    }
};
