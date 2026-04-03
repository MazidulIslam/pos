const express = require('express');
const router = express.Router();
const backupController = require('../../controllers/backup/backupController');
const { protect } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', backupController.generateBackup);

module.exports = router;
