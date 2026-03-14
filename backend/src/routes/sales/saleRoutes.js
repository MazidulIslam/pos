const express = require("express");
const router = express.Router();
const saleController = require("../../controllers/sales/saleController");
const { protect } = require("../../middlewares/authMiddleware");

router.use(protect);
router.get("/", saleController.getSales);

module.exports = router;
