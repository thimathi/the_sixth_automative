import * as salaryService from '../../services/hr/salaryService.js';

export const getSalaries = async (req, res) => {
    try {
        const salary = await salaryService.getCurrentSalaries(req.query);
        res.json({ success: true, data: salary });
    } catch (error) {
        console.error('Error fetching salary:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch salary'
        });
    }
};

export const getSalaryHistory = async (req, res) => {
    try {
        const salaryHistory = await salaryService.getSalaryHistory(req.query);
        res.json({ success: true, data: salaryHistory });
    } catch (error) {
        console.error('Error fetching salary history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch salary history'
        });
    }
};

export const addOrUpdateSalary = async (req, res) => {
    try {
        const result = await salaryService.addOrUpdateSalary(req.body, req.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error adding/updating salary:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to add/update salary'
        });
    }
};