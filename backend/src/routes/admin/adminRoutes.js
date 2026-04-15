const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { protect, authorize } = require("../../middlewares/authMiddleware");

// All admin routes are protected and require top-level Super Admin access
router.use(protect);

/**
 * Super Admin Management
 */
router.get("/stats", adminController.getPlatformStats);
router.get("/organizations", adminController.getAllOrganizations);
router.post("/organizations", adminController.createOrganization);
router.patch("/organizations/:id", adminController.updateOrganization);
router.get("/organizations/:id/members", adminController.getOrganizationMembers);
router.post("/organizations/:id/members", adminController.addOrganizationMember);
router.delete("/organizations/:id/members/:userId", adminController.removeOrganizationMember);

module.exports = router;
