require('dotenv').config();

// config.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const dbURI = process.env.MONGODB_URI; // Access the MongoDB URI from .env

// Connect to MongoDB without deprecated options
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log(err));

module.exports = mongoose;
