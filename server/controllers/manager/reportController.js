import * as reportService from '../../services/manager/reportService.js';

export const getTemplates = async (req, res) => {
try{
    const templates = await reportService.getTemplates();
    res.json({ success: true, data: templates });
} catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch templates'
    });
}
};

export const getRecentReports = async (req, res) => {
    try{
        const reports = await reportService.getRecentReports();
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch reports'
        });
    }
};

export const getScheduledReports = async (req, res) => {
    try{
        const scheduledreports = await reportService.getScheduledReports();
        res.json({ success: true, data: scheduledreports });
    } catch (error) {
        console.error('Error fetching scheduled reports:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch scheduled reports'
        });
    }
};
