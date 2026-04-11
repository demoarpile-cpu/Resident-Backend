import * as paymentService from '../services/payment.service.js';

export const recordPayment = async (req, res) => {
  try {
    const data = req.body;
    const result = await paymentService.recordPayment(data);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const result = await paymentService.getAllPayments();
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
