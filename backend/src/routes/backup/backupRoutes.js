const express = require('express');
const router = express.Router();
const backupController = require('../../controllers/backup/backupController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', authorize('backups.generate'), backupController.generateBackup);

module.exports = router;
