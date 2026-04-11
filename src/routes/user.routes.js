import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from '../config/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', userController.login);

// Protected routes
router.get('/me', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);
router.patch('/password', authMiddleware, userController.updatePassword);

export default router;
