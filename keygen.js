/**
 * ProntoStack - PRIVATE LICENSE KEY GENERATOR
 * =========================================
 * 
 * IMPORTANT: NEVER SHIP THIS FILE TO BUYERS. 
 * This file contains your PRIVATE SALT and the algorithm for generating keys.
 * Keep this on your local machine only.
 */
const crypto = require('crypto');

// This salt MUST match the one in backend/src/utils/license.js
const SECRET_SALT = 'prontostack_secure_salt_2026';

/**
 * Generates a valid activation key
 * @param {string} id - Identifier for the key (e.g. buyer email or 'Core')
 */
const generateKey = (id = 'Core') => {
    const uuid = crypto.randomUUID().substring(0, 8).toUpperCase();
    
    // The signature is bound to the ID and the UUID
    const hash = crypto
        .createHmac('sha256', SECRET_SALT)
        .update(`ProntoStack-${id}-${uuid}`)
        .digest('hex')
        .substring(0, 16);
    
    return `PRONTO-${uuid}-${hash}`;
};

const args = process.argv.slice(2);
const instanceId = args[0] || 'Core';

console.log('\n==========================================');
console.log('   PRONTOSTACK PRIVATE KEY GENERATOR');
console.log('==========================================\n');

const newKey = generateKey(instanceId);

console.log(`  New Key: ${newKey}`);
console.log(`  Type:    ${instanceId}`);
console.log('\n==========================================');
console.log('  ⚠️  DO NOT SHARE THIS FILE WITH BUYERS.\n');
