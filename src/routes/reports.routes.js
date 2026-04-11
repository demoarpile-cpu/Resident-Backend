import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller.js';

const router = Router();

router.get('/summary', reportsController.getFinancialSummary);
router.get('/trends', reportsController.getMonthlyTrends);

export default router;
