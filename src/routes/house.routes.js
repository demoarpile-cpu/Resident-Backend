import { Router } from 'express';
import * as houseController from '../controllers/house.controller.js';
import { authMiddleware, checkPermission } from '../config/auth.middleware.js';

const router = Router();

// Anyone who can view residents should be able to see houses for filtering/dropdowns
router.get('/', authMiddleware, checkPermission('residents', 'view'), houseController.getAllHouses);

// Managing houses requires settings permissions
router.post('/', authMiddleware, checkPermission('settings', 'edit'), houseController.createHouse);
router.patch('/:id', authMiddleware, checkPermission('settings', 'edit'), houseController.updateHouse);
router.delete('/:id', authMiddleware, checkPermission('settings', 'edit'), houseController.deleteHouse);

export default router;
