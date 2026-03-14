const { User } = require("../models");
const { hashPassword, comparePassword } = require("../utils/password");

class UserService {
    async getUserProfile(userId) {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    async updateUserProfile(userId, updateData) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Allowed fields for update
        const { firstName, lastName, phone } = updateData;

        await user.update({
            firstName: firstName !== undefined ? firstName : user.firstName,
            lastName: lastName !== undefined ? lastName : user.lastName,
            phone: phone !== undefined ? phone : user.phone,
        });

        // Return the updated user without the password
        const updatedUser = user.toJSON();
        delete updatedUser.password;

        return updatedUser;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.scope('withPassword').findByPk(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Incorrect current password");
        }

        const newHashedPassword = await hashPassword(newPassword);
        await user.update({ password: newHashedPassword });

        return true;
    }
}

module.exports = new UserService();
