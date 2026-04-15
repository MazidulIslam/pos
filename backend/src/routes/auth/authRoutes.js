const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth/authController");

const { protect } = require("../../middlewares/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/select-org", authController.selectOrg);

// Protected routes
router.post("/logout", protect, authController.logout);

module.exports = router;
