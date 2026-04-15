const { User, Role, Menu, Permission, Organization, OrganizationMember, RolePermission, sequelize } = require("../../models");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");
const emailService = require("../email/emailService");

/**
 * Service to handle user registration for a new organization
 * @param {Object} userData - User and Org details (username, email, password, firstName, lastName, organizationName, subdomain)
 * @returns {Object} The created user object
 */
const registerUser = async (userData) => {
    const { username, email, password, firstName, lastName } = userData;

    // 1. Basic Availability Checks
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw { status: 409, message: "User with this email already exists" };
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
        throw { status: 409, message: "Username already taken" };
    }

    // 2. Simple User Creation
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isActive: true
    });

    // 3. Return user data (excluding password)
    const userToReturn = await User.findByPk(newUser.id);

    // 4. Send Welcome Email (Non-blocking)
    emailService.sendWelcomeEmail(userToReturn.email, userToReturn.firstName, "ProntoStack POS");

    return userToReturn;
};

/**
 * Service to handle user login
 * Returns user data and their list of allowed organizations.
 * @param {string} email - User email
 * @param {string} password - User plain text password
 * @returns {Object} { user, organizations }
 */
const loginUser = async (email, password) => {
    // Silent Hardening: Block login if system is not activated
    const { isActivated } = require("../../utils/license");
    const active = await isActivated();
    if (!active) {
        throw { status: 402, message: "System core is locked. Please activate the software." };
    }

    // 1. Find user by email (explicitly including password for comparison)
    const user = await User.scope("withPassword").findOne({
        where: { email },
        include: [
            {
                model: OrganizationMember,
                as: 'memberships',
                include: [{ model: Organization, as: 'organization' }]
            }
        ]
    });

    if (!user) {
        throw { status: 401, message: "Invalid email or password" };
    }

    if (!user.isActive) {
        throw { status: 403, message: "Your account is deactivated. Contact an administrator." };
    }

    // 2. Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
         throw { status: 401, message: "Invalid email or password" };
    }

    // 3. Prepare result (no token yet, or a "pre-token" for org selection)
    const organizations = user.memberships
        .filter(m => m.isActive && m.organization && m.organization.isActive)
        .map(m => ({
            id: m.organization.id,
            name: m.organization.name,
            subdomain: m.organization.subdomain,
            role_id: m.role_id
        }));

    // 4. Exclude sensitive data
    const userToReturn = user.toJSON();
    delete userToReturn.password;
    delete userToReturn.memberships;

    return { user: userToReturn, organizations };
};

/**
 * Service to select an organization and receive a full-access token
 * @param {string} userId - ID of the logged in user
 * @param {string} organizationId - ID of the selected organization
 * @returns {Object} { user, token, permissions, menus, activeOrg }
 */
const selectOrganization = async (userId, organizationId) => {
    // 1. Verify Membership
    const membership = await OrganizationMember.findOne({
        where: { user_id: userId, organization_id: organizationId, isActive: true },
        include: [
            {
                model: Organization,
                as: 'organization',
                where: { isActive: true }
            },
            {
                model: Role,
                as: 'role',
                include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
            }
        ]
    });

    if (!membership) {
        throw { status: 403, message: "You are not a member of this organization" };
    }

    // 2. Fetch User and Direct Permissions
    const user = await User.findByPk(userId, {
        include: [{ model: Permission, as: 'directPermissions', through: { attributes: [] } }]
    });

    // 3. Generate JWT with context
    const token = generateToken({ 
        id: user.id, 
        email: user.email,
        activeOrgId: organizationId,
        roleId: membership.role_id 
    });

    // 4. Compute Permissions for this org
    let mergedPermissions = [];
    let allMenus = [];
    
    // Check if user is platform Super Admin (global role) OR Org Owner (org role)
    // For now, let's check the role name in the current membership
    if (membership.role && membership.role.name === 'Super Admin') {
        mergedPermissions = ['*'];
        allMenus = await Menu.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC']] });
    } else {
        const rolePerms = membership.role && membership.role.permissions ? membership.role.permissions.map(p => p.action) : [];
        const directPerms = user.directPermissions ? user.directPermissions.map(p => p.action) : [];
        mergedPermissions = [...new Set([...rolePerms, ...directPerms])];
        
        const activeMenus = await Menu.findAll({ 
            where: { isActive: true }, 
            include: [{ model: Permission, as: 'permissions' }],
            order: [['sortOrder', 'ASC']] 
        });

        const explicitlyAllowed = new Set();
        activeMenus.forEach(menu => {
            if (!menu.permissions || menu.permissions.length === 0) {
                explicitlyAllowed.add(menu.id);
            } else if (menu.permissions.some(p => mergedPermissions.includes(p.action))) {
                explicitlyAllowed.add(menu.id);
            }
        });

        // Bottom-up inheritance: Grant Parent menus if a child is allowed.
        let addedParent = true;
        while (addedParent) {
            addedParent = false;
            activeMenus.forEach(menu => {
                 if (explicitlyAllowed.has(menu.id) && menu.parent_id && !explicitlyAllowed.has(menu.parent_id)) {
                     explicitlyAllowed.add(menu.parent_id);
                     addedParent = true;
                     
                     // Inherit parent's .list permission so frontend routing guards allow access
                     const parentMenu = activeMenus.find(m => m.id === menu.parent_id);
                     if (parentMenu && parentMenu.permissions) {
                         const parentListPerm = parentMenu.permissions.find(p => p.action.endsWith('.list'));
                         if (parentListPerm && !mergedPermissions.includes(parentListPerm.action)) {
                             mergedPermissions.push(parentListPerm.action);
                         }
                     }
                 }
            });
        }

        allMenus = activeMenus.filter(menu => explicitlyAllowed.has(menu.id));
    }

    return { 
        user, 
        token, 
        permissions: mergedPermissions, 
        menus: allMenus, 
        activeOrg: membership.organization 
    };
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
    selectOrganization,
    blacklistToken,
};
