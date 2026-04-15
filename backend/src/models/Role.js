module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        // No simple unique:true — partial unique index handles this at DB level
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Used for soft deletion (False = Deleted)
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
      tableName: "roles",
      timestamps: true,
      defaultScope: {
        where: { isActive: true },
      },
      // Scopes for flexibility
      scopes: {
        active: { where: { isActive: true } },
        all: {},
        inactive: { where: { isActive: false } },
      },
      indexes: [
        {
          unique: true,
          fields: ['name'],
          where: { isActive: true },
          name: 'roles_name_active_unique',
        },
      ],
    },
  );

  Role.associate = (models) => {
    // A role can belong to many users (Global or Org specific)
    if (models.User) {
      Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });
    }
    
    // A role belongs to an organization
    if (models.Organization) {
      Role.belongsTo(models.Organization, { foreignKey: "organization_id", as: "organization" });
    }

    if (models.Permission) {
      Role.belongsToMany(models.Permission, {
          through: models.RolePermission,
          foreignKey: "role_id",
          otherKey: "permission_id",
          as: "permissions"
      });
    }
  };

  return Role;
};
