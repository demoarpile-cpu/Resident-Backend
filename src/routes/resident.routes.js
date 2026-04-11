import { Router } from 'express';
import * as residentController from '../controllers/resident.controller.js';

const router = Router();

router.get('/', residentController.getAllResidents);
router.post('/', residentController.createResident);
router.get('/:id', residentController.getResidentById);
router.get('/:id/ledger', residentController.getResidentLedger);
router.patch('/:id', residentController.updateResident);
router.delete('/:id', residentController.deleteResident);
router.post('/:id/reminders', residentController.logReminder);

export default router;
