import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authMiddleware, checkPermission } from '../config/auth.middleware.js';

const router = express.Router();

// Public branding settings accessible to all authenticated users
router.get('/', authMiddleware, settingsController.getSettings);

// Sensitive management routes
router.patch('/', authMiddleware, checkPermission('settings', 'edit'), settingsController.updateSettings);
router.get('/integrations', authMiddleware, checkPermission('settings', 'view'), settingsController.getIntegrations);
router.patch('/integrations/:id', authMiddleware, checkPermission('settings', 'edit'), settingsController.updateIntegration);

export default router;
