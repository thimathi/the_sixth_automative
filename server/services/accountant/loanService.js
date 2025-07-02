import * as loanModel from '../../models/accountant/loanModel.js';

export const getLoanEmployees = async () => {
    try {
        const employees = await loanModel.getLoanEmployees();
        return employees;
    } catch (error) {
        console.error('Error in loanService.getLoanEmployees:', error);
        throw error;
    }
};

export const getLoanApplications = async () => {
    try {
        const applications = await loanModel.getLoanApplications();
        return applications;
    } catch (error) {
        console.error('Error in loanService.getLoanApplications:', error);
        throw error;
    }
};