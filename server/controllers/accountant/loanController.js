import * as loanService from '../../services/accountant/loanService.js';

export const getLoanEmployees = async (req, res, next) => {
    try {
        const employees = await loanService.getLoanEmployees();
        res.status(200).json({
            status: 200,
            data: employees,
            message: 'Loan employees fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to fetch loan employees',
            error: error.message
        });
    }
};

export const getLoanApplications = async (req, res, next) => {
    try {
        const applications = await loanService.getLoanApplications();
        res.status(200).json({
            status: 200,
            data: applications,
            message: 'Loan applications fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to fetch loan applications',
            error: error.message
        });
    }
};