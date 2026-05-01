import { Router } from 'express';
import * as chargeController from '../controllers/charge.controller.js';
import { authMiddleware, checkPermission } from '../config/auth.middleware.js';

const router = Router();

// Viewing charges requires payments/residents view permission
router.get('/', authMiddleware, checkPermission('payments', 'view'), chargeController.getResidentCharges);
router.get('/definitions', authMiddleware, checkPermission('payments', 'view'), chargeController.getChargeDefinitions);

// Generating/Syncing charges should be allowed for anyone who can view residents (needed for profile visit)
router.post('/generate/:residentId', authMiddleware, checkPermission('residents', 'view'), chargeController.generateMonthlyCharges);

// Management routes
router.post('/', authMiddleware, checkPermission('payments', 'edit'), chargeController.createCharge);
router.post('/definitions', authMiddleware, checkPermission('payments', 'edit'), chargeController.addChargeDefinition);
router.delete('/definitions/:id', authMiddleware, checkPermission('payments', 'edit'), chargeController.deleteChargeDefinition);
router.post('/import', authMiddleware, checkPermission('payments', 'edit'), chargeController.importCharges);
router.patch('/:id', authMiddleware, checkPermission('payments', 'edit'), chargeController.updateCharge);
router.delete('/:id', authMiddleware, checkPermission('payments', 'edit'), chargeController.deleteCharge);

export default router;
