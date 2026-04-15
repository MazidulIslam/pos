const { SystemSetting } = require("../../models");
const { isActivated, checkKeyFormat } = require("../../utils/license");

/**
 * Get current activation status of the system
 */
const getStatus = async (req, res) => {
    try {
        const activated = await isActivated(true); // Bypass memo to get fresh status
        
        return res.status(200).json({
            success: true,
            isActivated: activated,
            message: activated ? "System is activated" : "System activation required"
        });
    } catch (error) {
        console.error("Get Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching system status"
        });
    }
};

/**
 * Activate the system with a license key
 */
const activate = async (req, res) => {
    try {
        const { purchaseCode } = req.body;

        if (!purchaseCode) {
            return res.status(400).json({
                success: false,
                message: "Purchase code is required"
            });
        }

        // 1. Validate key format
        const isValid = checkKeyFormat(purchaseCode);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid license key format"
            });
        }

        // 2. Save to database
        await SystemSetting.upsert({
            key: 'license_key',
            value: purchaseCode,
            description: 'Main system activation license key'
        });

        // 3. Clear memory cache for immediate activation
        const { clearLicenseCache } = require("../../utils/license");
        clearLicenseCache();

        return res.status(200).json({
            success: true,
            message: "System activated successfully",
            isActivated: true
        });
    } catch (error) {
        console.error("Activation Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during activation"
        });
    }
};

module.exports = {
    getStatus,
    activate
};
