import * as employeeModel from '../../models/hr/employeeModel.js';

export const getEmployees = async (filters) => {
    return employeeModel.getEmployees(filters);
};

export const getDepartments = async () => {
    try {
        return await employeeModel.getDepartments();
    } catch (error) {
        console.error('Error in employeeService.getDepartments:', error);
        throw error;
    }
};

export const createDepartment = async (departmentData) => {
    try {
        return await employeeModel.createDepartment(departmentData);
    } catch (error) {
        console.error('Error in employeeService.createDepartment:', error);
        throw error;
    }
};


export const updateDepartment = async (departmentId, departmentData) => {
    try {
        return await employeeModel.updateDepartment(departmentId, departmentData);
    } catch (error) {
        console.error('Error in employeeService.updateDepartment:', error);
        throw error;
    }
};

export const updateEmployee = async (empId, employeeData) => {
    try {
        return await employeeModel.updateEmployee(empId, employeeData);
    } catch (error) {
        console.error('Error in employeeService.updateEmployee:', error);
        throw error;
    }
};

export const deleteDepartment = async (departmentId) => {
    try {
        return await employeeModel.deleteDepartment(departmentId);
    } catch (error) {
        console.error('Error in departmentService.deleteDepartment:', error);
        throw error;
    }
};

export const deleteEmployee = async (empId) => {
    try {
        return await employeeModel.deleteEmployee(empId);
    } catch (error) {
        console.error('Error in employeeService.deleteEmployee:', error);
        throw error;
    }
};