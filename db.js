const mongoose = require('mongoose');

// Local MongoDB URI. Replace 'yourDatabaseName' with your actual database name.
const MONGODB_URI = 'mongodb://localhost:27017/shoppingListDb';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

module.exports = mongoose;
