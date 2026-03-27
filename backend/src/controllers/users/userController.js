const userService = require("../../services/users/userService");

class UserController {
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
