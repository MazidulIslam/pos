module.exports = (sequelize, DataTypes) => {
    const RolePermission = sequelize.define(
        "RolePermission",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            role_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            permission_id: {
                type: DataTypes.UUID,
                allowNull: false,
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
            tableName: "role_permissions",
            timestamps: true,
        }
    );

    return RolePermission;
};
