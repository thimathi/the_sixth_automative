import * as loanService from '../../services/manager/loanService.js';

export const getLoanRequests = async (req, res) => {
        try {
            const loan = await loanService.getLoanRequests(req.query);
            res.json({ success: true, data: loan });
        } catch (error) {
            console.error('Error fetching loan:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch loan'
            });
        }
};

export const approveLoanRequest = async (req, res) => {
    try {
        const { loanRequestId, status } = req.body;

        // Validate required fields
        if (!loanRequestId || !status) {
            throw new Error('loanRequestId and status are required');
        }

        const approveLoan = await loanService.approveLoanRequest(loanRequestId, { status });
        res.status(200).json({
            success: true,
            message: 'Successfully approved loan',
            data: approveLoan
        });
    } catch (error) {
        console.error('Error approve loan:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to approve loan'
        });
    }
};

export const rejectLoanRequest = async (req, res) => {
    try {
        const { loanRequestId, status } = req.body;

        // Validate required fields
        if (!loanRequestId || !status) {
            throw new Error('loanRequestId and status are required');
        }

        const approveLoan = await loanService.rejectLoanRequest(loanRequestId, { status });
        res.status(200).json({
            success: true,
            message: 'Successfully rejected loan',
            data: approveLoan
        });
    } catch (error) {
        console.error('Error approve loan:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to reject loan'
        });
    }
};
