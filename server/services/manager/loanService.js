import * as loanModel from '../../models/manager/loanModel.js';

export const getLoanRequests = async (filters) => {
    return loanModel.getLoanRequests(filters);
};

export const approveLoanRequest = async (loanRequestId, loanData) => {
   try{
       return await loanModel.approveLoanRequest(loanRequestId, loanData);
   }
   catch(error){
       console.log(error);
       throw error;
   }
};

export const rejectLoanRequest = async (loanRequestId, loanData) => {
    try{
        return await loanModel.rejectLoanRequest(loanRequestId, loanData);
    }
    catch(error){
        console.log(error);
        throw error;
    }
};