import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware, checkPermission } from '../config/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);
router.patch('/password', authMiddleware, userController.updatePassword);

// Admin routes (User Management)
router.get('/', authMiddleware, checkPermission('settings', 'view'), userController.getAllUsers);
router.post('/', authMiddleware, checkPermission('settings', 'edit'), userController.createUser);
router.patch('/:id', authMiddleware, checkPermission('settings', 'edit'), userController.updateUser);
router.delete('/:id', authMiddleware, checkPermission('settings', 'edit'), userController.deleteUser);

export default router;
