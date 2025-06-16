import { supabase } from "@/utils/supabase"

export interface Employee {
    id: string
    name: string
    department: string
    baseSalary: number
    allowances: {
        transport: number
        meal: number
        medical: number
        commission?: number
    }
    deductions: {
        epf: number
        tax: number
        insurance: number
    }
    otHours: number
    otRate: number
    bonus: number
}

export interface Payroll {
    id: string
    employeeId: string
    name: string
    month: string
    grossSalary: number
    deductions: number
    netSalary: number
    status: string
}

export interface SalaryCalculation {
    monthlySalary: string
    totalAllowances: string
    otAmount: string
    bonus: string
    grossSalary: string
    totalDeductions: string
    netSalary: string
}

export const fetchEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employee')
        .select(`
      empId,
      first_name,
      last_name,
      department,
      otHours,
      otRate,
      salary:salary(basicSalary),
      bonus:bonus(amount),
      epfNetf:epfNetf(epfCalculation, etfCalculation)
    `)

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return data.map((emp: any) => ({
        id: emp.empId,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department || '',
        baseSalary: emp.salary?.[0]?.basicSalary || 0,
        allowances: {
            transport: 500,
            meal: 300,
            medical: 200,
            commission: 0
        },
        deductions: {
            epf: emp.epfNetf?.[0]?.epfCalculation || 0,
            tax: 0,
            insurance: 1000
        },
        otHours: emp.otHours || 0,
        otRate: emp.otRate || 0,
        bonus: emp.bonus?.[0]?.amount || 0
    }))
}

export const fetchPayrollHistory = async (): Promise<Payroll[]> => {
    const { data, error } = await supabase
        .from('salary')
        .select(`
      salaryId,
      basicSalary,
      otPay,
      bonusPay,
      totalSalary,
      salaryDate,
      employee:empId(first_name, last_name, empId)
    `)
        .order('salaryDate', { ascending: false })

    if (error) {
        console.error('Error fetching payroll history:', error)
        return []
    }

    return data.map((salary: any) => ({
        id: salary.salaryId,
        employeeId: salary.employee?.empId || '',
        name: `${salary.employee?.first_name || ''} ${salary.employee?.last_name || ''}`,
        month: salary.salaryDate ? new Date(salary.salaryDate).toISOString().slice(0, 7) : '',
        grossSalary: (salary.basicSalary + salary.otPay + salary.bonusPay) || 0,
        deductions: (salary.basicSalary * 0.08) + 1000, // EPF + insurance (simplified)
        netSalary: salary.totalSalary || 0,
        status: 'Paid' // Default status
    }))
}

export const calculateSalary = (employee: Employee): SalaryCalculation => {
    const monthlySalary = employee.baseSalary / 12
    const totalAllowances = Object.values(employee.allowances).reduce((sum, val) => sum + val, 0)
    const totalDeductions = Object.values(employee.deductions).reduce((sum, val) => sum + val, 0)
    const otAmount = employee.otHours * employee.otRate

    const grossSalary = monthlySalary + totalAllowances + otAmount + employee.bonus
    const netSalary = grossSalary - totalDeductions

    return {
        monthlySalary: monthlySalary.toFixed(2),
        totalAllowances: totalAllowances.toFixed(2),
        otAmount: otAmount.toFixed(2),
        bonus: employee.bonus.toFixed(2),
        grossSalary: grossSalary.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        netSalary: netSalary.toFixed(2)
    }
}

export const processPayroll = async (
    employeeId: string,
    month: string,
    grossSalary: number,
    deductions: number,
    netSalary: number
): Promise<boolean> => {
    const { error } = await supabase
        .from('salary')
        .insert([{
            empId: employeeId,
            basicSalary: grossSalary - deductions,
            otPay: 0,
            bonusPay: 0,
            totalSalary: netSalary,
            salaryDate: `${month}-01`
        }])

    if (error) {
        console.error('Error processing payroll:', error)
        return false
    }

    return true
}

export const generatePayslip = async (employeeId: string, month: string): Promise<boolean> => {
    return true
}