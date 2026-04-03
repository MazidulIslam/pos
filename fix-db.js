const { sequelize } = require('./backend/src/config/db');
const db = require('./backend/src/models');
const seedBackups = require('./backend/src/seeds/seed-backups');

async function fix() {
    try {
        console.log('Synchronizing database...');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
        
        console.log('Running seeder...');
        await seedBackups();
        console.log('Seeder executed successfully.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error during fix:', err);
        process.exit(1);
    }
}

fix();
