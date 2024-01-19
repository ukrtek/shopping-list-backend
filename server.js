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

const Item = require('./models/item.js');

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search route
app.get('/api/items/search', async (req, res) => {
  try {
    const searchTerm = req.query.q; // Get the search term from query params
    if (!searchTerm) {
      // Optional: Decide how to handle empty search term
      return res.json([]); // For example, return an empty array
    }

    // Search logic: find items that match the search term
    const items = await Item.find({ 
      name: { $regex: searchTerm, $options: 'i' } // Case-insensitive regex search
    });

    res.json(items); // Send the search results back to the client
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle potential errors
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

app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find(); // Adjust the query as needed
    res.json(lists);
  } catch (err) {
    res.status(500).send(err);
  }
});

// get all lists
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find(); // Adjust the query as needed
    res.json(lists);
  } catch (err) {
    res.status(500).send(err);
  }
});

// get a single list by id
app.get('/api/lists/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id); // Adjust the query as needed
    res.json(list);
  } catch (err) {
    res.status(500).send(err);
  }
});

// add a new list

// delete a list

// update a list





