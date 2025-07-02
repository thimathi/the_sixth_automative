import * as salaryService from '../../services/accountant/salaryService.js';

export const fetchEmployees = async (req, res) => {
    try {
        const employees = await salaryService.fetchEmployees();
        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch employees'
        });
    }
};
