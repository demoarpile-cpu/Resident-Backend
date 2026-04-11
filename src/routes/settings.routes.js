import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);
router.get('/integrations', settingsController.getIntegrations);
router.patch('/integrations/:id', settingsController.updateIntegration);

export default router;
