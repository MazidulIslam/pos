const userService = require("../../services/users/userService");

class UserController {
    async getAllUsers(req, res) {
        try {
            const { User, Role, Permission } = require('../../models');
            const users = await User.findAll({
                attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'isActive', 'roleId'],
                include: [
                    { model: Role, as: 'role' },
                    { model: Permission, as: 'directPermissions', through: { attributes: [] }, where: { isActive: true }, required: false }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ success: true, data: users });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, email, password, firstName, lastName, phone, roleId } = req.body;
            const { User, Role } = require('../../models');
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            
            const updatePayload = { username, email, firstName, lastName, phone, roleId: roleId || null };
            if (password) {
                const bcrypt = require('bcrypt');
                updatePayload.password = await bcrypt.hash(password, 10);
            }
            
            await user.update(updatePayload);
            const updatedUser = await User.findByPk(user.id, { include: [{ model: Role, as: 'role' }] });
            return res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const { username, email, password, firstName, lastName, phone, roleId } = req.body;
            const { User, Role } = require('../../models');
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const user = await User.create({
                username, email, password: hashedPassword, firstName, lastName, phone, roleId: roleId || null
            });
            const newUser = await User.findByPk(user.id, { include: [{ model: Role, as: 'role' }] });
            return res.status(201).json({ success: true, data: newUser });
        } catch (error) {
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
            
            const { User, Permission } = require('../../models');
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            if (Array.isArray(permissionIds)) {
                await user.setDirectPermissions(permissionIds);
            }

            const updatedUser = await User.findByPk(id, { include: [{ model: Permission, as: 'directPermissions' }] });
            return res.status(200).json({ success: true, message: 'Direct permissions assigned to User', data: updatedUser });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
