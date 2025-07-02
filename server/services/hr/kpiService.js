import * as kpiModel from '../../models/hr/kpiModel.js';

export const getKPIData = async (filters) => {
    return kpiModel.getKPIData(filters);
};