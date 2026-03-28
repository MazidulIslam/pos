const { Role, Permission } = require('../../models');

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            where: { isActive: true },
            include: [{ model: Permission, as: 'permissions', through: { attributes: [] }, where: { isActive: true }, required: false }]
        });
        return res.status(200).json({ success: true, data: roles });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        const role = await Role.create({ name, description, createdBy: req.user ? req.user.id : null });
        return res.status(201).json({ success: true, data: role });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        await role.update({ name, description });
        return res.status(200).json({ success: true, message: 'Role updated successfully', data: role });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignPermissionsToRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissionIds } = req.body; // Array of UUIDs

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        if (Array.isArray(permissionIds)) {
            await role.setPermissions(permissionIds);
        }

        const updatedRole = await Role.findByPk(id, { include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }] });
        return res.status(200).json({ success: true, message: 'Permissions assigned to Role', data: updatedRole });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
