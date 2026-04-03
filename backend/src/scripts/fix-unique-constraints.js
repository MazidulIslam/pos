/**
 * Migration: Replace absolute unique constraints with partial unique indexes
 * that only enforce uniqueness among active (isActive=true) records.
 * 
 * This allows soft-deleted records to not block creation of new records
 * with the same slug/action/name.
 * 
 * Run: docker exec pos-backend-1 node src/scripts/fix-unique-constraints.js
 */
const { sequelize } = require('../config/db');

async function fixUniqueConstraints() {
    const transaction = await sequelize.transaction();
    try {
        console.log('🔧 Fixing unique constraints to support soft-delete...\n');

        // 1. Drop old unique constraint on menus.slug
        console.log('1. Dropping old menus.slug unique constraint...');
        try {
            await sequelize.query('ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_slug_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS menus_slug_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS menus_slug_unique;', { transaction });
            console.log('   ✅ Old menus.slug constraint dropped');
        } catch (e) {
            console.log('   ⚠️  menus.slug constraint may not exist, skipping:', e.message);
        }

        // 2. Drop old unique constraint on permissions.action
        console.log('2. Dropping old permissions.action unique constraint...');
        try {
            await sequelize.query('ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_action_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS permissions_action_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS permissions_action_unique;', { transaction });
            console.log('   ✅ Old permissions.action constraint dropped');
        } catch (e) {
            console.log('   ⚠️  permissions.action constraint may not exist, skipping:', e.message);
        }

        // 3. Drop old unique constraint on roles.name
        console.log('3. Dropping old roles.name unique constraint...');
        try {
            await sequelize.query('ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS roles_name_key;', { transaction });
            await sequelize.query('DROP INDEX IF EXISTS roles_name_unique;', { transaction });
            console.log('   ✅ Old roles.name constraint dropped');
        } catch (e) {
            console.log('   ⚠️  roles.name constraint may not exist, skipping:', e.message);
        }

        // 4. Create partial unique indexes (only for active records)
        console.log('4. Creating partial unique indexes for active records...');

        await sequelize.query(
            'CREATE UNIQUE INDEX IF NOT EXISTS menus_slug_active_unique ON menus (slug) WHERE "isActive" = true;',
            { transaction }
        );
        console.log('   ✅ menus_slug_active_unique created');

        await sequelize.query(
            'CREATE UNIQUE INDEX IF NOT EXISTS permissions_action_active_unique ON permissions (action) WHERE "isActive" = true;',
            { transaction }
        );
        console.log('   ✅ permissions_action_active_unique created');

        await sequelize.query(
            'CREATE UNIQUE INDEX IF NOT EXISTS roles_name_active_unique ON roles (name) WHERE "isActive" = true;',
            { transaction }
        );
        console.log('   ✅ roles_name_active_unique created');

        await transaction.commit();
        console.log('\n🎉 All unique constraints updated successfully!');
        console.log('   Soft-deleted records will no longer block new creations.');
        process.exit(0);
    } catch (error) {
        await transaction.rollback();
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

fixUniqueConstraints();
