const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/menus/menuController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', authorize('menus.list'), menuController.getMenus);
router.post('/', authorize('menus.create'), menuController.createMenu);
router.put('/:id', authorize('menus.update'), menuController.updateMenu);
router.delete('/:id', authorize('menus.delete'), menuController.deleteMenu);
router.post('/:menuId/permissions', authorize('menus.update'), menuController.addCustomPermission);

module.exports = router;
