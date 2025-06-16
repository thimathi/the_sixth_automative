import { supabase } from "@/utils/supabase"

export interface Employee {
    id: string
    name: string
    department: string
    currentSalary: number
    lastIncrement: string
    performance: string
    tenure: number
}

export interface IncrementHistory {
    id: string
    employeeId: string
    name: string
    type: string
    previousSalary: number
    newSalary: number
    amount: number
    percentage: number
    effectiveDate: string
    status: string
}

export interface PendingIncrement {
    id: string
    employeeId: string
    name: string
    type: string
    amount: number
    status: string
}

export interface IncrementCalculation {
    amount: number
    percentage: number
    newSalary: number
    type: string
    performanceFactor?: number
    marketAdjustment?: number
    tenureFactor?: number
}

export const fetchEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employee')
        .select(`
      empId,
      first_name,
      last_name,
      department,
      salary:salary(basicSalary),
      lastIncrement:increment(lastIncrementDate),
      performance:kpi(kpiRanking(kpiRank)),
      tenure
    `)

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return data.map((emp: any) => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department || '',
        currentSalary: emp.salary?.[0]?.basicSalary || 0,
        lastIncrement: emp.lastIncrement?.[0]?.lastIncrementDate || '',
        performance: emp.performance?.[0]?.kpiRanking?.kpiRank || 'Average',
        tenure: emp.tenure || 0
    }))
}

export const fetchIncrementHistory = async (): Promise<IncrementHistory[]> => {
    const { data, error } = await supabase
        .from('increment')
        .select(`
      incrementId,
      amount,
      percentage:percenatge,
      effectiveDate:lastIncrementDate,
      status:approval,
      type,
      employee:empId(first_name, last_name, empId),
      previousSalary:salary(basicSalary)
    `)
        .order('lastIncrementDate', { ascending: false })

    if (error) {
        console.error('Error fetching increment history:', error)
        return []
    }

    return data.map((inc: any) => ({
        id: inc.incrementId,
        employeeId: inc.employee?.empId || '',
        name: `${inc.employee?.first_name || ''} ${inc.employee?.last_name || ''}`,
        type: inc.type || '',
        previousSalary: inc.previousSalary?.[0]?.basicSalary || 0,
        newSalary: (inc.previousSalary?.[0]?.basicSalary || 0) + (inc.amount || 0),
        amount: inc.amount || 0,
        percentage: inc.percentage || 0,
        effectiveDate: inc.effectiveDate || '',
        status: inc.status || 'Approved'
    }))
}

export const fetchPendingIncrements = async (): Promise<PendingIncrement[]> => {
    const { data, error } = await supabase
        .from('increment')
        .select(`
      incrementId,
      amount,
      type,
      status:approval,
      employee:empId(first_name, last_name, empId)
    `)
        .eq('approval', 'Pending')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending increments:', error)
        return []
    }

    return data.map((inc: any) => ({
        id: inc.incrementId,
        employeeId: inc.employee?.empId || '',
        name: `${inc.employee?.first_name || ''} ${inc.employee?.last_name || ''}`,
        type: inc.type || '',
        amount: inc.amount || 0,
        status: inc.status || 'Pending'
    }))
}

export const calculateIncrement = async (
    employeeId: string,
    incrementType: string,
    currentSalary: number,
    performance: string,
    tenure: number
): Promise<IncrementCalculation> => {
    // Base calculation factors
    const calculationFactors = {
        annual: 0.05,
        performance: 0.07,
        promotion: 0.15,
        market: 0.08
    }

    const performanceMultipliers = {
        'Excellent': 1.4,
        'Good': 1.2,
        'Average': 1.0,
        'Below Average': 0.8
    }

    const tenureFactor = Math.min(tenure / 12 * 0.01, 0.05)

    const marketAdjustment = 0.02
    let basePercentage = calculationFactors[incrementType as keyof typeof calculationFactors] || 0.05
    let performanceFactor = performanceMultipliers[performance as keyof typeof performanceMultipliers] || 1.0

    if (incrementType === 'performance') {
        basePercentage = basePercentage * performanceFactor
    }

    if (incrementType === 'annual') {
        basePercentage += tenureFactor
    }

    if (incrementType !== 'promotion') {
        basePercentage += marketAdjustment
    }

    const finalPercentage = Math.min(basePercentage, 0.25)
    const amount = currentSalary * finalPercentage
    const newSalary = currentSalary + amount

    return {
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat((finalPercentage * 100).toFixed(1)),
        newSalary: parseFloat(newSalary.toFixed(2)),
        type: incrementType,
        performanceFactor: incrementType === 'performance' ? parseFloat((performanceFactor * 100).toFixed(1)) : undefined,
        marketAdjustment: incrementType !== 'promotion' ? parseFloat((marketAdjustment * 100).toFixed(1)) : undefined,
        tenureFactor: incrementType === 'annual' ? parseFloat((tenureFactor * 100).toFixed(1)) : undefined
    }
}

export const processIncrement = async (
    employeeId: string,
    incrementType: string,
    currentSalary: number,
    amount: number,
    effectiveDate: string,
    remarks: string,
    calculationDetails: Omit<IncrementCalculation, 'amount' | 'percentage' | 'newSalary'>
): Promise<boolean> => {
    const percentage = (amount / currentSalary) * 100
    const newSalary = currentSalary + amount

    const { error } = await supabase
        .from('increment')
        .insert([{
            empId: employeeId,
            type: incrementType,
            percenatge: percentage,
            amount: amount,
            lastIncrementDate: effectiveDate,
            nextIncrementDate: new Date(new Date(effectiveDate).setFullYear(new Date(effectiveDate).getFullYear() + 1)).toISOString().split('T')[0],
            approval: 'Pending',
            remarks: remarks,
            calculation_details: {
                performanceFactor: calculationDetails.performanceFactor,
                marketAdjustment: calculationDetails.marketAdjustment,
                tenureFactor: calculationDetails.tenureFactor,
                baseSalary: currentSalary,
                newSalary: newSalary
            }
        }])

    if (error) {
        console.error('Error processing increment:', error)
        return false
    }

    return true
}

export const approveIncrement = async (incrementId: string): Promise<boolean> => {
    const { data: incrementData, error: fetchError } = await supabase
        .from('increment')
        .select('empId, amount, calculation_details')
        .eq('incrementId', incrementId)
        .single()

    if (fetchError || !incrementData) {
        console.error('Error fetching increment details:', fetchError)
        return false
    }

    const { error: salaryError } = await supabase
        .from('salary')
        .update({
            basicSalary: incrementData.calculation_details?.newSalary || 0,
            incrementPay: incrementData.amount
        })
        .eq('empId', incrementData.empId)

    if (salaryError) {
        console.error('Error updating salary:', salaryError)
        return false
    }

    const { error: incrementError } = await supabase
        .from('increment')
        .update({ approval: 'Approved' })
        .eq('incrementId', incrementId)

    if (incrementError) {
        console.error('Error approving increment:', incrementError)
        return false
    }

    return true
}