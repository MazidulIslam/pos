const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customers/customerController");
const { protect } = require("../../middlewares/authMiddleware");

router.use(protect);
router.get("/", customerController.getCustomers);

module.exports = router;
