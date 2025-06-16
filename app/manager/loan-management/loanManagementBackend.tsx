import { supabase } from "@/utils/supabase"

interface LoanRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    loanType: string;
    amount: number;
    interestRate: number;
    durationMonths: number;
    requestDate: string;
    status: "Pending" | "Approved" | "Rejected";
    monthlyPayment: number;
    totalRepayment: number;
    reason: string;
    reviewedBy?: string;
    reviewDate?: string;
    reviewComments?: string;
}

interface ApiResponse {
    data: LoanRequest[];
    error: string | null;
}

export const getManagerLoanRequests = async (managerId: string): Promise<ApiResponse> => {
    try {
        // First get all employees who report to this manager
        const { data: teamMembers, error: teamError } = await supabase
            .from('employee')
            .select('empId, first_name, last_name')
            .eq('managerId', managerId)

        if (teamError) throw teamError
        if (!teamMembers || teamMembers.length === 0) {
            return { data: [], error: null }
        }

        // Then get all loan requests for these employees
        const { data: loanRequests, error: loanError } = await supabase
            .from('loanRequest')
            .select(`
        loanRequestId,
        amount,
        duration,
        date,
        interestRate,
        status,
        reason,
        reviewedBy,
        reviewDate,
        reviewComments,
        employee:empId(first_name, last_name, empId),
        loanType:loanTypeId(loanType)
      `)
            .in('empId', teamMembers.map(member => member.empId))
            .order('date', { ascending: false })

        if (loanError) throw loanError

        // Format the data for the frontend
        const formattedData: LoanRequest[] = loanRequests.map((loan: any) => {
            // Calculate monthly payment and total repayment (simple interest)
            const principal = loan.amount
            const rate = loan.interestRate / 100 / 12 // Monthly interest rate
            const periods = loan.duration

            // Simple monthly payment calculation
            const monthlyPayment = (principal * rate * Math.pow(1 + rate, periods)) /
                (Math.pow(1 + rate, periods) - 1)
            const totalRepayment = monthlyPayment * periods

            return {
                id: loan.loanRequestId,
                employeeName: `${loan.employee?.first_name} ${loan.employee?.last_name}`,
                employeeId: loan.employee?.empId,
                loanType: loan.loanType?.loanType || 'Personal',
                amount: loan.amount,
                interestRate: loan.interestRate,
                durationMonths: loan.duration,
                requestDate: loan.date,
                status: loan.status.toLowerCase() === 'approved'
                    ? 'Approved'
                    : loan.status.toLowerCase() === 'rejected'
                        ? 'Rejected'
                        : 'Pending',
                monthlyPayment: isNaN(monthlyPayment) ? 0 : Number(monthlyPayment.toFixed(2)),
                totalRepayment: isNaN(totalRepayment) ? 0 : Number(totalRepayment.toFixed(2)),
                reason: loan.reason,
                reviewedBy: loan.reviewedBy,
                reviewDate: loan.reviewDate,
                reviewComments: loan.reviewComments
            }
        })

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching loan requests:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch loan requests'
        }
    }
}

export const approveLoanRequest = async (
    loanRequestId: string,
    managerId: string,
    comments: string
): Promise<{ error: string | null }> => {
    try {
        const { error } = await supabase
            .from('loanRequest')
            .update({
                status: 'approved',
                reviewedBy: managerId,
                reviewDate: new Date().toISOString(),
                reviewComments: comments
            })
            .eq('loanRequestId', loanRequestId)

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('Error approving loan request:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to approve loan request'
        }
    }
}

export const rejectLoanRequest = async (
    loanRequestId: string,
    managerId: string,
    comments: string
): Promise<{ error: string | null }> => {
    try {
        const { error } = await supabase
            .from('loanRequest')
            .update({
                status: 'rejected',
                reviewedBy: managerId,
                reviewDate: new Date().toISOString(),
                reviewComments: comments
            })
            .eq('loanRequestId', loanRequestId)

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('Error rejecting loan request:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to reject loan request'
        }
    }
}

// Helper function to calculate loan payments
export const calculateLoanPayments = (
    amount: number,
    interestRate: number,
    durationMonths: number
) => {
    const rate = interestRate / 100 / 12 // Monthly interest rate

    // Monthly payment calculation
    const monthlyPayment = (amount * rate * Math.pow(1 + rate, durationMonths)) /
        (Math.pow(1 + rate, durationMonths) - 1)

    const totalRepayment = monthlyPayment * durationMonths
    const totalInterest = totalRepayment - amount

    return {
        monthlyPayment: isNaN(monthlyPayment) ? 0 : Number(monthlyPayment.toFixed(2)),
        totalRepayment: isNaN(totalRepayment) ? 0 : Number(totalRepayment.toFixed(2)),
        totalInterest: isNaN(totalInterest) ? 0 : Number(totalInterest.toFixed(2))
    }
}