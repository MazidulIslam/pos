const { connectDB, sequelize } = require('/Users/mazidulislam/Documents/Projects/docker-projects/pos/backend/src/config/db.js');
const { User } = require('/Users/mazidulislam/Documents/Projects/docker-projects/pos/backend/src/models/index.js');

sequelize.options.host = 'localhost';
sequelize.options.port = 5432;
sequelize.config.host = 'localhost';
sequelize.config.port = 5432;

async function reactivate() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');

        const users = await User.unscoped().findAll();
        for(let user of users) {
             if (user.email === 'admin@example.com') {
                  await user.update({ isUserActive: true, isActive: true });
                  console.log('Admin account successfully reactivated!');
             }
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
reactivate();
