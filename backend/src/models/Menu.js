module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define(
        "Menu",
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
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                // No simple unique:true — partial unique index handles this at DB level
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            parent_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
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
            tableName: "menus",
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
                    fields: ['slug'],
                    where: { isActive: true },
                    name: 'menus_slug_active_unique',
                },
            ],
        }
    );

    Menu.associate = (models) => {
        Menu.hasMany(models.Permission, { foreignKey: "menu_id", as: "permissions", onDelete: "CASCADE" });
        Menu.belongsTo(models.Menu, { foreignKey: "parent_id", as: "parent" });
        Menu.hasMany(models.Menu, { foreignKey: "parent_id", as: "children" });
        
        if (models.Organization) {
            Menu.belongsTo(models.Organization, { foreignKey: "organization_id", as: "organization" });
        }

        if (models.User) {
            Menu.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
            Menu.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });
        }
    };

    return Menu;
};
