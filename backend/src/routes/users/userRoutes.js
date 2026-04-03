const express = require("express");
const router = express.Router();
const userController = require("../../controllers/users/userController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

// All user routes are protected
router.use(protect);

router.get("/profile", userController.getProfile); // Anyone logged in can see their own profile
router.put("/profile", authorize("profile.update"), userController.updateProfile);
router.put("/change-password", userController.changePassword);

router.get("/", authorize("users.list"), userController.getAllUsers);
router.post("/", authorize("users.create"), userController.createUser);
router.put("/:id", authorize("users.update"), userController.updateUser);
router.patch("/:id/status", authorize("users.update"), userController.toggleUserStatus);
router.delete("/:id", authorize("users.delete"), userController.deleteUser);
router.post("/:id/permissions", authorize("roles.update"), userController.assignPermissions);

module.exports = router;
