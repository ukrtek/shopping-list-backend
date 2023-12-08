const express = require('express');
const cors = require('cors');
const app = express();

// Include the MongoDB connection
require('./db');

app.use(cors());
app.use(express.json()); // for parsing application/json

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const Item = require('./models/itemModel.js');

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new item
app.post('/api/items', async (req, res) => {
  const item = new Item({ name: req.body.name });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const removedItem = await Item.deleteOne({_id: req.params.id});
    if (!removedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(removedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update an item - we use PATCH instead of PUT because we only want to update the name
app.patch('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) throw Error('Item not found');
    item.name = req.body.name;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});



