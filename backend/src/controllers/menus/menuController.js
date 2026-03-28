const { Menu, Permission } = require('../../models');

exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.findAll({
            where: { isActive: true },
            include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }],
            order: [['sortOrder', 'ASC']]
        });
        return res.status(200).json({ success: true, data: menus });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const { name, slug, path, icon, parent_id, sortOrder, permissions } = req.body;
        const menu = await Menu.create({ 
            name, slug, path, icon, parent_id, sortOrder,
            createdBy: req.user ? req.user.id : null 
        });

        if (Array.isArray(permissions) && permissions.length > 0) {
            for (const p of permissions) {
                await Permission.create({
                    menu_id: menu.id,
                    name: p.name,
                    action: p.action,
                    isDefault: p.isDefault || false,
                    createdBy: req.user ? req.user.id : null
                });
            }
        }

        const menuWithPerms = await Menu.findByPk(menu.id, { include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }] });
        return res.status(201).json({ success: true, data: menuWithPerms, message: 'Menu created with default permissions' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const { permissions, ...menuData } = req.body;
        const menu = await Menu.findByPk(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        await menu.update({ ...menuData, updatedBy: req.user ? req.user.id : null });

        if (Array.isArray(permissions)) {
            // Soft delete initially
            await Permission.update({ isActive: false, updatedBy: req.user ? req.user.id : null }, { where: { menu_id: menu.id } });
            
            // Upsert the defined ones
            for (const p of permissions) {
                const existing = await Permission.findOne({ where: { menu_id: menu.id, action: p.action } });
                if (existing) {
                    await existing.update({ isActive: true, name: p.name, isDefault: p.isDefault, updatedBy: req.user ? req.user.id : null });
                } else {
                    await Permission.create({
                        menu_id: menu.id,
                        name: p.name,
                        action: p.action,
                        isDefault: p.isDefault || false,
                        createdBy: req.user ? req.user.id : null
                    });
                }
            }
        }
        
        const updatedMenu = await Menu.findByPk(menu.id, { include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }] });
        return res.status(200).json({ success: true, data: updatedMenu });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const { Menu, Permission, sequelize } = require('../../models');
        const menu = await Menu.findByPk(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        
        // Find all child menus linked to this parent (if any)
        const childMenus = await Menu.findAll({ where: { parent_id: menu.id }, attributes: ['id'] });
        const affectedMenuIds = [menu.id, ...childMenus.map(m => m.id)];

        // Soft-delete the target menu and its children
        await Menu.update(
            { isActive: false, updatedBy: req.user ? req.user.id : null }, 
            { where: { id: affectedMenuIds } }
        );

        // Fetch all permissions bound to these menus
        const affectedPermissions = await Permission.findAll({ where: { menu_id: affectedMenuIds }, attributes: ['id'] });
        const affectedPermissionIds = affectedPermissions.map(p => p.id);

        if (affectedPermissionIds.length > 0) {
            // Soft-delete the permissions natively
            await Permission.update({ isActive: false, updatedBy: req.user ? req.user.id : null }, { where: { id: affectedPermissionIds } });

            // Hard-delete the pivot bindings using RAW SQL to prevent orphaned associations clogging auth logic
            await sequelize.query(`DELETE FROM role_permissions WHERE permission_id IN (:ids)`, {
                replacements: { ids: affectedPermissionIds }
            });
            await sequelize.query(`DELETE FROM user_permissions WHERE permission_id IN (:ids)`, {
                replacements: { ids: affectedPermissionIds }
            });
        }

        return res.status(200).json({ success: true, message: "Menu hierarchy, permissions, and all pivot associations securely cleaned up." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addCustomPermission = async (req, res) => {
    try {
        const { menuId } = req.params;
        const { name, action } = req.body;
        const menu = await Menu.findByPk(menuId);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        
        const permission = await Permission.create({
            menu_id: menuId, name, action, isDefault: false, createdBy: req.user ? req.user.id : null
        });
        return res.status(201).json({ success: true, data: permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
