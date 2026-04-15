const { Organization, User, OrganizationMember, Role, sequelize } = require("../../models");

/**
 * Get platform-wide statistics for the Super Admin
 */
const getPlatformStats = async (req, res) => {
    try {
        const totalOrgs = await Organization.count();
        const activeOrgs = await Organization.count({ where: { isActive: true } });
        const totalUsers = await User.count();
        
        // Sum total organizations by status
        const orgStats = await Organization.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalOrganizations: totalOrgs,
                    activeOrganizations: activeOrgs,
                    totalUsers: totalUsers
                },
                organizationsByStatus: orgStats
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return res.status(500).json({ success: false, message: "Could not fetch platform stats" });
    }
};

/**
 * List all organizations for platform management
 */
const getAllOrganizations = async (req, res) => {
    try {
        const isSuperAdmin = req.permissions && req.permissions.includes('*');
        let organizations;

        if (isSuperAdmin) {
            // Global Super Admin sees everything
            organizations = await Organization.findAll({
                include: [
                    { model: User, as: 'owner', attributes: ['id', 'username', 'email'] }
                ],
                order: [['createdAt', 'DESC']]
            });
        } else {
            // Limited admins see only organizations they are members of
            const memberships = await OrganizationMember.findAll({
                where: { user_id: req.user.id },
                attributes: ['organization_id']
            });
            const orgIds = memberships.map(m => m.organization_id);

            organizations = await Organization.findAll({
                where: { id: orgIds },
                include: [
                    { model: User, as: 'owner', attributes: ['id', 'username', 'email'] }
                ],
                order: [['createdAt', 'DESC']]
            });
        }

        return res.status(200).json({
            success: true,
            data: organizations
        });
    } catch (error) {
        console.error("List orgs error:", error);
        return res.status(500).json({ success: false, message: "Could not fetch organizations" });
    }
};

/**
 * Update organization details (Name, Status, Activation)
 */
const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, isActive } = req.body;

        const org = await Organization.findByPk(id);
        if (!org) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        // Ensure status is correctly capitalized if provided
        if (status) {
            const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            updateData.status = capitalizedStatus;
        }

        await org.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: org
        });
    } catch (error) {
        console.error("Update org error:", error);
        return res.status(500).json({ success: false, message: "Could not update organization" });
    }
};

/**
 * Create a new organization and assign an owner
 */
const createOrganization = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, subdomain, ownerEmail } = req.body;

        if (!name || !subdomain || !ownerEmail) {
            return res.status(400).json({ success: false, message: "Name, subdomain and owner email are required" });
        }

        // 1. Check if subdomain is available
        const existingOrg = await Organization.findOne({ where: { subdomain } });
        if (existingOrg) {
            return res.status(400).json({ success: false, message: "Subdomain is already taken" });
        }

        // 2. Find the user who will be the owner
        const owner = await User.findOne({ where: { email: ownerEmail } });
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner user not found. Please create the user first." });
        }

        // 3. Create the organization
        const organization = await Organization.create({
            name,
            subdomain,
            status: 'Active',
            isActive: true,
            createdBy: owner.id
        }, { transaction: t });

        // 4. Find the Super Admin role for the organization (or use global if available)
        const superAdminRole = await Role.findOne({ where: { name: 'Super Admin' } });

        // 5. Link owner to the new organization
        await OrganizationMember.create({
            user_id: owner.id,
            organization_id: organization.id,
            role_id: superAdminRole ? superAdminRole.id : null,
            isActive: true
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: organization
        });
    } catch (error) {
        await t.rollback();
        console.error("Create org error:", error);
        return res.status(500).json({ success: false, message: "Could not create organization" });
    }
};

/**
 * Fetch all members of a specific organization
 */
const getOrganizationMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await OrganizationMember.findAll({
            where: { organization_id: id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
                { model: Role, as: 'role', attributes: ['id', 'name'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error("Get members error:", error);
        return res.status(500).json({ success: false, message: "Could not fetch members" });
    }
};

/**
 * Add a user to an organization by email
 */
const addOrganizationMember = async (req, res) => {
    try {
        const { id: organizationId } = req.params;
        const { email, roleName = 'Super Admin' } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "User email is required" });
        }

        // 1. Find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email" });
        }

        // 2. Check if already a member
        const existingMember = await OrganizationMember.findOne({
            where: { user_id: user.id, organization_id: organizationId }
        });
        if (existingMember) {
            return res.status(400).json({ success: false, message: "User is already a member of this organization" });
        }

        // 3. Find the role to assign
        const role = await Role.findOne({ where: { name: roleName } });

        // 4. Create membership
        const membership = await OrganizationMember.create({
            user_id: user.id,
            organization_id: organizationId,
            role_id: role ? role.id : null,
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "User assigned to organization successfully",
            data: membership
        });
    } catch (error) {
        console.error("Add member error:", error);
        return res.status(500).json({ success: false, message: "Could not assign user to organization" });
    }
};

/**
 * Remove a user from an organization
 */
const removeOrganizationMember = async (req, res) => {
    try {
        const { id: organizationId, userId } = req.params;

        const deleted = await OrganizationMember.destroy({
            where: { user_id: userId, organization_id: organizationId }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User removed from organization successfully"
        });
    } catch (error) {
        console.error("Remove member error:", error);
        return res.status(500).json({ success: false, message: "Could not remove user from organization" });
    }
};

module.exports = {
    getPlatformStats,
    getAllOrganizations,
    updateOrganization,
    createOrganization,
    getOrganizationMembers,
    addOrganizationMember,
    removeOrganizationMember
};
