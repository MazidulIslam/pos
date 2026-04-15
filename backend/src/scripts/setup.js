const bcrypt = require('bcrypt');
const {
    sequelize,
    Role,
    User,
    Menu,
    Permission,
    RolePermission,
    Organization,
    OrganizationMember
} = require('../models');

async function setup() {
    console.log('--- Starting System Setup ---');

    try {
        // 1. Sync Database
        console.log('Syncing database schema...');
        await sequelize.sync({ alter: true });

        // 2. Create Default Master Organization
        console.log('Ensuring Master Organization exists...');
        const [masterOrg] = await Organization.findOrCreate({
            where: { subdomain: 'master' },
            defaults: {
                name: 'ProntoStack Master',
                subdomain: 'master',
                status: 'Active',
                isActive: true
            }
        });

        // 3. Create Super Admin Role
        console.log('Ensuring Super Admin role exists...');
        const [superAdminRole] = await Role.findOrCreate({
            where: { name: 'Super Admin' },
            defaults: {
                description: 'Full system access with all permissions',
                isActive: true
            }
        });

        // 4. Define Menus and their Permissions
        const menuData = [
            {
                name: 'Dashboard', slug: 'dashboard', path: '/', icon: 'Dashboard', sortOrder: 1,
                permissions: ['list']
            },
            {
                name: 'Platform Admin', slug: 'platform-admin', path: '/admin', icon: 'Shield', sortOrder: 5,
                permissions: ['list'],
                children: [
                    { name: 'Organizations', slug: 'admin-organizations', path: '/admin/organizations', icon: 'Business', sortOrder: 1, permissions: ['list', 'update'] },
                    { name: 'Global Stats', slug: 'admin-stats', path: '/admin/stats', icon: 'BarChart', sortOrder: 2, permissions: ['list'] },
                ]
            },
            {
                name: 'Reports', slug: 'reports', path: '/reports', icon: 'BarChart', sortOrder: 50,
                permissions: ['list'],
                children: [
                    {
                        name: 'Sales', slug: 'sales-reports', path: '/reports/sales', icon: 'ShowChart', sortOrder: 1,
                        permissions: ['list'],
                        children: [
                            { name: 'Monthly Analysis', slug: 'monthly-sales', path: '/reports/sales/monthly', icon: 'PointOfSale', sortOrder: 1 },
                            { name: 'Annual Recap', slug: 'annual-sales', path: '/reports/sales/annual', icon: 'Visibility', sortOrder: 2 },
                        ]
                    },
                    { name: 'Inventory Logs', slug: 'inv-logs', path: '/reports/inventory', icon: 'Inventory', sortOrder: 2 },
                ]
            },
            {
                name: 'Settings', slug: 'settings', path: '/settings', icon: 'Settings', sortOrder: 1000,
                permissions: ['list'],
                children: [
                    {
                        name: 'Profile', slug: 'profile', path: '/settings/profile', icon: 'Person', sortOrder: 0,
                        permissions: ['list', 'update']
                    },
                    { name: 'Users', slug: 'users', path: '/settings/users', icon: 'People', sortOrder: 1 },
                    { name: 'Roles', slug: 'roles', path: '/settings/roles', icon: 'ManageAccounts', sortOrder: 2 },
                    { name: 'Menus', slug: 'menus', path: '/settings/menus', icon: 'Menu', sortOrder: 3 },
                    { name: 'Appearance', slug: 'appearance', path: '/settings/appearance', icon: 'Palette', sortOrder: 4 },
                    { 
                        name: 'System License', slug: 'system-license', path: '/settings/license', icon: 'Lock', sortOrder: 5,
                        permissions: ['list', 'update']
                    },
                    {
                        name: 'Backups', slug: 'backups', path: '/settings/backups', icon: 'Backup', sortOrder: 6,
                        permissions: ['list', 'generate']
                    },
                    {
                        name: 'Account Settings', slug: 'account', path: '/settings/account', icon: 'Lock', sortOrder: 5,
                        permissions: ['list', 'update']
                    },
                ]
            }
        ];

        console.log('Seeding menus and permissions...');

        const processMenu = async (m, parentId = null) => {
            let menu = await Menu.findOne({ where: { slug: m.slug } });

            if (menu) {
                // Update existing menu
                await menu.update({
                    name: m.name,
                    path: m.path,
                    icon: m.icon,
                    sortOrder: m.sortOrder,
                    parent_id: parentId,
                    isActive: true
                });
            } else {
                // Create new menu
                menu = await Menu.create({
                    name: m.name,
                    slug: m.slug,
                    path: m.path,
                    icon: m.icon,
                    sortOrder: m.sortOrder,
                    parent_id: parentId,
                    isActive: true
                });
            }

            // Determine Permissions
            const actions = m.permissions || ['list', 'view', 'create', 'update', 'delete'];
            const allowedActions = actions.map(action => `${m.slug}.${action}`);

            // Remove old permissions that are no longer needed for this menu
            await Permission.destroy({
                where: {
                    menu_id: menu.id,
                    action: { [sequelize.Sequelize.Op.notIn]: allowedActions }
                }
            });

            // Ensure specified permissions exist
            for (const actionSuffix of actions) {
                const fullAction = `${m.slug}.${actionSuffix}`;
                const [permission, created] = await Permission.findOrCreate({
                    where: { action: fullAction },
                    defaults: {
                        menu_id: menu.id,
                        name: `${m.name} ${actionSuffix.charAt(0).toUpperCase() + actionSuffix.slice(1)}`,
                        isActive: true,
                        isDefault: true
                    }
                });

                if (!created) {
                    // Update existing permission to ensure it's linked to correct menu and is active
                    await permission.update({
                        menu_id: menu.id,
                        name: `${m.name} ${actionSuffix.charAt(0).toUpperCase() + actionSuffix.slice(1)}`,
                        isActive: true,
                        isDefault: true
                    });
                }
            }

            if (m.children) {
                for (const child of m.children) {
                    await processMenu(child, menu.id);
                }
            }
        };

        for (const m of menuData) {
            await processMenu(m);
        }

        // 5. Assign All Permissions to Super Admin
        console.log('Assigning all permissions to Super Admin...');
        const allPermissions = await Permission.findAll();
        for (const perm of allPermissions) {
            await RolePermission.findOrCreate({
                where: { role_id: superAdminRole.id, permission_id: perm.id }
            });
        }

        // 6. Create Initial Super Admin User
        console.log('Checking for Super Admin user...');
        let adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
        
        if (!adminUser) {
            console.log('Creating initial Super Admin user (admin@example.com)...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                roleId: superAdminRole.id,
                isActive: true
            });
            console.log('IMPORTANT: Default credentials are admin@example.com / admin123');
        } else {
            console.log('Super Admin user already exists.');
        }

        // 7. Ensure Membership
        console.log('Linking Super Admin to Master Organization...');
        await OrganizationMember.findOrCreate({
            where: { 
                user_id: adminUser.id, 
                organization_id: masterOrg.id 
            },
            defaults: {
                role_id: superAdminRole.id,
                isActive: true
            }
        });

        console.log('--- Setup Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('--- Setup Failed ---');
        console.error(error);
        process.exit(1);
    }
}

setup();
