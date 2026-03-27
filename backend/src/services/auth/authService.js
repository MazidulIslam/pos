const { User, Role, Menu, Permission } = require("../../models");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");

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
        include: [
            {
                model: Role,
                as: 'role',
                include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
            },
            {
                model: Permission,
                as: 'directPermissions',
                through: { attributes: [] }
            }
        ]
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

    // 5. Merge permissions and filter menus
    let mergedPermissions = [];
    let allMenus = [];
    
    if (user.role && user.role.name === 'Super Admin') {
        mergedPermissions = ['*'];
        allMenus = await Menu.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC']] });
    } else {
        const rolePerms = user.role && user.role.permissions ? user.role.permissions.map(p => p.action) : [];
        const directPerms = user.directPermissions ? user.directPermissions.map(p => p.action) : [];
        mergedPermissions = [...new Set([...rolePerms, ...directPerms])];
        
        const activeMenus = await Menu.findAll({ 
            where: { isActive: true }, 
            include: [{ model: Permission, as: 'permissions' }],
            order: [['sortOrder', 'ASC']] 
        });

        allMenus = activeMenus.filter(menu => {
            if (!menu.permissions || menu.permissions.length === 0) return true;
            return menu.permissions.some(p => mergedPermissions.includes(p.action));
        });
    }

    return { user: userWithoutPassword, token, permissions: mergedPermissions, menus: allMenus };
};

/**
 * Service to handle user logout by blacklisting the token
 * @param {string} token - The active JWT
 * @param {number} exp - The expiration timestamp of the token
 */
const blacklistToken = async (token, exp) => {
    const { BlacklistedToken } = require("../../models");
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
