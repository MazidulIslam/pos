const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit CORS configuration for all methods and headers
app.use(cors({ 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.use(express.json());

// Connect to Database
connectDB();

// Routes
const authRoutes = require('./routes/auth/authRoutes');
const userRoutes = require('./routes/users/userRoutes');
const menuRoutes = require('./routes/menus/menuRoutes');
const roleRoutes = require('./routes/roles/roleRoutes');
const backupRoutes = require('./routes/backup/backupRoutes');
const searchRoutes = require('./routes/search/searchRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/search', searchRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Modern POS API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
