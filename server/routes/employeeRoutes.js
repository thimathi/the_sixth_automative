import express from 'express';
const router = express.Router();

// Controllers
import {
    markAttendance,
    getMonthlyStats
} from '../controllers/employee/attendanceController.js';

import {
    getEmployeeBonuses
} from '../controllers/employee/bonusController.js';

import { getDashboardData } from '../controllers/employee/dashboardController.js';

import {
    getDetails as getEpfDetails,
} from '../controllers/employee/epfEtfController.js';

import {
    getIncrementDetails,
} from '../controllers/employee/incrementController.js';

import {
    getLeaveApplications,
    submitLeaveApplication
} from '../controllers/employee/leaveController.js';

import { getMeetingData } from '../controllers/employee/meetingController.js';

import {
    getRecords as getNoPayRecords
} from '../controllers/employee/noPayController.js';

import {
    getCurrentSalary
} from '../controllers/employee/salaryController.js';

import {
    getCurrentTasks
} from '../controllers/employee/taskController.js';

import {
    getCurrentTrainings
} from '../controllers/employee/trainingController.js';

// Attendance routes
router.get('/attendance',  getMonthlyStats);
router.post('/attendance-create',  markAttendance);

// Bonus routes
router.get('/bonus',  getEmployeeBonuses);

// Dashboard routes
router.get('/dashboard/',  getDashboardData);

// EPF/ETF routes
router.get('/epf-etf',  getEpfDetails);

// Increment routes
router.get('/increment',  getIncrementDetails);

// Leave routes
router.get('/leaves',  getLeaveApplications);

// Meeting routes
router.get('/meetings',  getMeetingData);

// No Pay routes
router.get('/no-pay',  getNoPayRecords);

// Salary routes
router.get('/salary',  getCurrentSalary);

// Task routes
router.get('/tasks',  getCurrentTasks);

// Training routes
router.get('/trainings',  getCurrentTrainings);

// Leave Post
router.post('/leave-submit',  submitLeaveApplication);

export default router;