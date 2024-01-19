const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number, // Optional, based on your needs
  // Include other relevant fields
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [listItemSchema],
  // If multi-user: user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const List = mongoose.model('List', listSchema);
