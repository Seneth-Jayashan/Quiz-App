const express = require('express');
const router = express.Router();

const {
  createUser,
  getAllUsers,
  authentication,
  login,
  verifyEmail,
  updateUser,
  deleteUser,
  sendVeriification,
} = require( "../controllers/userControllers.js");
const { authMiddleware, adminMiddleware } = require( "../middleware/authMiddleware.js");

const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.single("profilePicture"), createUser);
router.post("/login", login);

router.post('/sendverifylink', sendVeriification);

router.get("/verify/:token", verifyEmail);

router.get("/me", authMiddleware, authentication);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.put("/", authMiddleware, upload.single("profilePicture"), updateUser);
router.delete("/", authMiddleware, deleteUser);

module.exports = router;
