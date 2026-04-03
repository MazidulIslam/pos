const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPermissions() {
    console.log('--- Testing Permission Enforcement ---');
    
    try {
        // 1. Login as Admin to get a token
        console.log('Logging in as Admin...');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const adminToken = adminRes.data.data.token;
        console.log('Admin login successful.');

        // 2. Create a Restricted Role (only has dashboard.list)
        console.log('Creating Restricted Role...');
        const roleRes = await axios.post(`${API_URL}/roles`, {
            name: 'Restricted User',
            description: 'Minimal access for testing'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const roleId = roleRes.data.data.id;

        // 3. Find dashboard.list permission
        const permsRes = await axios.get(`${API_URL}/roles`, { headers: { Authorization: `Bearer ${adminToken}` } });
        // Assuming we can find permissions via setup or direct DB, but let's just create a user now.

        // 4. Create a Restricted User
        console.log('Creating Restricted User...');
        const userRes = await axios.post(`${API_URL}/users`, {
            username: 'restricted',
            email: 'restricted@example.com',
            password: 'password123',
            roleId: roleId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        
        // 5. Login as Restricted User
        console.log('Logging in as Restricted User...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'restricted@example.com',
            password: 'password123'
        });
        const restrictedToken = loginRes.data.data.token;
        console.log('Restricted User login successful.');

        // 6. Attempt Unauthorized Action (Backup)
        console.log('TEST: Attempting UNAUTHORIZED Backup Download...');
        try {
            await axios.get(`${API_URL}/backups`, {
                headers: { Authorization: `Bearer ${restrictedToken}` }
            });
            console.error('FAIL: Backup was accessible by unauthorized user!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('SUCCESS: Access to Backups DENIED (403 Forbidden)');
            } else {
                console.error('FAIL: Unexpected error:', err.message);
            }
        }

        // 7. Attempt Unauthorized Action (Profile Update)
        console.log('TEST: Attempting UNAUTHORIZED Profile Update...');
        try {
            await axios.put(`${API_URL}/users/profile`, {
                firstName: 'Hacker'
            }, { headers: { Authorization: `Bearer ${restrictedToken}` } });
            console.error('FAIL: Profile Update was accessible by unauthorized user!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('SUCCESS: Profile Update DENIED (403 Forbidden)');
            } else {
                console.error('FAIL: Unexpected error:', err.message);
            }
        }

        console.log('--- Permission Enforcement Test Completed ---');
    } catch (error) {
        console.error('Test execution failed:', error.response?.data || error.message);
    }
}

testPermissions();
