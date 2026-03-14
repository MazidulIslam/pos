const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { sequelize } = require('../config/db');

const db = {};
const basename = path.basename(__filename);

// Read all files in the current directory, filter out this index file and non-JS files
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Initialize each model and add it to the db object
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Execute the associate method for any model that has relationships defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export the sequelize connection and Sequelize library along with models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
