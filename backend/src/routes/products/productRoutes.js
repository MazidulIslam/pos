const express = require("express");
const router = express.Router();
const productController = require("../../controllers/products/productController");
const { protect } = require("../../middlewares/authMiddleware");

router.use(protect);
router.get("/", productController.getProducts);

module.exports = router;
