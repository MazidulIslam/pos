const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_change_me_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Generates a JSON Web Token for an authenticated user.
 * @param {Object} payload - Data to embed in the token (e.g., { id, roleId })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JSON Web Token.
 * @param {string} token - The token to verify
 * @returns {Object} Decoded payload if verified
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};
