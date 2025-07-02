import * as epfEtfModel from '../../models/accountant/epfEtfModel.js';


export const getEmployeeEpfEtfDetails = async (employeeId, year = null) => {
    try {
        return await epfEtfModel.getEmployees(employeeId, year);
    } catch (error) {
        console.error('Error fetching EPF/ETF details:', error);
        throw error;
    }
};
export const processContributions = async (month, accountantId) => {
    try {
        // Validate month format (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(month)) {
            throw new Error('Invalid month format. Use YYYY-MM');
        }

        // Get all active employees for the month
        const employees = await epfEtfModel.getEmployeesForProcessing(month);

        if (!employees || employees.length === 0) {
            throw new Error('No active employees found for the specified month');
        }

        // Process contributions for each employee
        const processedContributions = await Promise.all(
            employees.map(async (employee) => {
                return await epfEtfModel.processEmployeeContributions(
                    employee.empId,
                    employee.basicSalary,
                    month,
                    accountantId
                );
            })
        );

        // Create batch record
        const batchId = await epfEtfModel.createBatchRecord(
            month,
            accountantId,
            processedContributions
        );

        return {
            batchId,
            month,
            totalEmployees: processedContributions.length,
            contributions: processedContributions
        };
    } catch (error) {
        console.error('Error in processContributions service:', error);
        throw error;
    }
};

export const generateEtfReport = async (empId) => {
    try {
        // Validate employee
        const employee = await epfEtfModel.getEmployeeInfo(empId);

        // Get salary data
        const salaryData = await epfEtfModel.getEmployeeSalaryData(empId);

        // Calculate contributions
        const employeeContribution = salaryData.basicSalary * 0.03;
        const employerContribution = salaryData.basicSalary * 0.05;
        const totalContribution = employeeContribution + employerContribution;

        // Get payment history
        const paymentHistory = await epfEtfModel.getEtfPaymentHistory(empId);

        // Prepare response
        const reportData = {
            employee: {
                empId: employee.empId,
                name: `${employee.first_name} ${employee.last_name}`,
                department: employee.department,
                status: employee.status
            },
            salary: {
                basicSalary: salaryData.basicSalary,
                calculationDate: salaryData.lastUpdated,
                dataSource: salaryData.source
            },
            contributions: {
                employee: employeeContribution,
                employer: employerContribution,
                total: totalContribution,
                rates: {
                    employee: '8%',
                    employer: '12%'
                }
            },
            paymentHistory: paymentHistory || [],
            meta: {
                generatedAt: new Date().toISOString()
            }
        };

        return reportData;

    } catch (error) {
        console.error('Service error generating EPF report:', error);
        throw error;
    }
};

export const generateEpfReport = async (empId) => {
    try {
        // Validate employee
        const employee = await epfEtfModel.getEmployeeInfo(empId);

        // Get salary data
        const salaryData = await epfEtfModel.getEmployeeSalaryData(empId);

        // Calculate contributions
        const employeeContribution = salaryData.basicSalary * 0.08;
        const employerContribution = salaryData.basicSalary * 0.12;
        const totalContribution = employeeContribution + employerContribution;

        // Get payment history
        const paymentHistory = await epfEtfModel.getEpfPaymentHistory(empId);

        // Prepare response
        const reportData = {
            employee: {
                empId: employee.empId,
                name: `${employee.first_name} ${employee.last_name}`,
                department: employee.department,
                status: employee.status
            },
            salary: {
                basicSalary: salaryData.basicSalary,
                calculationDate: salaryData.lastUpdated,
                dataSource: salaryData.source
            },
            contributions: {
                employee: employeeContribution,
                employer: employerContribution,
                total: totalContribution,
                rates: {
                    employee: '8%',
                    employer: '12%'
                }
            },
            paymentHistory: paymentHistory || [],
            meta: {
                generatedAt: new Date().toISOString()
            }
        };

        return reportData;

    } catch (error) {
        console.error('Service error generating EPF report:', error);
        throw error;
    }
};