const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "pos_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
);

const fixUniqueConstraints = async () => {
  try {
    // Drop old absolute unique constraints (they block soft-deleted records)
    await sequelize.query('ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_slug_key;');
    await sequelize.query('DROP INDEX IF EXISTS menus_slug_key;');
    await sequelize.query('DROP INDEX IF EXISTS menus_slug_unique;');

    await sequelize.query('ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_action_key;');
    await sequelize.query('DROP INDEX IF EXISTS permissions_action_key;');
    await sequelize.query('DROP INDEX IF EXISTS permissions_action_unique;');

    await sequelize.query('ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key;');
    await sequelize.query('DROP INDEX IF EXISTS roles_name_key;');
    await sequelize.query('DROP INDEX IF EXISTS roles_name_unique;');

    // Create partial unique indexes (only active records)
    await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS menus_slug_active_unique ON menus (slug) WHERE "isActive" = true;');
    await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS permissions_action_active_unique ON permissions (action) WHERE "isActive" = true;');
    await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS roles_name_active_unique ON roles (name) WHERE "isActive" = true;');

    console.log("Unique constraints fixed for soft-delete support.");
  } catch (error) {
    console.error("Warning: Could not fix unique constraints:", error.message);
  }
};

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("PostgreSQL connected successfully.");
      await sequelize.sync({ alter: true });
      console.log("Database synchronized.");
      await fixUniqueConstraints();
      return;
    } catch (error) {
      console.error(
        `Unable to connect to the database (${retries} retries left):`,
        error.message,
      );
      retries -= 1;
      // Wait for 5 seconds before retrying
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  process.exit(1);
};

module.exports = { sequelize, connectDB };
