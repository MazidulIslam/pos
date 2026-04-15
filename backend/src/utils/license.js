const crypto = require('crypto');
const { SystemSetting } = require('../models');
require('dotenv').config();

// Memory cache for license status to avoid DB hits on every request
let isSystemActivatedMemo = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Validates a license key string
 * @param {string} key 
 */
const checkKeyFormat = (key) => {
    const SECRET_SALT = 'prontostack_secure_salt_2026';
    if (!key) return false;

    try {
        const parts = key.split('-');
        if (parts.length < 3 || parts[0] !== 'PRONTO') {
            return false;
        }

        const uuid = parts[1];
        const providedHash = parts[parts.length - 1].toLowerCase();

        // Re-calculate hash including the UUID to verify uniqueness
        const expected = crypto
            .createHmac('sha256', SECRET_SALT)
            .update(`ProntoStack-Core-${uuid}`)
            .digest('hex')
            .substring(0, 16);

        return providedHash === expected;
    } catch (error) {
        return false;
    }
};

/**
 * Checks if the system is activated (with caching)
 */
const isActivated = async (bypassCache = false) => {
    const now = Date.now();
    if (!bypassCache && isSystemActivatedMemo !== null && (now - lastCheckTime < CACHE_DURATION)) {
        return isSystemActivatedMemo;
    }

    try {
        const setting = await SystemSetting.findOne({ where: { key: 'license_key' } });
        const key = setting ? setting.value : null;
        
        const isValid = checkKeyFormat(key);
        isSystemActivatedMemo = isValid;
        lastCheckTime = now;
        return isValid;
    } catch (error) {
        console.error('License Check Error:', error);
        return false;
    }
};

/**
 * Middleware to block requests if license is invalid
 */
const licenseGuard = async (req, res, next) => {
    // Exempt routes (relative to /api mount point)
    const exemptRoutes = ['/setup', '/system/status', '/system/activate'];
    if (exemptRoutes.some(route => req.path.startsWith(route))) return next();

    const active = await isActivated();
    if (!active) {
        return res.status(402).json({
            success: false,
            message: "System Activation Required. Please provide a valid license key.",
            isUnactivated: true,
            hint: "Go to Settings > License to activate your system."
        });
    }
    next();
};

/**
 * Clears the license cache (useful after activation)
 */
const clearLicenseCache = () => {
    isSystemActivatedMemo = null;
    lastCheckTime = 0;
};

module.exports = { isActivated, licenseGuard, checkKeyFormat, clearLicenseCache };
