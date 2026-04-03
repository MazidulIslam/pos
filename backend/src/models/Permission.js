module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define(
        "Permission",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            menu_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: { notEmpty: true },
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
                // No simple unique:true — partial unique index handles this at DB level
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
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
            tableName: "permissions",
            timestamps: true,
            // No defaultScope — use explicit where: { isActive: true } in queries
            scopes: {
                active: { where: { isActive: true } },
                all: {},
                inactive: { where: { isActive: false } },
            },
            indexes: [
                {
                    unique: true,
                    fields: ['action'],
                    where: { isActive: true },
                    name: 'permissions_action_active_unique',
                },
            ],
        }
    );

    Permission.associate = (models) => {
        Permission.belongsTo(models.Menu, { foreignKey: "menu_id", as: "menu" });
        
        if (models.Role) {
            Permission.belongsToMany(models.Role, {
                through: models.RolePermission,
                foreignKey: "permission_id",
                otherKey: "role_id",
                as: "roles"
            });
        }
        
        if (models.User) {
            Permission.belongsToMany(models.User, {
                through: "user_permissions",
                foreignKey: "permission_id",
                otherKey: "user_id",
                as: "users"
            });
            Permission.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
            Permission.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });
        }
    };

    return Permission;
};
