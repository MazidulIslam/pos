module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [3, 50],
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true, // Used for soft deletion (False = Deleted)
            },

            roleId: {
                type: DataTypes.UUID,
                allowNull: true, // Optional linking to Role for robust access control
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updatedBy: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            organization_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "users",
            timestamps: true,
            defaultScope: {
                attributes: { exclude: ["password"] },
                where: { isActive: true },
            },
            scopes: {
                withPassword: {
                    attributes: { include: ["password"] },
                },
            },
        },
    );

    User.associate = (models) => {
        // A user belongs to a role (Default/Global role if any)
        if (models.Role) {
            User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
        }
        
        // Multi-tenancy: A user can belong to multiple organizations
        if (models.Organization && models.OrganizationMember) {
            User.belongsToMany(models.Organization, {
                through: models.OrganizationMember,
                foreignKey: "user_id",
                otherKey: "organization_id",
                as: "organizations"
            });
            User.hasMany(models.OrganizationMember, { foreignKey: "user_id", as: "memberships" });
        }

        if (models.Permission) {
            User.belongsToMany(models.Permission, {
                through: "user_permissions",
                foreignKey: "user_id",
                otherKey: "permission_id",
                as: "directPermissions"
            });
        }
    };

    return User;
};
