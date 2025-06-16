import { supabase } from "@/utils/supabase";

interface LoanApplication {
    loanId: string;
    type: string;
    amount: number;
    purpose: string;
    appliedDate: string;
    status: string;
    repaymentPeriod: number;
    monthlyPayment: number;
    interestRate: number;
}

interface LoanType {
    type: string;
    maxAmount: number;
    interestRate: string;
    maxTenure: string;
    description: string;
}

interface EmployeeProfile {
    salary: number;
    tenure: number;
    creditScore: number;
    existingLoans: number;
    maxEligibleAmount: number;
}

export const getEmployeeProfile = async (empId: string): Promise<EmployeeProfile> => {
    try {
        const { data: employee, error } = await supabase
            .from('employee')
            .select('salary, tenure, creditScore, existingLoans')
            .eq('empId', empId)
            .single();

        if (error) throw error;

        return {
            salary: employee.salary || 0,
            tenure: employee.tenure || 0,
            creditScore: employee.creditScore || 0,
            existingLoans: employee.existingLoans || 0,
            maxEligibleAmount: (employee.salary || 0) * 3 // 3x annual salary
        };
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employee profile');
    }
};

export const getLoanApplications = async (empId: string): Promise<LoanApplication[]> => {
    try {
        const { data: loans, error } = await supabase
            .from('loanRequest')
            .select('*, loanType:loanTypeId(*)')
            .eq('empId', empId)
            .order('date', { ascending: false });

        if (error) throw error;

        return loans?.map(loan => ({
            loanId: loan.loanRequestId,
            type: loan.loanType?.loanType || 'Unknown',
            amount: loan.amount || 0,
            purpose: loan.purpose || '',
            appliedDate: loan.date || loan.created_at.split('T')[0],
            status: loan.status || 'Pending',
            repaymentPeriod: loan.duration || 0,
            monthlyPayment: calculateMonthlyPayment(
                loan.amount || 0,
                loan.interestRate || 8,
                loan.duration || 12
            ),
            interestRate: loan.interestRate || 8
        })) || [];
    } catch (error) {
        console.error('Error fetching loan applications:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch loan applications');
    }
};

export const getLoanTypes = async (): Promise<LoanType[]> => {
    try {
        const { data: loanTypes, error } = await supabase
            .from('loanType')
            .select('*');

        if (error) throw error;

        return loanTypes?.map(type => ({
            type: type.loanType || 'Unknown',
            maxAmount: type.maxAmount || 0,
            interestRate: `${type.minInterestRate || 0}% - ${type.maxInterestRate || 0}%`,
            maxTenure: `${type.maxDuration || 0} months`,
            description: type.description || ''
        })) || [];
    } catch (error) {
        console.error('Error fetching loan types:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch loan types');
    }
};

export const submitLoanApplication = async (
    empId: string,
    loanData: {
        type: string;
        amount: number;
        purpose: string;
        repaymentPeriod: number;
    }
): Promise<void> => {
    try {
        // First get the loanTypeId based on the type
        const { data: loanType, error: typeError } = await supabase
            .from('loanType')
            .select('loanTypeId')
            .eq('loanType', loanData.type)
            .single();

        if (typeError) throw typeError;

        // Calculate interest rate (simplified - in real app this would be more complex)
        const interestRate = calculateInterestRate(
            loanData.type,
            loanData.amount,
            loanData.repaymentPeriod
        );

        const { error } = await supabase
            .from('loanRequest')
            .insert([{
                empId,
                loanTypeId: loanType.loanTypeId,
                amount: loanData.amount,
                purpose: loanData.purpose,
                duration: loanData.repaymentPeriod,
                interestRate,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0]
            }]);

        if (error) throw error;

        // Optionally upload attachment if needed
        // await handleLoanAttachmentUpload(empId, loanId, file);

    } catch (error) {
        console.error('Error submitting loan application:', error);
        throw error instanceof Error ? error : new Error('Failed to submit loan application');
    }
};

// Helper functions
function calculateMonthlyPayment(amount: number, interestRate: number, months: number): number {
    const monthlyRate = interestRate / 100 / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function calculateInterestRate(type: string, amount: number, months: number): number {
    // Simplified calculation - in a real app this would be more complex
    const baseRates: Record<string, number> = {
        'Personal Loan': 8.5,
        'Vehicle Loan': 9.0,
        'Emergency Loan': 6.0,
        'Education Loan': 7.0
    };
    return baseRates[type] || 8.0;
}

// Optional: For file attachments
export const handleLoanAttachmentUpload = async (
    empId: string,
    loanId: string,
    file: File
): Promise<string> => {
    try {
        const filePath = `loan-attachments/${empId}/${loanId}/${file.name}`;

        const { error: uploadError } = await supabase
            .storage
            .from('loan-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('loan-attachments')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading loan attachment:', error);
        throw error instanceof Error ? error : new Error('Failed to upload loan attachment');
    }
};