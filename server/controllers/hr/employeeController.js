import * as employeeService from '../../services/hr/employeeService.js';

export const getEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getEmployees(req.query);
        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch employees'
        });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const departments = await employeeService.getDepartments();
        res.json({ success: true, data: departments });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch departments'
        });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const newDepartment = await employeeService.createDepartment(req.body);
        res.status(201).json({ success: true, data: newDepartment });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create department'
        });
    }
};



export const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.body;
        await employeeService.deleteDepartment(departmentId);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete department'
        });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { departmentId, departmentName, managerId } = req.body;

        // Validate required fields
        if (!departmentId || !departmentName) {
            return res.status(400).json({
                success: false,
                error: 'departmentId and departmentName are required'
            });
        }

        const departmentData = {
            departmentName,
            managerId: managerId || null
        };

        const updatedDepartment = await employeeService.updateDepartment(departmentId,
            departmentData);
        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: updatedDepartment
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update department'
        });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { empId, department, role, status, otHours, kpiScore, satisfaction_score  } = req.body;

        const empData = {
            department,
            role,
            status,
            otHours,
            kpiScore,
            satisfaction_score,
            empId: empId || null
        };

        const updatedEmployee = await employeeService.updateEmployee(empId, empData);
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: updatedEmployee
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update employee'
        });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const { empId } = req.body;
        await employeeService.deleteEmployee(empId);
        res.json({
            success: true,
            message: 'Employee deleted successfully',
            employeeId: empId
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete employee'
        });
    }
};