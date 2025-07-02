import * as taskModel from '../../models/manager/taskModel.js';

export const getTasks = async (filters) => {
    return taskModel.getTasks(filters);
};


