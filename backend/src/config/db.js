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

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("PostgreSQL connected successfully.");
      await sequelize.sync({ alter: true });
      console.log("Database synchronized.");
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
