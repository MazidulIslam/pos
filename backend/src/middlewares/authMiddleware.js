const { verifyToken } = require("../utils/jwt");
const { User, Role, Permission, BlacklistedToken } = require("../models");

/**
 * Middleware to protect routes by verifying JWT
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

            // Check blacklist
            const isBlacklisted = await BlacklistedToken.findOne({
                where: { token },
            });

            if (isBlacklisted) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized alt token",
                });
            }

            // Find user with Role and Permissions
            const user = await User.findByPk(decoded.id, {
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
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user no longer exists",
                });
            }



            // Compute actual permissions for this request
            let permissions = [];
            if (user.role && user.role.name === 'Super Admin') {
                permissions = ['*'];
            } else {
                const rolePerms = user.role && user.role.permissions ? user.role.permissions.map(p => p.action) : [];
                const directPerms = user.directPermissions ? user.directPermissions.map(p => p.action) : [];
                permissions = [...new Set([...rolePerms, ...directPerms])];
            }

            req.user = user;
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
