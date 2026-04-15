const userService = require("../../services/users/userService");

class UserController {
    async getAllUsers(req, res) {
        try {
            const { User, Role, Permission, Sequelize, OrganizationMember, Organization } = require('../../models');
            const { Op } = Sequelize;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const offset = (page - 1) * limit;
            const search = req.query.search || "";

            const where = {};
            if (search) {
                where[Op.or] = [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } },
                    { phone: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Use unscoped() to fetch both active and inactive (soft-deleted) users
            const { count, rows: users } = await User.unscoped().findAndCountAll({
                where,
                distinct: true,
                attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'roleId', 'isActive'],
                include: [
                    { 
                        model: Role, 
                        as: 'role',
                        required: false
                    },
                    { 
                        model: Permission, 
                        as: 'directPermissions', 
                        through: { attributes: [] }, 
                        required: false 
                    },
                    {
                        model: OrganizationMember,
                        as: 'memberships',
                        required: false,
                        include: [
                            { model: Organization, as: 'organization', attributes: ['id', 'name'], required: false },
                            { model: Role, as: 'role', attributes: ['id', 'name'], required: false }
                        ]
                    }
                ],
                order: [['id', 'DESC']],
                limit,
                offset
            });

            return res.status(200).json({ 
                success: true, 
                data: users,
                meta: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error("fetch users error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, email, password, firstName, lastName, phone, roleId, isActive, memberships: requestedMemberships } = req.body;
            const { User, Role, OrganizationMember, Organization, sequelize } = require('../../models');
            
            const user = await User.unscoped().findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            
            // SECURITY BLOCK: Subordinates cannot edit existing Super Admin users whatsoever
            if (user.roleId) {
                const currentTargetRole = await Role.findByPk(user.roleId);
                if (currentTargetRole && currentTargetRole.name === 'Super Admin') {
                    const requestingUserForCheck = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
                    if (!requestingUserForCheck.role || requestingUserForCheck.role.name !== 'Super Admin') {
                        return res.status(403).json({ success: false, message: 'Security Block: Only existing Super Admins can modify Super Admin accounts.' });
                    }
                }
            }

            await sequelize.transaction(async (t) => {
                const updatePayload = { username, email, firstName, lastName, phone, roleId: roleId || null, ...(isActive !== undefined && { isActive }) };
                if (password) {
                    const bcrypt = require('bcrypt');
                    updatePayload.password = await bcrypt.hash(password, 10);
                }
                
                await user.update(updatePayload, { transaction: t });

                // Sync Memberships if provided
                if (requestedMemberships && Array.isArray(requestedMemberships)) {
                    // 1. Clear existing memberships to ensure fresh sync
                    await OrganizationMember.destroy({
                        where: { user_id: user.id },
                        transaction: t
                    });

                    // 2. Create new memberships with specific roles
                    const newMemberships = requestedMemberships.map(m => ({
                        user_id: user.id,
                        organization_id: m.organizationId,
                        role_id: m.roleId === "" ? null : m.roleId,
                        isActive: true
                    }));
                    
                    if (newMemberships.length > 0) {
                        await OrganizationMember.bulkCreate(newMemberships, { transaction: t });
                    }
                }
            });

            const updatedUser = await User.findByPk(user.id, { 
                include: [
                    { model: Role, as: 'role' },
                    { model: OrganizationMember, as: 'memberships', include: [{ model: Organization, as: 'organization' }, { model: Role, as: 'role' }] }
                ] 
            });
            return res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
        } catch (error) {
            console.error("update user error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createUser(req, res) {
        // Distributed License Check
        const { isActivated } = require("../../utils/license");
        if (!(await isActivated())) {
            return res.status(402).json({ success: false, message: "Action blocked: System core is locked." });
        }

        try {
            const { username, email, password, firstName, lastName, phone, roleId, memberships: requestedMemberships } = req.body;
            const { User, Role, OrganizationMember, Organization, sequelize } = require('../../models');
            
            // Protect Super Admin assignment
            if (roleId) {
                const targetRole = await Role.findByPk(roleId);
                if (targetRole && targetRole.name === 'Super Admin') {
                    const requestingUser = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
                    if (!requestingUser.role || requestingUser.role.name !== 'Super Admin') {
                        return res.status(403).json({ success: false, message: 'Privilege Escalation Blocked: Only existing Super Admins can assign the Super Admin role.' });
                    }
                }
            }

            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await sequelize.transaction(async (t) => {
                const user = await User.create({
                    username, email, password: hashedPassword, firstName, lastName, phone, roleId: roleId || null
                }, { transaction: t });

                // Assign Memberships if provided
                if (requestedMemberships && Array.isArray(requestedMemberships) && requestedMemberships.length > 0) {
                    const memberships = requestedMemberships.map(m => ({
                        user_id: user.id,
                        organization_id: m.organizationId,
                        role_id: m.roleId === "" ? null : m.roleId,
                        isActive: true
                    }));
                    await OrganizationMember.bulkCreate(memberships, { transaction: t });
                }

                return user;
            });

            const newUser = await User.findByPk(result.id, { 
                include: [
                    { model: Role, as: 'role' },
                    { model: OrganizationMember, as: 'memberships', include: [{ model: Organization, as: 'organization' }, { model: Role, as: 'role' }] }
                ] 
            });
            return res.status(201).json({ success: true, data: newUser });
        } catch (error) {
            console.error("create user error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await userService.getUserProfile(userId);

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            const updatedUser = await userService.updateUserProfile(userId, updateData);

            res.status(200).json({
                success: true,
                data: updatedUser,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Both current and new passwords are required",
                });
            }

            await userService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({
                success: true,
                message: "Password updated successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async assignPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissionIds } = req.body;
            
            const { User, Permission, Role } = require('../../models');
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            const requestingUser = await User.findByPk(req.user.id, {
                include: [
                    { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] },
                    { model: Permission, as: 'directPermissions', through: { attributes: [] } }
                ]
            });

            // SECURITY BLOCK: Subordinates cannot assign permissions to Super Admin users
            if (user.roleId) {
                const targetRole = await Role.findByPk(user.roleId);
                if (targetRole && targetRole.name === 'Super Admin') {
                    if (!requestingUser.role || requestingUser.role.name !== 'Super Admin') {
                        return res.status(403).json({ success: false, message: 'Security Block: Only existing Super Admins can modify permissions for Super Admin accounts.' });
                    }
                }
            }

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

                // 2. Fetch the target User's current direct permissions
                const currentUserPerms = await user.getDirectPermissions();

                // 3. Keep existing permissions that the requesting Admin does NOT own
                const untouchableIds = currentUserPerms
                    .filter(p => !mergedPermissions.has(p.action))
                    .map(p => p.id);

                // 4. Merge them securely
                safePermissionIds = [...new Set([...safeSubmittedIds, ...untouchableIds])];
            }

            if (Array.isArray(safePermissionIds)) {
                await user.setDirectPermissions(safePermissionIds);
            }

            const updatedUser = await User.findByPk(id, { include: [{ model: Permission, as: 'directPermissions' }] });
            return res.status(200).json({ success: true, message: 'Direct permissions assigned to User', data: updatedUser });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }


    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const { User } = require('../../models');
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found or already deleted' });

            // Prevent self-deletion
            if (user.id === req.user.id) {
                return res.status(403).json({ success: false, message: 'Security Block: You cannot delete your own account.' });
            }

            // SECURITY BLOCK: Subordinates cannot delete Super Admin users
            if (user.roleId) {
                const { Role } = require('../../models');
                const targetRole = await Role.findByPk(user.roleId);
                if (targetRole && targetRole.name === 'Super Admin') {
                    const requestingUserCheck = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
                    if (!requestingUserCheck.role || requestingUserCheck.role.name !== 'Super Admin') {
                        return res.status(403).json({ success: false, message: 'Security Block: Only existing Super Admins can delete Super Admin accounts.' });
                    }
                }
            }

            // Soft-delete: set isActive to false
            await user.update({ isActive: false });
            return res.status(200).json({ success: true, message: 'User successfully soft-deleted from the system.' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
