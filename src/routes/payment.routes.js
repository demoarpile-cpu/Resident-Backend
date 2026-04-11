import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

router.post('/', paymentController.recordPayment);
router.get('/', paymentController.getAllPayments);

export default router;
