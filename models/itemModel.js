// itemModel.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String, // Other properties can be added as needed
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;