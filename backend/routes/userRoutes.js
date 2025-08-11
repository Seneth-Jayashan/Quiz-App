const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require( "../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware");

router.post('/signup', upload.single("profilePicture"), userController.createUser);
router.post('/signin', userController.login);

router.get('/me' , authMiddleware,  userController.authentication);

router.get("/verify/:token", userController.verifyEmail);
router.post('/sendverifylink', userController.sendVerification);


router.get('/allusers', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/user/:id', authMiddleware, adminMiddleware, userController.getUserById);

router.put('/users/:id',authMiddleware, upload.single("profilePicture"), userController.updateUser);
router.delete('/users/:id',authMiddleware, userController.deleteUser);

router.put('/users/:id/subscription', authMiddleware, userController.activateSubscription);
router.get('/users/:id/subscription', authMiddleware, userController.getSubscriptionStatus);

router.post('/requestmail', userController.requestPasswordReset);
router.post('/reset', userController.resetPassword);

module.exports = router;
