const seedBackups = require('./backend/src/seeds/seed-backups');
const { sequelize } = require('./backend/src/config/db');

async function run() {
    try {
        await seedBackups();
        console.log('Seed executed');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
