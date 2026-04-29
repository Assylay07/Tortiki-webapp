require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// env
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

// routes
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));

// главная страница 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// подключение к базе 
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });