const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: false },
});

const listSchema = new Schema({
  listId: { type: String, required: true },
  title: { type: String, required: true },
  items: [itemSchema],
});

const userSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: false },
  email: { type: String, required: false },
  passwordHash: { type: String, required: false },
  lists: [listSchema],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
