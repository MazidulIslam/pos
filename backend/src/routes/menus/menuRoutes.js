const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/menus/menuController');
const { protect } = require('../../middlewares/authMiddleware');

router.use(protect);

router.get('/', menuController.getMenus);
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);
router.post('/:menuId/permissions', menuController.addCustomPermission);

module.exports = router;
