const { Menu, Permission, Role, RolePermission, sequelize } = require('../models');

async function seedBackups() {
    console.log('--- Seeding Database Backup Subsystem ---');
    const transaction = await sequelize.transaction();

    try {
        // 1. Find or Create "Settings" Parent Menu
        let settingsMenu = await Menu.findOne({ where: { slug: 'settings' }, transaction });
        
        if (!settingsMenu) {
            console.log('Creating "Settings" menu...');
            settingsMenu = await Menu.create({
                name: 'Settings',
                slug: 'settings',
                path: '/settings',
                icon: 'Settings',
                sortOrder: 100,
                isActive: true
            }, { transaction });
        }

        // 2. Find or Create "Backups" Child Menu
        let backupsMenu = await Menu.findOne({ where: { slug: 'backups' }, transaction });

        if (!backupsMenu) {
            console.log('Creating "Backups" menu...');
            backupsMenu = await Menu.create({
                name: 'Backups',
                slug: 'backups',
                path: '/settings/backups',

                parent_id: settingsMenu.id,
                sortOrder: 5,
                isActive: true
            }, { transaction });
        }

        // 3. Ensure Backup Permission exists
        let backupPermission = await Permission.findOne({ 
            where: { action: 'backups:generate', menu_id: backupsMenu.id }, 
            transaction 
        });

        if (!backupPermission) {
            console.log('Creating "backups:generate" permission...');
            backupPermission = await Permission.create({
                menu_id: backupsMenu.id,
                name: 'Generate Database Backups',
                action: 'backups:generate',
                isDefault: false,
                isActive: true
            }, { transaction });
        }

        // 4. Assign to Super Admin Role (if it exists)
        const superAdminRole = await Role.findOne({ where: { name: 'Super Admin' }, transaction });
        if (superAdminRole && backupPermission) {
            const hasPermission = await RolePermission.findOne({
                where: { role_id: superAdminRole.id, permission_id: backupPermission.id },
                transaction
            });

            if (!hasPermission) {
                console.log('Assigning backup permission to Super Admin...');
                await RolePermission.create({
                    role_id: superAdminRole.id,
                    permission_id: backupPermission.id
                }, { transaction });
            }
        }

        await transaction.commit();
        console.log('--- Backup Subsystem Seeded Successfully ---');
    } catch (error) {
        await transaction.rollback();
        console.error('Error seeding backup subsystem:', error);
        throw error;
    }
}

module.exports = seedBackups;
