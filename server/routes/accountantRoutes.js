import express from 'express';
const router = express.Router();
// Bonus Controller
import {
    getEmployees as getBonusEmployees,
    getBonusHistory,
    processBonus,
} from '../controllers/accountant/bonusController.js';

// Dashboard Controller
import {
    getDashboardData
} from '../controllers/accountant/dashboardController.js';

// EPF/ETF Controller
import {
    getEmployees as getEpfEmployees,
    generateEpfReport,
    generateEtfReport
} from '../controllers/accountant/epfEtfController.js';

// Loan Controller
import {
    getLoanEmployees,
    getLoanApplications,
    
} from '../controllers/accountant/loanController.js';

// OT Controller
import {
    fetchEmployees as fetchOtEmployees,
    fetchOTRecords,
    getOTReport
} from '../controllers/accountant/otController.js';

// Salary Controller
import {
    fetchEmployees as fetchSalaryEmployees,
} from '../controllers/accountant/salaryController.js';

import {
    getEmployees, getIncrementHistory
} from "../controllers/accountant/incrementController.js";

// Dashboard routes
router.get('/dashboard',  getDashboardData);

// Bonus routes
router.get('/bonus-employees',  getBonusEmployees);
router.get('/bonus-history',  getBonusHistory);
router.post('/bonus-process', processBonus);


// EPF/ETF routes
router.get('/epf-etf-employees',  getEpfEmployees);
router.get('/epf-reports',  generateEpfReport);
router.get('/etf-reports',  generateEtfReport);


// Increment routes
router.get('/increment-employees', getEmployees);
router.get('/increment-history', getIncrementHistory);

// Loan routes
router.get('/loan-employees',  getLoanEmployees);
router.get('/loan-applications',  getLoanApplications);

// OT routes
router.get('/ot-employees',  fetchOtEmployees);
router.get('/ot-records',  fetchOTRecords);
router.get('/ot-report',  getOTReport);

// Salary routes
router.get('/salary-employees',  fetchSalaryEmployees);


export default router;