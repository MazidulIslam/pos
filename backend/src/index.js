const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Modern POS API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
