const express = require('express');
const router = express.Router();
const systemController = require('../../controllers/system/systemController');

// Public system status check
router.get('/status', systemController.getStatus);

// Admin activation (In a real app, this should be protected by Auth too, 
// but it's exempt from licenseGuard to allow initial setup)
router.post('/activate', systemController.activate);

module.exports = router;
