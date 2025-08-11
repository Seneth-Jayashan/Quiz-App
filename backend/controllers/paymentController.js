// controllers/paymentController.js
const Payment = require('../models/payments');
const mongoose = require('mongoose');

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const {amount, currency, paymentMethod, paymentStatus, transactionId, metadata } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields: user, amount, paymentMethod' });
    }

    const user = req.user.ObjectId;

    if (transactionId) {
      const exists = await Payment.findOne({ transactionId });
      if (exists) return res.status(409).json({ message: 'Transaction ID already exists' });
    }

    const payment = new Payment({
      user,
      amount,
      currency: currency || 'LKR',
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      transactionId,
      metadata: metadata || {}
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid payment ID' });

    const payment = await Payment.findById(id).populate('user', 'firstName lastName email');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment by ID
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid payment ID' });

    // Prevent duplicate transactionId on update
    if (updateData.transactionId) {
      const exists = await Payment.findOne({ transactionId: updateData.transactionId, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: 'Transaction ID already exists' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });

    res.json({ message: 'Payment updated', payment: updatedPayment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid payment ID' });

    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) return res.status(404).json({ message: 'Payment not found' });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment status specifically
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid payment ID' });
    if (!['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });

    res.json({ message: 'Payment status updated', payment: updatedPayment });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
