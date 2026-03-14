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
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: "Array of permission strings defining access levels",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "roles",
      timestamps: true,
    },
  );

  Role.associate = (models) => {
    // A role can belong to many users
    if (models.User) {
      Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });
    }
  };

  return Role;
};
