import express from 'express';
const router = express.Router();

// Controllers
import {
    getDashboardData,
    scheduleMeeting,
    promoteEmployee,
} from '../controllers/md/dashboardController.js';

import {
    getMeetingStats, getMeeting
} from '../controllers/md/meetingController.js';

import {
    getPromotionData,
    initiatePromotion
} from '../controllers/md/promotionController.js';

import { generateReport } from '../controllers/md/reportController.js';

// Dashboard routes
router.get('/dashboard', getDashboardData);
router.post('/reports-generate',  generateReport);

// Meeting management routes
router.get('/meetings', getMeetingStats);
router.get('/meetings-all', getMeeting);
router.post('/meetings/schedule', scheduleMeeting);

// Promotion routes
router.get('/promotions', getPromotionData);
router.post('/promotions/promote', promoteEmployee);

export default router;