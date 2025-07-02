import express from 'express';
const router = express.Router();

// Import controllers
import { getDashboardData } from '../controllers/manager/dashboardController.js';
import {
    getLeaveRequests,
} from '../controllers/manager/leaveController.js';
import {
    getLoanRequests,
    approveLoanRequest,
    rejectLoanRequest
} from '../controllers/manager/loanController.js';
import {
    getPerformanceRatings,
    createPerformanceRating
} from '../controllers/manager/performanceController.js';
import {
    getTemplates,
    getRecentReports,
    getScheduledReports,

} from '../controllers/manager/reportController.js';

import {
    getActiveTasks,
} from '../controllers/manager/taskController.js';

// Dashboard routes
router.get('/dashboard',  getDashboardData);

// Leave management routes
router.get('/leave',  getLeaveRequests);

// Loan management routes
router.get('/loan-requests',  getLoanRequests);
router.put('/loan-approve',  approveLoanRequest);
router.put('/loan-reject',  rejectLoanRequest);

// Performance management routes
router.get('/performance-ratings',  getPerformanceRatings);
router.post('/performance-create',  createPerformanceRating);

// Report routes
router.get('/report-templates',  getTemplates);
router.get('/reports',  getRecentReports);
router.get('/reports-scheduled',  getScheduledReports);

// Task management routes
router.get('/tasks',  getActiveTasks);

export default router;