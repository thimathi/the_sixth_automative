import * as attendanceModel from '../../models/employee/attendanceModel.js';

export const getMonthlyStats = async (empId) => {
    try {
        if (!empId) {
            return { success: false, error: 'Employee ID is required' };
        }

        const stats = await attendanceModel.getMonthlyStats(empId);
        return { success: true, data: stats };
    } catch (error) {
        console.error('Error in attendanceService.getMonthlyStats:', error);
        return { success: false, error: 'Failed to fetch monthly stats' };
    }
};

export const markAttendance = async (empId) => {
    try {
        // Get current date in IST (GMT+05:30)
        const now = new Date();
        const offset = 330; // IST offset in minutes
        const istTime = new Date(now.getTime() + offset * 60 * 1000);
        const today = istTime.toISOString().split('T')[0];

        // Format time as HH:MM:SS
        const timeString = istTime.toISOString().split('T')[1].split('.')[0];

        // Check existing attendance records for today
        const existing = await attendanceModel.getAttendanceByEmpAndDate(empId, today);

        if (!existing) {
            // First request - check in
            const result = await attendanceModel.checkIn(empId, today, timeString);
            return {
                success: true,
                data: result,
                message: 'Check-in recorded successfully'
            };
        } else if (!existing.outTime) {
            // Second request - check out
            const result = await attendanceModel.checkOut(existing.attendanceId, timeString);
            return {
                success: true,
                data: result,
                message: 'Check-out recorded successfully'
            };
        } else {
            // Already checked in and out
            throw new Error('You have already checked in and checked out today');
        }
    } catch (error) {
        console.error('Error in attendanceService.markAttendance:', error);
        throw error;
    }
};