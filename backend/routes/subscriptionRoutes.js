const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware, adminMiddleware } = require( "../middleware/authMiddleware");

router.post('/create', authMiddleware, subscriptionController.createSubscription);
router.get('/allsubscriptions', authMiddleware, adminMiddleware, subscriptionController.getAllSubscriptions);
router.get('/user/',authMiddleware, subscriptionController.getSubscriptionsByUser);
router.put('/update/:id', authMiddleware ,adminMiddleware, subscriptionController.updateSubscription);
router.put('/cancel', authMiddleware,  subscriptionController.cancelSubscription);
router.delete('/delete/:id', authMiddleware , subscriptionController.deleteSubscription);

module.exports = router;
