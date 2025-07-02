import express from 'express';
const router = express.Router();

// Dashboard Controller
import { getHRDashboard } from '../controllers/hr/dashboardController.js';

// Employee Controller
import {
    getEmployees,
    getDepartments,
    updateEmployee,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    deleteEmployee
} from '../controllers/hr/employeeController.js';

// KPI Controller
import {
    getKPIData
} from '../controllers/hr/kpiController.js';

// Leave Controller
import {
    getLeave,
} from '../controllers/hr/leaveController.js';

// Salary Controller
import {
    getSalaries,
    getSalaryHistory
} from '../controllers/hr/salaryController.js';

// Training Controller
import {
    getTrainingData,
    createTrainingSession
} from '../controllers/hr/trainingController.js';

// Dashboard routes
router.get('/dashboard',getHRDashboard);

// Employee management routes
router.get('/employees',getEmployees);
router.get('/departments',getDepartments);
router.post('/departments-create', createDepartment);
router.put('/departments-update', updateDepartment);
router.delete('/departments-delete', deleteDepartment);
router.delete('/employees-delete', deleteEmployee);
router.put('/employees-update',updateEmployee);

// KPI management routes
router.get('/kpi',getKPIData);

// Leave management routes
router.get('/leave',getLeave);

// Salary management routes
router.get('/salaries',getSalaries);
router.get('/salaries-history',getSalaryHistory);

// Training management routes
router.get('/training',getTrainingData);
router.post('/training-create',createTrainingSession);

export default router;