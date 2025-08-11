const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, adminMiddleware } = require( "../middleware/authMiddleware.js");

router.post('/create', authMiddleware, paymentController.createPayment);
router.get('/allpayments', authMiddleware, adminMiddleware, paymentController.getAllPayments);
router.get('/payment/:id', authMiddleware,  paymentController.getPaymentById);
router.put('/:id', authMiddleware, adminMiddleware, paymentController.updatePayment);
router.delete('/:id', authMiddleware, adminMiddleware, paymentController.deletePayment);
router.patch('/payments/:id/status', authMiddleware, adminMiddleware, paymentController.updatePaymentStatus);

module.exports = router;
