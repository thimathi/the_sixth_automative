import * as leaveService from '../../services/manager/leaveService.js';

export const getLeaveRequests = async (req, res) => {
    try {
        const leave = await leaveService.getLeaveRequests(req.query);
        res.json({ success: true, data: leave });
    } catch (error) {
        console.error('Error fetching leave:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch leave'
        });
    }
};