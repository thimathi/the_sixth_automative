import { supabase } from "@/utils/supabase"

export interface Employee {
    id: string
    name: string
    salary: number
    tenure: number
    creditScore: number
    existingLoans: number
    department: string
}

export interface LoanApplication {
    id: number
    employeeId: string
    name: string
    type: string
    amount: number
    status: string
    eligibility: string
    date: string
}

export interface EligibilityFactor {
    factor: string
    status: string
    score: number
}

export interface EligibilityResult {
    score: number
    level: "High" | "Medium" | "Low"
    recommendation: string
    maxRecommendedAmount: number
    factors: EligibilityFactor[]
    requestedAmount: number
    approved: boolean
}

export const fetchEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employee')
        .select('empId, first_name, last_name, salary, tenure, creditScore, existingLoans, department')
        .order('first_name', { ascending: true })

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return data.map((emp: any) => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        salary: emp.salary || 0,
        tenure: emp.tenure || 0,
        creditScore: emp.creditScore || 0,
        existingLoans: emp.existingLoans || 0,
        department: emp.department || ''
    }))
}

export const fetchLoanApplications = async (): Promise<LoanApplication[]> => {
    const { data, error } = await supabase
        .from('loanRequest')
        .select(`
      loanRequestId,
      amount,
      date,
      status,
      employee:empId (first_name, last_name),
      loanType:loanTypeId (loanType)
    `)
        .order('date', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching loan applications:', error)
        return []
    }

    return data.map((loan: any) => ({
        id: loan.loanRequestId,
        employeeId: loan.employee?.empId || '',
        name: `${loan.employee?.first_name || ''} ${loan.employee?.last_name || ''}`,
        type: loan.loanType?.loanType || '',
        amount: loan.amount || 0,
        status: loan.status || 'Pending',
        eligibility: 'Medium',
        date: loan.date || new Date().toISOString().split('T')[0]
    }))
}

export const checkLoanEligibility = async (
    employeeId: string,
    loanAmount: number,
    loanType: string
): Promise<EligibilityResult> => {
    // Fetch employee details
    const { data: employeeData, error: employeeError } = await supabase
        .from('employee')
        .select('empId, first_name, last_name, salary, tenure, creditScore, existingLoans, department')
        .eq('empId', employeeId)
        .single()

    if (employeeError || !employeeData) {
        console.error('Error fetching employee:', employeeError)
        throw new Error('Failed to fetch employee data')
    }

    const employee = {
        id: employeeData.empId,
        name: `${employeeData.first_name} ${employeeData.last_name}`,
        salary: employeeData.salary || 0,
        tenure: employeeData.tenure || 0,
        creditScore: employeeData.creditScore || 0,
        existingLoans: employeeData.existingLoans || 0,
        department: employeeData.department || ''
    }

    const maxLoanAmount = employee.salary * 3
    const debtToIncomeRatio = (employee.existingLoans + loanAmount / 12) / (employee.salary / 12)

    let eligibilityScore = 0
    const factors: EligibilityFactor[] = []

    if (employee.salary >= 40000) {
        eligibilityScore += 25
        factors.push({ factor: "Salary", status: "Good", score: 25 })
    } else {
        eligibilityScore += 15
        factors.push({ factor: "Salary", status: "Average", score: 15 })
    }

    if (employee.tenure >= 24) {
        eligibilityScore += 25
        factors.push({ factor: "Tenure", status: "Good", score: 25 })
    } else {
        eligibilityScore += 10
        factors.push({ factor: "Tenure", status: "Poor", score: 10 })
    }

    if (employee.creditScore >= 700) {
        eligibilityScore += 30
        factors.push({ factor: "Credit Score", status: "Excellent", score: 30 })
    } else if (employee.creditScore >= 650) {
        eligibilityScore += 20
        factors.push({ factor: "Credit Score", status: "Good", score: 20 })
    } else {
        eligibilityScore += 10
        factors.push({ factor: "Credit Score", status: "Poor", score: 10 })
    }

    if (debtToIncomeRatio <= 0.3) {
        eligibilityScore += 20
        factors.push({ factor: "Debt-to-Income", status: "Good", score: 20 })
    } else {
        eligibilityScore += 5
        factors.push({ factor: "Debt-to-Income", status: "High", score: 5 })
    }

    let eligibilityLevel: "High" | "Medium" | "Low" = "Low"
    let recommendation = "Loan application may be rejected"
    let maxRecommendedAmount = employee.salary * 1.5

    if (eligibilityScore >= 80) {
        eligibilityLevel = "High"
        recommendation = "Excellent candidate for loan approval"
        maxRecommendedAmount = employee.salary * 3
    } else if (eligibilityScore >= 60) {
        eligibilityLevel = "Medium"
        recommendation = "Good candidate with some conditions"
        maxRecommendedAmount = employee.salary * 2
    }

    return {
        score: eligibilityScore,
        level: eligibilityLevel,
        recommendation,
        maxRecommendedAmount,
        factors,
        requestedAmount: loanAmount,
        approved: loanAmount <= maxRecommendedAmount && eligibilityScore >= 60,
    }
}

export const submitLoanApplication = async (
    employeeId: string,
    loanType: string,
    amount: number,
    eligibility: string
): Promise<boolean> => {
    const { data: loanTypeData, error: loanTypeError } = await supabase
        .from('loanType')
        .select('loanTypeId')
        .eq('loanType', loanType)
        .single()

    if (loanTypeError || !loanTypeData) {
        console.error('Error finding loan type:', loanTypeError)
        return false
    }

    const { error } = await supabase
        .from('loanRequest')
        .insert([
            {
                empId: employeeId,
                loanTypeId: loanTypeData.loanTypeId,
                amount,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0],
                duration: 12 // Default duration, adjust as needed
            }
        ])

    if (error) {
        console.error('Error submitting loan application:', error)
        return false
    }

    return true
}