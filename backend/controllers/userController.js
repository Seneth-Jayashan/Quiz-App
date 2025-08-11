// controllers/userController.js
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const {sendVerificationEmail, sendPasswordResetEmail} = require('../utils/emailSender');
require("dotenv").config();


// Helper: Hash password
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Register new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for existing email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : "default.jpg",
      role: role || 'teacher',
      isActive: false,
      subscription: 'free'
    });

    const savedUser = await user.save();

    const verificationToken = jwt.sign(
      { id: savedUser.userId },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    await sendVerificationEmail(savedUser.email, verificationToken);
    res.status(201).json({
      message: 'User registered successfully',
      userId: savedUser._id,
      userName: savedUser.username,
      subscription: savedUser.subscription
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpiration');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!id) return res.status(400).json({ message: 'User Id Need' });

    const user = await User.findOne({userId}).select('-password -resetToken -resetTokenExpiration');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.user.id;
    const { firstName, lastName, email, username, isActive } = req.body;

    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const existingUser = await User.findOne({ userId });
    const profilePicture = req.file
      ? `/uploads/${req.file.filename}`
      : existingUser.profilePicture;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await User.findOneAndUpdate({userId}, updateData, { new: true }).select('-password -resetToken -resetTokenExpiration');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.user.id;
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const deletedUser = await User.findOneAndDelete({userId});
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate or update subscription
exports.activateSubscription = async (req, res) => {
  try {
    const { userId } = req.user.id;
    const { plan, days } = req.body; // plan = 'basic' | 'pro' | 'enterprise', days = subscription length

    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });
    if (!plan || !days) return res.status(400).json({ message: 'Plan and days are required' });

    const user = await User.findOne({userId});
    if (!user) return res.status(404).json({ message: 'User not found' });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    user.subscription = plan;
    user.subs_start = startDate;
    user.subs_end = endDate;

    await user.save();

    res.json({ message: `Subscription updated to ${plan} for ${days} days`, subscription: user.subscription, subs_start: user.subs_start, subs_end: user.subs_end });
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.user.id;
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findOne({userId});
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    let status = 'inactive';
    if (user.subscription !== 'free' && user.subs_end && user.subs_end > now) status = 'active';
    else if (user.subs_end && user.subs_end <= now) status = 'expired';
    else if (user.subscription === 'free') status = 'free';

    res.json({
      subscription: user.subscription,
      subs_start: user.subs_start,
      subs_end: user.subs_end,
      status
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.authentication = async (req, res) => {
  const userId = req.user.id; 
  try {
    const currentUser = await User.findOne({ userId }).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User found",
      user: currentUser,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user details",
      details: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const registeredUser = await User.findOne({ username });
    if (!registeredUser) {
      return res.status(404).json({ message: "Username is invalid" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      registeredUser.password
    );
    if (!isPasswordMatch) {
      return res.status(403).json({ message: "Password is invalid" });
    }

    const token = jwt.sign(
      { id: registeredUser.userId, role: registeredUser.role, ObjectId: registeredUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    if(registeredUser.isActive === false){
      res.status(200).json({
        status: registeredUser.isActive,
      });
    }else{
      res.status(200).json({
        message: "Login successful",
        token,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to login",
      details: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const currentUser = await User.findOne({ userId: decoded.id }).select(
      "-password"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.isActive = true;
    await currentUser.save();

    res.status(200).json({ message: "Account verified successfully!" });
  } catch (error) {
    res.status(500).json({
      error: "Invalid or expired token",
      details: error.message,
    });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationToken = jwt.sign(
      { id: user.userId },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    await sendVerificationEmail(email, verificationToken);
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification link', details: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Send reset link email with token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    user.password = await hashPassword(newPassword);

    // Clear reset token fields
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
