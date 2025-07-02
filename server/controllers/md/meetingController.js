import * as meetingService from '../../services/md/meetingService.js';

export const getMeetingStats = async (req, res) => {
    try {
        console.log(meetingService);
        const stats = await meetingService.getMeetingStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Meeting stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get meeting statistics'
        });
    }
};

export const getMeeting = async (req, res) => {
    try {
        console.log(meetingService);
        const stats = await meetingService.getMeeting();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Meeting:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get meeting'
        });
    }
};