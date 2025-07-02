import * as otService from '../../services/accountant/otService.js';

export const fetchEmployees = async (req, res) => {
    try {
        const employees = await otService.fetchEmployees();
        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch employees'
        });
    }
};

export const fetchOTRecords = async (req, res) => {
    try {
        const { status, type, startDate, endDate } = req.query;
        const records = await otService.fetchOTRecords({ status, type, startDate, endDate });
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Error fetching OT records:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch OT records'
        });
    }
};

export const calculateOTPayment = async (req, res) => {
    try {
        const { employeeId, hours, type } = req.body;

        if (!employeeId || !hours || !type) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID, hours, and type are required'
            });
        }

        const result = await otService.calculateOTPayment(employeeId, hours, type);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error calculating OT payment:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to calculate OT payment'
        });
    }
};

export const submitOTRequest = async (req, res) => {
    try {
        const success = await otService.submitOTRequest({
            ...req.body,
            accountantId: req.userId
        });

        res.json({
            success: true,
            data: { submitted: success }
        });
    } catch (error) {
        console.error('Error submitting OT request:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit OT request'
        });
    }
};

export const approveOTRequest = async (req, res) => {
    try {
        const { otId } = req.params;

        if (!otId) {
            return res.status(400).json({
                success: false,
                error: 'OT ID is required'
            });
        }

        const success = await otService.approveOTRequest(otId, req.userId);

        res.json({
            success: true,
            data: { approved: success }
        });
    } catch (error) {
        console.error('Error approving OT request:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to approve OT request'
        });
    }
};

export const getOTReport = async (req, res) => {
    try {
        const { startDate, endDate, status, type } = req.query;
        const report = await otService.generateOTReport({
            startDate,
            endDate,
            status,
            type
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=OT_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        res.send(report);
    } catch (error) {
        console.error('Error generating OT report:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate OT report'
        });
    }
};