import * as attendanceService from "../../services/employee/attendanceService.js";

export const markAttendance = async (req, res) => {
    try {
        const { empId } = req.body;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        const result = await attendanceService.markAttendance(empId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to mark attendance'
        });
    }
};


export const getMonthlyStats = async (req, res) => {
    try {
        const empId = req.query.empId;

        if (!empId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required as query parameter'
            });
        }

        const result = await attendanceService.getMonthlyStats(empId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in getMonthlyStats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch monthly stats'
        });
    }
};