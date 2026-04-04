const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/roles/roleController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', authorize('roles.list'), roleController.getRoles);
router.post('/', authorize('roles.create'), roleController.createRole);
router.put('/:id', authorize('roles.update'), roleController.updateRole);

router.delete('/:id', authorize('roles.delete'), roleController.deleteRole);
router.post('/:id/permissions', authorize('roles.update'), roleController.assignPermissionsToRole);

module.exports = router;
