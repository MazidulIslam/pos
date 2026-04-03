const { Menu, Permission } = require('../../models');

exports.getMenus = async (req, res) => {
    try {
        const { User, Role } = require('../../models');
        
        const menus = await Menu.findAll({
            where: { isActive: true },
            include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }],
            order: [['sortOrder', 'ASC']]
        });

        const fullUser = await User.findByPk(req.user.id, {
            include: [
                { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] },
                { model: Permission, as: 'directPermissions', through: { attributes: [] } }
            ]
        });

        if (fullUser.role && fullUser.role.name === 'Super Admin') {
            return res.status(200).json({ success: true, data: menus });
        }

        const rolePerms = fullUser.role && fullUser.role.permissions ? fullUser.role.permissions.map(p => p.action) : [];
        const directPerms = fullUser.directPermissions ? fullUser.directPermissions.map(p => p.action) : [];
        const mergedPermissions = [...new Set([...rolePerms, ...directPerms])];

        const explicitlyAllowed = new Set();
        
        // Convert to deeply cloned JS objects to safely mutate arrays
        const cleanMenus = menus.map(m => m.toJSON());

        cleanMenus.forEach(menu => {
            if (menu.permissions && menu.permissions.length > 0) {
                menu.permissions = menu.permissions.filter(p => mergedPermissions.includes(p.action));
                if (menu.permissions.length > 0) {
                    explicitlyAllowed.add(menu.id);
                }
            } else {
                explicitlyAllowed.add(menu.id);
            }
        });

        let addedParent = true;
        while (addedParent) {
            addedParent = false;
            cleanMenus.forEach(menu => {
                 if (explicitlyAllowed.has(menu.id) && menu.parent_id && !explicitlyAllowed.has(menu.parent_id)) {
                     explicitlyAllowed.add(menu.parent_id);
                     addedParent = true;
                 }
            });
        }

        const filteredMenus = cleanMenus.filter(menu => explicitlyAllowed.has(menu.id));
        return res.status(200).json({ success: true, data: filteredMenus });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    const { sequelize } = require('../../models');
    const transaction = await sequelize.transaction();
    try {
        const { name, slug, path, icon, parent_id, sortOrder, permissions } = req.body;
        if (!name || !slug || !path) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields: name, slug, or path.' });
        }

        // Check if a soft-deleted menu with same slug exists — reactivate it
        const existingMenu = await Menu.findOne({ where: { slug }, transaction });
        let menu;
        if (existingMenu && !existingMenu.isActive) {
            await existingMenu.update({
                name, path, icon, parent_id, sortOrder,
                isActive: true,
                updatedBy: req.user ? req.user.id : null
            }, { transaction });
            menu = existingMenu;
        } else if (existingMenu && existingMenu.isActive) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: `Menu with slug "${slug}" already exists.` });
        } else {
            menu = await Menu.create({
                name, slug, path, icon, parent_id, sortOrder,
                createdBy: req.user ? req.user.id : null
            }, { transaction });
        }

        // Handle permissions
        if (Array.isArray(permissions) && permissions.length > 0) {
            for (const p of permissions) {
                const existingPerm = await Permission.findOne({ where: { action: p.action }, transaction });
                if (existingPerm && !existingPerm.isActive) {
                    await existingPerm.update({
                        menu_id: menu.id,
                        name: p.name,
                        isDefault: p.isDefault || false,
                        isActive: true,
                        updatedBy: req.user ? req.user.id : null
                    }, { transaction });
                } else if (existingPerm && existingPerm.isActive) {
                    // Skip — permission action already active
                } else {
                    await Permission.create({
                        menu_id: menu.id,
                        name: p.name,
                        action: p.action,
                        isDefault: p.isDefault || false,
                        createdBy: req.user ? req.user.id : null
                    }, { transaction });
                }
            }
        }

        const menuWithPerms = await Menu.findByPk(menu.id, {
            include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }],
            transaction
        });
        await transaction.commit();
        return res.status(201).json({ success: true, data: menuWithPerms, message: 'Menu created successfully' });
    } catch (error) {
        await transaction.rollback();
        if (error.name && (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError')) {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: 'Validation error', details: messages });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    const { sequelize } = require('../../models');
    const transaction = await sequelize.transaction();
    try {
        const { permissions, ...menuData } = req.body;
        const menu = await Menu.findByPk(req.params.id, { transaction });
        if (!menu) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Menu not found" });
        }
        await menu.update({ ...menuData, updatedBy: req.user ? req.user.id : null }, { transaction });

        if (Array.isArray(permissions)) {
            // Soft delete existing permissions first
            await Permission.update(
                { isActive: false, updatedBy: req.user ? req.user.id : null },
                { where: { menu_id: menu.id }, transaction }
            );
            // Upsert permissions
            for (const p of permissions) {
                // Search across ALL permissions (including inactive) for this menu+action
                const existing = await Permission.findOne({ where: { menu_id: menu.id, action: p.action }, transaction });
                if (existing) {
                    await existing.update({ isActive: true, name: p.name, isDefault: p.isDefault, updatedBy: req.user ? req.user.id : null }, { transaction });
                } else {
                    // Check globally for the action (could be a soft-deleted perm from another menu)
                    const globalExisting = await Permission.findOne({ where: { action: p.action }, transaction });
                    if (globalExisting && !globalExisting.isActive) {
                        await globalExisting.update({
                            menu_id: menu.id, name: p.name, isDefault: p.isDefault || false,
                            isActive: true, updatedBy: req.user ? req.user.id : null
                        }, { transaction });
                    } else {
                        await Permission.create({
                            menu_id: menu.id,
                            name: p.name,
                            action: p.action,
                            isDefault: p.isDefault || false,
                            createdBy: req.user ? req.user.id : null
                        }, { transaction });
                    }
                }
            }
        }

        const updatedMenu = await Menu.findByPk(menu.id, {
            include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }],
            transaction
        });
        await transaction.commit();
        return res.status(200).json({ success: true, data: updatedMenu });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    const { sequelize } = require('../../models');
    const transaction = await sequelize.transaction();
    try {
        const menu = await Menu.findByPk(req.params.id, { transaction });
        if (!menu) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Menu not found" });
        }
        // Find child menus
        const childMenus = await Menu.findAll({ where: { parent_id: menu.id }, attributes: ['id'], transaction });
        const affectedMenuIds = [menu.id, ...childMenus.map(m => m.id)];
        // Soft-delete menus
        await Menu.update(
            { isActive: false, updatedBy: req.user ? req.user.id : null },
            { where: { id: affectedMenuIds }, transaction }
        );
        // Permissions
        const affectedPermissions = await Permission.findAll({ where: { menu_id: affectedMenuIds }, attributes: ['id'], transaction });
        const affectedPermissionIds = affectedPermissions.map(p => p.id);
        if (affectedPermissionIds.length > 0) {
            await Permission.update(
                { isActive: false, updatedBy: req.user ? req.user.id : null },
                { where: { id: affectedPermissionIds }, transaction }
            );
            // Clean pivot tables
            await sequelize.query(`DELETE FROM role_permissions WHERE permission_id IN (:ids)`, { replacements: { ids: affectedPermissionIds }, transaction });
            await sequelize.query(`DELETE FROM user_permissions WHERE permission_id IN (:ids)`, { replacements: { ids: affectedPermissionIds }, transaction });
        }
        await transaction.commit();
        return res.status(200).json({ success: true, message: "Menu hierarchy, permissions, and all pivot associations securely cleaned up." });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addCustomPermission = async (req, res) => {
    try {
        const { menuId } = req.params;
        const { name, action } = req.body;
        const menu = await Menu.findByPk(menuId);
        if (!menu) return res.status(404).json({ success: false, message: "Menu not found" });
        
        // Check if a soft-deleted permission with same action exists
        const existing = await Permission.findOne({ where: { action } });
        if (existing && !existing.isActive) {
            await existing.update({
                menu_id: menuId, name, isActive: true,
                updatedBy: req.user ? req.user.id : null
            });
            return res.status(201).json({ success: true, data: existing });
        } else if (existing && existing.isActive) {
            return res.status(400).json({ success: false, message: `Permission action "${action}" already exists.` });
        }

        const permission = await Permission.create({
            menu_id: menuId, name, action, isDefault: false, createdBy: req.user ? req.user.id : null
        });
        return res.status(201).json({ success: true, data: permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
