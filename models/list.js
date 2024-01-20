const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New List' 
  },
  items: [listItemSchema],
  // Other fields...
  // If multi-user: user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const List = mongoose.model('List', listSchema);

module.exports = List;
