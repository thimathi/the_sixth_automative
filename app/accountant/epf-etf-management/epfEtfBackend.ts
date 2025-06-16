import { supabase } from "@/utils/supabase"

export interface Employee {
    id: string
    name: string
    salary: number
    epfNumber: string
    etfNumber: string
    epfBalance: number
    etfBalance: number
    monthlyEpfEmployee: number
    monthlyEpfEmployer: number
    monthlyEtf: number
    department: string
}

export interface EpfEtfContribution {
    id: string
    employeeId: string
    name: string
    month: string
    epfEmployee: number
    epfEmployer: number
    etf: number
    status: string
}

export interface ContributionCalculation {
    epfEmployee: number
    epfEmployer: number
    etf: number
}

export const fetchEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employee')
        .select(`
      empId,
      first_name,
      last_name,
      salary,
      epfNumber:epfNetf(epfNumber),
      etfNumber:epfNetf(etfNumber),
      epfBalance:epfNetf(epfBalance),
      etfBalance:epfNetf(etfBalance),
      department
    `)

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return data.map((emp: any) => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        salary: emp.salary || 0,
        epfNumber: emp.epfNumber?.[0]?.epfNumber || '',
        etfNumber: emp.etfNumber?.[0]?.etfNumber || '',
        epfBalance: emp.epfBalance?.[0]?.epfBalance || 0,
        etfBalance: emp.etfBalance?.[0]?.etfBalance || 0,
        monthlyEpfEmployee: (emp.salary || 0) * 0.08,
        monthlyEpfEmployer: (emp.salary || 0) * 0.08,
        monthlyEtf: (emp.salary || 0) * 0.025,
        department: emp.department || ''
    }))
}

export const fetchEpfEtfContributions = async (): Promise<EpfEtfContribution[]> => {
    const { data, error } = await supabase
        .from('epfNetf')
        .select(`
      epfAndEtfId,
      month:appliedDate,
      epfEmployee:epfCalculation,
      epfEmployer:epfEmployerContribution,
      etf:etfCalculation,
      status,
      employee:empId(first_name, last_name, empId)
    `)
        .order('appliedDate', { ascending: false })

    if (error) {
        console.error('Error fetching EPF/ETF contributions:', error)
        return []
    }

    return data.map((contribution: any) => ({
        id: contribution.epfAndEtfId,
        employeeId: contribution.employee?.empId || '',
        name: `${contribution.employee?.first_name || ''} ${contribution.employee?.last_name || ''}`,
        month: contribution.month || '',
        epfEmployee: contribution.epfEmployee || 0,
        epfEmployer: contribution.epfEmployer || 0,
        etf: contribution.etf || 0,
        status: contribution.status || 'Pending'
    }))
}

export const calculateEmployeeContributions = (salary: number): ContributionCalculation => {
    const epfEmployee = salary * 0.08 // 8% employee contribution
    const epfEmployer = salary * 0.08 // 8% employer contribution
    const etf = salary * 0.025 // 2.5% ETF contribution
    return { epfEmployee, epfEmployer, etf }
}

export const processMonthlyContributions = async (month: string): Promise<boolean> => {
    const employees = await fetchEmployees()

    const contributions = employees.map(emp => ({
        empId: emp.id,
        appliedDate: month,
        epfCalculation: emp.monthlyEpfEmployee,
        epfEmployerContribution: emp.monthlyEpfEmployer,
        etfCalculation: emp.monthlyEtf,
        status: 'Pending'
    }))

    const { error } = await supabase
        .from('epfNetf')
        .insert(contributions)

    if (error) {
        console.error('Error processing contributions:', error)
        return false
    }

    return true
}

export const generateEpfReport = async (): Promise<boolean> => {
    return true
}

export const generateEtfReport = async (): Promise<boolean> => {
    return true
}