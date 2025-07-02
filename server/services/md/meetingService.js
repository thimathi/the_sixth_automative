import * as meetingModel from '../../models/md/meetingModel.js';

export const getMeetingStats = async () => {
    try {
        return await meetingModel.getMeetingStats();
    } catch (error) {
        throw error;
    }
};

export const getMeeting = async () => {
    try {
        return await meetingModel.getMeeting();
    } catch (error) {
        throw error;
    }
};