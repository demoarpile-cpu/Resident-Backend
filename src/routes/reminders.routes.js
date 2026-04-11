import { Router } from 'express';
import * as remindersController from '../controllers/reminders.controller.js';

const router = Router();

router.get('/overdue', remindersController.getOverdueResidents);
router.post('/batch-send', remindersController.batchSendReminders);

export default router;
