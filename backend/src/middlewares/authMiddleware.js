const { verifyToken } = require("../utils/jwt");
const { User, Role, Permission, BlacklistedToken, OrganizationMember, Organization } = require("../models");

/**
 * Middleware to protect routes by verifying JWT and identifying the active tenant
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = verifyToken(token);

            // 1. Check blacklist
            const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
            if (isBlacklisted) {
                return res.status(401).json({ success: false, message: "Session invalid or logged out" });
            }

            // 2. Extract Active Organization
            const { id: userId, activeOrgId } = decoded;

            // 3. Verify Membership and Org Status
            const membership = await OrganizationMember.findOne({
                where: { user_id: userId, organization_id: activeOrgId, isActive: true },
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
                 return res.status(401).json({
                    success: false,
                    message: "User does not have access to this organization or organization is suspended",
                });
            }

            // 4. Fetch User with Platform Role and Direct Permissions
            const user = await User.findByPk(userId, {
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

            if (!user || !user.isActive) {
                return res.status(401).json({ success: false, message: "User account deactivated" });
            }

            // 5. Compute Layered Permissions
            let permissions = [];
            
            // Check for Super Admin bypass at Platform Level OR Workspace Level
            const isPlatformSuperAdmin = user.role && user.role.name === 'Super Admin';
            const isWorkspaceSuperAdmin = membership.role && membership.role.name === 'Super Admin';

            if (isPlatformSuperAdmin || isWorkspaceSuperAdmin) {
                permissions = ['*'];
            } else {
                // Merge permissions from all sources
                const platformRolePerms = user.role && user.role.permissions ? user.role.permissions.map(p => p.action) : [];
                const workspaceRolePerms = membership.role && membership.role.permissions ? membership.role.permissions.map(p => p.action) : [];
                const directPerms = user.directPermissions ? user.directPermissions.map(p => p.action) : [];

                permissions = [...new Set([...platformRolePerms, ...workspaceRolePerms, ...directPerms])];
            }

            // 6. Set request context
            req.user = user;
            req.activeOrgId = activeOrgId;
            req.activeOrg = membership.organization;
            req.membership = membership;
            req.permissions = permissions;
            req.token = token;
            req.tokenExp = decoded.exp;

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Not authorized, token failed or expired",
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided",
        });
    }
};

/**
 * Middleware factory to authorize specific permissions
 * @param {string|string[]} requiredPermissions - Action(s) required to access route
 */
const authorize = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.permissions) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: No permissions found for user"
            });
        }

        // Super Admin Bypass
        if (req.permissions.includes('*')) {
            return next();
        }

        // Check if user has the specific permission
        const hasPerm = req.permissions.includes(requiredPermission);

        if (!hasPerm) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You do not have permission to perform this action (${requiredPermission})`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
