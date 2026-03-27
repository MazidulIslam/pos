const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/roles/roleController');
const { protect } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.post('/:id/permissions', roleController.assignPermissionsToRole);

module.exports = router;
