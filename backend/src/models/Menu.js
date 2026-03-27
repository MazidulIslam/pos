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
                unique: true,
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
        }
    );

    Menu.associate = (models) => {
        Menu.hasMany(models.Permission, { foreignKey: "menu_id", as: "permissions", onDelete: "CASCADE" });
        Menu.belongsTo(models.Menu, { foreignKey: "parent_id", as: "parent" });
        Menu.hasMany(models.Menu, { foreignKey: "parent_id", as: "children" });
        
        if (models.User) {
            Menu.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
            Menu.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });
        }
    };

    return Menu;
};
