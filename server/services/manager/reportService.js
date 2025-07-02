import * as reportModel from '../../models/manager/reportModel.js';

export const getTemplates = async (filters) => {
    return reportModel.getTemplates(filters);
};


export const getScheduledReports = async (filters) => {
    return reportModel.getScheduledReports(filters);
}


export async function getRecentReports(filters) {
    return reportModel.getRecentReports(filters);
}

