import * as kpiService from '../../services/hr/kpiService.js';

export const getKPIData = async (req, res) => {
    try {
        const kpi = await kpiService.getKPIData(req.query);
        res.json({ success: true, data: kpi });
    } catch (error) {
        console.error('Error fetching kpi:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch kpi'
        });
    }
};