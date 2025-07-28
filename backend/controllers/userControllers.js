const User = require('../models/users');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { sendVerificationEmail } = require('../utils/emailSender.js');


exports.createUser = async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  console.log(req.body);
  try {
    const isUsernameExist = await User.findOne({ username });
    if (isUsernameExist) {
      console.log(isUsernameExist);
      return res.status(403).json({ message: "Username already taken" });
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      console.log(isEmailExist);
      return res.status(403).json({ message: "This email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : "default.jpg",
    });

    await newUser.save();

    const verificationToken = jwt.sign(
    { id: newUser.userId },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
    );

    await sendVerificationEmail(newUser.email, verificationToken);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error in user registration",
      details: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (users.length === 0) {
      return res.status(404).json({ message: "No registered users found" });
    }

    res.status(200).json({
      message: `${users.length} users found`,
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user details",
      details: error.message,
    });
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
  console.log(req.body);
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
      { id: registeredUser.userId, role: registeredUser.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      status: registeredUser.isActive,
    });
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

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const userId = req.user.id;

    const existingUser = await User.findOne({ userId });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const profilePicture = req.file
      ? `/uploads/${req.file.filename}`
      : existingUser.profilePicture;

    const updateData = {
      firstName,
      lastName,
      username,
      profilePicture,
    };

    const updatedUser = await User.findOneAndUpdate({ userId }, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update account data",
      details: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findOneAndDelete({ userId });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete account",
      details: error.message,
    });
  }
};

exports.sendVeriification = async (req, res) => {
    try{
        const email = req.body;
        const host = await User.findOne({ email });

        if(!host){
            return res.status(404).json({message: 'User not found'});
        }

        const verificationToken = jwt.sign(
            { id: host.userId },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        await sendVerificationEmail(email, verificationToken);
        res.status(200).json({message: 'Verification email sent successfully'});
    }catch(error){
        res.status(500).json({error: 'Failed to send verification link', details: error.message});
    }
}
