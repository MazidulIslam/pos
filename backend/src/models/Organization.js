module.exports = (sequelize, DataTypes) => {
    const Organization = sequelize.define(
        "Organization",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: { notEmpty: true },
            },
            subdomain: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { 
                    notEmpty: true,
                    is: /^[a-z0-9-]+$/i, // Only alphanumeric and hyphens
                },
            },
            logo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            licenseKey: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active", "Suspended", "Trial"),
                defaultValue: "Trial",
            },
            branding: {
                type: DataTypes.JSONB,
                defaultValue: {},
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: true,
            },
        },
        {
            tableName: "organizations",
            timestamps: true,
        }
    );

    Organization.associate = (models) => {
        if (models.User) {
            Organization.belongsToMany(models.User, {
                through: models.OrganizationMember,
                foreignKey: "organization_id",
                otherKey: "user_id",
                as: "members",
            });
            Organization.belongsTo(models.User, { foreignKey: "createdBy", as: "owner" });
        }
        // Link all other tenant-specific models
        if (models.Role) {
            Organization.hasMany(models.Role, { foreignKey: "organization_id", as: "roles" });
        }
    };

    return Organization;
};
