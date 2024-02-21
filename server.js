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

const List = require('./models/list.js');


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

// create a new list
app.post('/api/lists', async (req, res) => {
  try {
    const list = new List({ name: req.body.name });
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get all lists
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find();
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

// delete a list
app.delete('/api/lists/:id', async (req, res) => {
  try {
    const removedList = await List.deleteOne({_id: req.params.id});
    if (!removedList) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.json(removedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add an item to a list
app.post('/api/lists/:id/items', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) throw Error('List not found');
    const item = new Item({ name: req.body.name });
    list.items.push(item);
    const updatedList = await list.save();
    res.status(201).json(updatedList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete an item from a list
app.delete('/api/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const list = await List.findById(listId);
    if (!list) throw new Error('List not found');

    list.items = list.items.filter(item => item.id !== itemId);
    await list.save();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});


// update a list
app.patch('/api/lists/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) throw Error('List not found');
    list.name = req.body.name;
    const updatedList = await list.save();
    res.json(updatedList);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});





