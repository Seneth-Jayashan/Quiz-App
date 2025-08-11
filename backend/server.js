const express = require('express');
const cors = require('cors');
const router = require('./router');
const path = require('path');
const {connectDB} = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, "uploads")));

app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
})

connectDB();