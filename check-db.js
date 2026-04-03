const { Menu, Role, Permission } = require('./backend/src/models');
const { sequelize } = require('./backend/src/config/db');

async function check() {
    try {
        const menus = await Menu.findAll({ raw: true });
        console.log('--- ALL MENUS ---');
        menus.forEach(m => {
            console.log(`Menu: ${m.name}, Slug: ${m.slug}, Path: ${m.path}, Parent: ${m.parent_id}`);
        });
        
        const roles = await Role.findAll({ raw: true });
        console.log('--- ALL ROLES ---');
        roles.forEach(r => {
            console.log(`Role: ${r.name}, ID: ${r.id}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
