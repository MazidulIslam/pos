module.exports = (sequelize, DataTypes) => {
    const OrganizationMember = sequelize.define(
        "OrganizationMember",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            organization_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.UUID,
                allowNull: true, // Specific role within this organization
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "organization_members",
            timestamps: true,
        }
    );

    OrganizationMember.associate = (models) => {
        if (models.User) {
            OrganizationMember.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
        }
        if (models.Organization) {
            OrganizationMember.belongsTo(models.Organization, { foreignKey: "organization_id", as: "organization" });
        }
        if (models.Role) {
            OrganizationMember.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
        }
    };

    return OrganizationMember;
};
