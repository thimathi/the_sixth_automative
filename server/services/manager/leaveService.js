import * as  leaveModel from '../../models/manager/leaveModel.js';

export const getLeaveRequests = async (filters) => {
    return leaveModel.getLeaveData(filters);
};
