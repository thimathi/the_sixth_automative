import * as performanceService from '../../services/md/performanceService.js';

export const getPerformanceData = async (req, res) => {
    try {
        const { userId } = req.query;
        const data = await performanceService.getPerformanceData(userId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in performance controller:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch performance data'
        });
    }
};