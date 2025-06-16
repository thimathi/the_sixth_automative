import { supabase } from "@/utils/supabase"

export interface Employee {
    id: string
    name: string
    department: string
    hourlyRate: number
    regularHours: number
}

export interface OTRecord {
    id: string
    employeeId: string
    name: string
    date: string
    otHours: number
    rate: number
    amount: number
    type: string
    status: string
}

export interface OTCalculation {
    hours: number
    rate: number
    amount: number
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
      regularHours
    `)

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return data.map((emp: any) => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department || '',
        hourlyRate: emp.salary?.[0]?.basicSalary ? emp.salary[0].basicSalary / 2080 : 0,
        regularHours: emp.regularHours || 40
    }))
}

export const fetchOTRecords = async (): Promise<OTRecord[]> => {
    const { data, error } = await supabase
        .from('ot')
        .select(`
      otId,
      otHours,
      rate,
      amount,
      date:created_at,
      type,
      status,
      employee:empId(first_name, last_name, empId)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching OT records:', error)
        return []
    }

    return data.map((record: any) => ({
        id: record.otId,
        employeeId: record.employee?.empId || '',
        name: `${record.employee?.first_name || ''} ${record.employee?.last_name || ''}`,
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        otHours: record.otHours || 0,
        rate: record.rate || 0,
        amount: record.amount || 0,
        type: record.type || 'regular',
        status: record.status || 'Pending'
    }))
}

export const calculateOTPayment = async (
    employeeId: string,
    hours: number,
    type: string,
    hourlyRate: number
): Promise<OTCalculation> => {
    if (hours <= 0 || hourlyRate <= 0) {
        throw new Error("Invalid input parameters")
    }

    let multiplier = 1.5
    switch (type) {
        case "weekend":
            multiplier = 2.0
            break
        case "holiday":
            multiplier = 2.5
            break
        case "night":
            multiplier = 1.75
            break
        default:
            multiplier = 1.5
    }

    const rate = hourlyRate * multiplier
    const amount = hours * rate

    return {
        hours,
        rate: parseFloat(rate.toFixed(2)),
        amount: parseFloat(amount.toFixed(2))
    }
}

export const submitOTRequest = async (
    employeeId: string,
    hours: number,
    rate: number,
    amount: number,
    date: string,
    type: string,
    status: string
): Promise<boolean> => {
    const { error } = await supabase
        .from('ot')
        .insert([{
            empId: employeeId,
            otHours: hours,
            rate: rate,
            amount: amount,
            date: date,
            type: type,
            status: status
        }])

    if (error) {
        console.error('Error submitting OT request:', error)
        return false
    }

    return true
}

export const approveOTRequest = async (otId: string): Promise<boolean> => {
    // First update the OT record status
    const { error: otError } = await supabase
        .from('ot')
        .update({ status: 'Approved' })
        .eq('otId', otId)

    if (otError) {
        console.error('Error approving OT request:', otError)
        return false
    }

    const { data: otData, error: fetchError } = await supabase
        .from('ot')
        .select('empId, amount')
        .eq('otId', otId)
        .single()

    if (fetchError || !otData) {
        console.error('Error fetching OT details:', fetchError)
        return false
    }

    const { error: salaryError } = await supabase
        .from('salary')
        .update({ otPay: otData.amount })
        .eq('empId', otData.empId)

    if (salaryError) {
        console.error('Error updating salary record:', salaryError)
        return false
    }

    return true
}