import * as salaryModel from '../../models/hr/salaryModel.js';
import { trackHROperation } from '../../utils/hrUtils.js';

export const getCurrentSalaries = async (filters) => {
    return salaryModel.getSalaryData(filters);
};

export const getSalaryHistory = async (filters) => {
    return salaryModel.getSalaryHistoryData(filters);
};


export const addOrUpdateSalary = async (data, hrId) => {
    await salaryModel.validateEmployee(data.empId);
    const result = await salaryModel.addOrUpdateSalary(data);

    await trackHROperation(
        'salary_update',
        hrId,
        data.empId,
        {
            basicSalary: data.basicSalary,
            allowances: data.allowances,
            overtimeRate: data.overtimeRate,
            effectiveDate: data.effectiveDate
        }
    );

    return {
        salaries: await getCurrentSalaries(),
        history: await getSalaryHistory()
    };
};