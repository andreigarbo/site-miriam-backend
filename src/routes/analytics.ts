import { Router } from 'express';
import { analyticsDataController } from '../controllers/analytics.js';

const router = Router();
const analyticsControllerInstance = new analyticsDataController();

router.post('/report-visit', analyticsControllerInstance.reportAnalytics);

router.get('/get-analytics-data', analyticsControllerInstance.getAll);

router.get('/get-by-all-params', analyticsControllerInstance.getByAllParams);

export default router;
