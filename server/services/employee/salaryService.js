import * as salaryModel from '../../models/employee/salaryModel.js';

export async function getRecords(empId) {
    try {
        if (!empId) {
            return {
                success: false,
                error: 'Employee ID is required'
            };
        }

        const applications = await salaryModel.getSalaryRecords(empId);

        return {
            success: true,
            data: applications || [] // Return empty array if no applications exist
        };
    } catch (error) {
        console.error('Error in getSalary:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch salary'
        };
    }
}


export const getLatestPayslip = async (empId) => {
    try {
        return await salaryModel.getLatestPayslip(empId);
    } catch (error) {
        console.error('Salary Service Error - getLatestPayslip:', error);
        throw new Error(`Failed to get latest payslip: ${error.message}`);
    }
};

export const getSalaryHistory = async (empId) => {
    try {
        return await salaryModel.getSalaryHistory(empId);
    } catch (error) {
        console.error('Salary Service Error - getSalaryHistory:', error);
        throw new Error(`Failed to get salary history: ${error.message}`);
    }
};

export const getYearToDateSummary = async (empId) => {
    try {
        return await salaryModel.getYearToDateSummary(empId);
    } catch (error) {
        console.error('Salary Service Error - getYearToDateSummary:', error);
        throw new Error(`Failed to get year-to-date summary: ${error.message}`);
    }
};