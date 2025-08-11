// controllers/subscriptionController.js
const Subscription = require('../models/subscription');
const User = require('../models/users');
const mongoose = require('mongoose');

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const user = req.user.ObjectId;
    const {plan, startDate, paymentId } = req.body;
    if (!user || !plan || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userAcc = await User.findById(user);
    if(userAcc._id != user){
      return res.status(403).json({message:'Unauthorized access'});
    }

    const start = new Date(startDate);
    const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after start

    const exist = await Subscription.findOne({ user });

    if(exist && exist.endDate > Date.now()){
      return res.status(403).json({message: "Already active a subscription "})
    }

    const subscription = new Subscription({
      user,
      plan,
      startDate: start,
      endDate: end,
      paymentId,
      status: 'pending'
    });

    const savedSub = await subscription.save();
    res.status(201).json(savedSub);

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find().populate('user', 'firstName lastName email');
    res.json(subs);
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscriptions by user ID
exports.getSubscriptionsByUser = async (req, res) => {
  try {
    const userId  = req.user.ObjectId;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    const subs = await Subscription.find({ user: userId }).sort({ startDate: -1 });
    res.json(subs);
  } catch (error) {
    console.error('Get subscriptions by user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update subscription (e.g. status)
exports.updateSubscription = async (req, res) => {
  try {
    const user = req.params;
    const updateData = req.body; 

    if (!mongoose.Types.ObjectId.isValid(user)) return res.status(400).json({ message: 'Invalid user ID' });

    const updatedSub = await Subscription.findOneAndUpdate({user}, updateData, { new: true });
    if (!updatedSub) return res.status(404).json({ message: 'Subscription not found' });

    res.json({ message: 'Subscription updated', subscription: updatedSub });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel subscription by ID (sets status to canceled)
exports.cancelSubscription = async (req, res) => {
  try {
    const user = req.user.ObjectId;
    if (!mongoose.Types.ObjectId.isValid(user)) return res.status(400).json({ message: 'Invalid user ID' });

    const canceledSub = await Subscription.findOneAndUpdate({user}, { status: 'canceled' }, { new: true });
    if (!canceledSub) return res.status(404).json({ message: 'Subscription not found' });

    res.json({ message: 'Subscription canceled', subscription: canceledSub });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const user = req.user.ObjectId;
    if (!mongoose.Types.ObjectId.isValid(user)) return res.status(400).json({ message: 'Invalid user ID' });

    const deletedSub = await Subscription.findOneAndDelete({user});
    if (!deletedSub) return res.status(404).json({ message: 'Subscription not found' });

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
