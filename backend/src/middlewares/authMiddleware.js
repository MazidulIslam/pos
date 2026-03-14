const { verifyToken } = require("../utils/jwt");
const { User, BlacklistedToken } = require("../models");

/**
 * Middleware to protect routes by verifying JWT
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Check if Authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // 2. Extract token
            token = req.headers.authorization.split(" ")[1];

            // 3. Verify token mathematically
            const decoded = verifyToken(token);

            // 4. Check if token is physically blacklisted
            const isBlacklisted = await BlacklistedToken.findOne({
                where: { token },
            });

            if (isBlacklisted) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, token has been invalidated",
                });
            }

            // 5. Find user by id from token payload and attach to request
            req.user = await User.findByPk(decoded.id);
            req.token = token;
            req.tokenExp = decoded.exp;

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user no longer exists",
                });
            }

            if (!req.user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: "User account is deactivated",
                });
            }

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

module.exports = { protect };
