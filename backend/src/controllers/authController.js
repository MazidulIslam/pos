const authService = require("../services/authService");

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email, and password are required",
            });
        }

        const user = await authService.registerUser({
            username,
            email,
            password,
            firstName,
            lastName,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "An unexpected error occurred during registration",
        });
    }
};

/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const { user, token } = await authService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            data: {
                user,
                token,
            },
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "An unexpected error occurred during login",
        });
    }
};

/**
 * Handle user logout by blacklisting the token
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const token = req.token;
        const exp = req.tokenExp;

        if (token && exp) {
            await authService.blacklistToken(token, exp);
        }

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "An unexpected error occurred during logout",
        });
    }
};

module.exports = {
    register,
    login,
    logout,
};
