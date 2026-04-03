const { spawn } = require('child_process');
const { User, Role } = require('../../models');

/**
 * Controller to generate and stream a database backup
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.generateBackup = async (req, res) => {
    try {
        // Permission check (redundant if route uses authorize middleware)
        const { Permission } = require('../../models');
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Role,
                    as: 'role',
                    include: [{ model: Permission, as: 'permissions' }]
                },
                {
                    model: Permission,
                    as: 'directPermissions'
                }
            ]
        });

        const userPermissions = new Set([
            ...(user.role?.permissions?.map(p => p.action) || []),
            ...(user.directPermissions?.map(p => p.action) || [])
        ]);

        // Permission strings use dot notation (e.g., 'backups.generate')
        const hasPermission = userPermissions.has('backups.generate') || userPermissions.has('*');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not have the 'backups.generate' permission."
            });
        }

        // Database connection details from environment variables
        const dbParams = {
            host: process.env.DB_HOST || 'db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'pos_db'
        };

        // Set headers for file download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `pos_backup_${timestamp}.sql`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/sql');

        // Spawn pg_dump process
        const pgDump = spawn('pg_dump', [
            '-h', dbParams.host,
            '-U', dbParams.user,
            '-d', dbParams.database
        ], {
            env: { ...process.env, PGPASSWORD: dbParams.password }
        });

        // Pipe stdout directly to the response object
        pgDump.stdout.pipe(res);

        // Capture any errors from pg_dump
        let errorData = '';
        pgDump.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pgDump.on('close', (code) => {
            if (code !== 0) {
                console.error(`pg_dump exited with code ${code}: ${errorData}`);
                if (!res.headersSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Backup generation failed.',
                        error: errorData
                    });
                } else {
                    // End the response to avoid hanging client
                    res.end();
                }
            }
        });
    } catch (error) {
        console.error('Backup Exception:', error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        } else {
            res.end();
        }
    }
};
