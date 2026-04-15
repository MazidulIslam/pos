/**
 * Utility to apply organization scoping to Sequelize models.
 * This ensures that queries are automatically filtered by organization_id
 * unless overridden.
 * 
 * @param {Object} model - The Sequelize model
 * @param {Object} options - Configuration options
 */
const applyTenantScope = (model) => {
    // Add organization_id to default ignore list for some operations if needed
    
    // Add a scope called 'tenant'
    // Note: In Sequelize, defaultScope is static. 
    // For dynamic scoping (based on req.activeOrgId), we usually use a middleware
    // that sets a namespace or we manually add the where clause.
    
    // However, we can add a hook that automatically adds the organization_id 
    // to search queries if it's present in the options.
    
    model.addHook('beforeFind', (options) => {
        if (options.organization_id) {
            options.where = {
                ...options.where,
                organization_id: options.organization_id
            };
        } else if (options.activeOrgId) {
            // For many-to-many, we might want to check the membership
            // but for simplicity in this template, we'll just use the organization_id field
            options.where = {
                ...options.where,
                organization_id: options.activeOrgId
            };
        }
    });

    model.addHook('beforeCreate', (instance, options) => {
        if (options.organization_id && !instance.organization_id) {
            instance.organization_id = options.organization_id;
        } else if (options.activeOrgId && !instance.organization_id) {
            instance.organization_id = options.activeOrgId;
        }
    });
};

module.exports = { applyTenantScope };
