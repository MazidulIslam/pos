const express = require("express");
const router = express.Router();
const userController = require("../../controllers/users/userController");
const { protect } = require("../../middlewares/authMiddleware");

// All user routes are protected
router.use(protect);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.post("/:id/permissions", userController.assignPermissions);

module.exports = router;
