const { User, Role, Menu, Sequelize } = require('../../models');
const { Op } = Sequelize;

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        const query = q.trim();

        // Parallel search across models
        const [users, roles, menus] = await Promise.all([
            User.findAll({
                where: {
                    [Op.or]: [
                        { firstName: { [Op.iLike]: `%${query}%` } },
                        { lastName: { [Op.iLike]: `%${query}%` } },
                        { username: { [Op.iLike]: `%${query}%` } },
                        { email: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                attributes: ['id', 'firstName', 'lastName', 'username', 'email'],
                limit: 5
            }),
            Role.findAll({
                where: {
                    name: { [Op.iLike]: `%${query}%` }
                },
                attributes: ['id', 'name'],
                limit: 5
            }),
            Menu.findAll({
                where: {
                    name: { [Op.iLike]: `%${query}%` }
                },
                attributes: ['id', 'name', 'path', 'slug'],
                limit: 5
            })
        ]);

        // Standardize output
        const results = [
            ...users.map(u => ({
                id: u.id,
                title: `${u.firstName} ${u.lastName}`.trim() || u.username,
                subtitle: u.email,
                type: 'User',
                path: '/settings/users',
                icon: 'People'
            })),
            ...roles.map(r => ({
                id: r.id,
                title: r.name,
                subtitle: 'System Role',
                type: 'Role',
                path: '/settings/roles',
                icon: 'ManageAccounts'
            })),
            ...menus.map(m => ({
                id: m.id,
                title: m.name,
                subtitle: 'Management Module',
                type: 'Menu',
                path: m.path,
                icon: 'Menu'
            }))
        ];

        return res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Global search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during search'
        });
    }
};
