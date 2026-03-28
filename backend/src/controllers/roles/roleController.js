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
        if (name && name.trim().toLowerCase() === 'super admin') {
            return res.status(403).json({ success: false, message: 'Reserved system role: Cannot manually create a Super Admin role.' });
        }
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

        if (role.name === 'Super Admin' && name !== 'Super Admin') {
            return res.status(403).json({ success: false, message: 'The Super Admin role name is immutable and cannot be changed.' });
        } else if (role.name !== 'Super Admin' && name && name.trim().toLowerCase() === 'super admin') {
            return res.status(403).json({ success: false, message: 'Cannot rename a standard role to Super Admin.' });
        }

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

        const { User, Permission } = require('../../models');
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        const requestingUser = await User.findByPk(req.user.id, {
            include: [
                { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] },
                { model: Permission, as: 'directPermissions', through: { attributes: [] } }
            ]
        });

        let safePermissionIds = permissionIds;

        if (!requestingUser.role || requestingUser.role.name !== 'Super Admin') {
            const rolePerms = requestingUser.role && requestingUser.role.permissions ? requestingUser.role.permissions.map(p => p.action) : [];
            const directPerms = requestingUser.directPermissions ? requestingUser.directPermissions.map(p => p.action) : [];
            const mergedPermissions = new Set([...rolePerms, ...directPerms]);

            const requestedPermRows = await Permission.findAll({ where: { id: permissionIds } });
            
            // 1. Only allow assigning permissions that the requesting user actually owns
            const safeSubmittedIds = requestedPermRows
                .filter(p => mergedPermissions.has(p.action))
                .map(p => p.id);

            // 2. Fetch the target Role's current permissions
            const currentRolePerms = await role.getPermissions();

            // 3. Keep existing permissions that the requesting Admin does NOT own (prevent clobbering)
            const untouchableIds = currentRolePerms
                .filter(p => !mergedPermissions.has(p.action))
                .map(p => p.id);

            // 4. Merge them safely
            safePermissionIds = [...new Set([...safeSubmittedIds, ...untouchableIds])];
        }

        if (Array.isArray(safePermissionIds)) {
            await role.setPermissions(safePermissionIds);
        }

        const updatedRole = await Role.findByPk(id, { include: [{ model: Permission, as: 'permissions', where: { isActive: true }, required: false }] });
        return res.status(200).json({ success: true, message: 'Permissions assigned to Role', data: updatedRole });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
