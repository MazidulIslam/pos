const { User } = require("../models");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

/**
 * Service to handle user registration
 * @param {Object} userData - User details (username, email, password, firstName, lastName)
 * @returns {Object} The created user object (excluding the password)
 */
const registerUser = async (userData) => {
    const { username, email, password, firstName, lastName } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({
        where: {
            email,
        },
    });

    if (existingUser) {
        const error = new Error("User with this email already exists");
        error.status = 409;
        throw error;
    }

    const existingUsername = await User.findOne({
        where: {
            username,
        },
    });

    if (existingUsername) {
        const error = new Error("Username already taken");
        error.status = 409;
        throw error;
    }

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create the user
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
    });

    // 4. Return user data (excluding password via model defaultScope)
    // Let's refetch to ensure defaultScope applies
    const userToReturn = await User.findByPk(newUser.id);
    return userToReturn;
};

/**
 * Service to handle user login
 * @param {string} email - User email
 * @param {string} password - User plain text password
 * @returns {Object} { user, token }
 */
const loginUser = async (email, password) => {
    // 1. Find user by email (explicitly including password for comparison)
    const user = await User.scope("withPassword").findOne({
        where: { email },
    });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Your account is deactivated. Contact an administrator.");
        error.status = 403;
        throw error;
    }

    // 2. Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    // 3. Generate JWT
    const token = generateToken({ id: user.id, roleId: user.roleId, email: user.email });

    // 4. Exclude password from returned user data
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, token };
};

/**
 * Service to handle user logout by blacklisting the token
 * @param {string} token - The active JWT
 * @param {number} exp - The expiration timestamp of the token
 */
const blacklistToken = async (token, exp) => {
    const { BlacklistedToken } = require("../models");
    const expiresAt = new Date(exp * 1000);

    await BlacklistedToken.create({
        token,
        expiresAt,
    });
};

module.exports = {
    registerUser,
    loginUser,
    blacklistToken,
};
