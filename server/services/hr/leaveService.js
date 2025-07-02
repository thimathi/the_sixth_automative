import * as leaveModel from '../../models/hr/leaveModel.js';

export const getleave = async (filters) => {
    return leaveModel.getLeaveData(filters);
};