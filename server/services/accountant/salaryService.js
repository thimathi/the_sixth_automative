import * as salaryModel from '../../models/accountant/salaryModel.js';


export const fetchEmployees = async () => {
    try {
        const employees = await salaryModel.getEmployeesForSalaryProcessing();

        return employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            department: emp.department || '',
            position: emp.position || '',
            bank_account: emp.bank_account || '',
            baseSalary: emp.baseSalary || 0,
            allowances: {
                transport: 500,
                meal: 300,
                medical: 200,
                commission: 0
            },
            deductions: {
                epf: emp.epf || 0,
                tax: 0,
                insurance: 1000
            },
            otHours: emp.otHours || 0,
            otRate: emp.otRate || 0,
            bonus: emp.bonus || 0
        }));
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

