const express = require('express');
const cors = require('cors');
const app = express();

require('./db');

app.use(cors());
app.use(express.json()); // for parsing application

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const User = require('./models/schema.js');


// Get all lists for a user
app.get('/api/lists', async (req, res) => {
  try {
    const userId = "65eb51f836d71edaa0911203";

    const user = await User.findById(userId).select('lists');
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user.lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single list for a user
app.get('/api/lists/:listId', async (req, res) => {
  try {
    const userId = "65eb51f836d71edaa0911203";
    const listId = req.params.listId;
  

    const user = await User.findById(userId).select('lists');
    if (!user) {
      return res.status(404).send('User not found');
    }

    const specificList = user.lists.find(list => list.listId === listId);
    if (!specificList) {
      return res.status(404).send('List not found');
    }

    res.json(specificList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
  
  
  

// Get all items for a list
app.get('/api/lists/:listId/items', async (req, res) => {
  try {
    const items = await User.findById(req.params.userId).select('lists')
      .then(user => user.lists.id(req.params.listId).items);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a set of items for a user
app.get('/api/items/unique', async (req, res) => {
  try {
    const userId = req.query.userId; // Assuming userId is passed as a query parameter

    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    // Fetch the user document by userId
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Extract items from all lists and flatten the array
    const allItems = user.lists.flatMap(list => list.items);

    // Create a set to get unique items based on the item name
    const uniqueItems = Array.from(new Set(allItems.map(item => item.name)))
      .map(name => {
        // Find and return the first item that matches the unique name
        return allItems.find(item => item.name === name);
      });

    // Send the unique items as a response
    res.json(uniqueItems);
  } catch (error) {
    console.error('Error in /api/items/unique:', error);
    res.status(500).send('An error occurred while fetching unique items');
  }
});


// Add a new item to list
app.post('/api/lists/:listId/items', async (req, res) => {
  try {
    const userId = req.params.userId;
    const listId = req.params.listId;
    const newItem = req.body;

    const user = await User.findById(userId);
    const list = user.lists.id(listId);
    list.items.push(newItem);
    await user.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete an item
app.delete('/api/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const listId = req.params.listId;
    const itemId = req.params.itemId;

    const user = await User.findById(userId);
    const list = user.lists.id(listId);
    list.items.id(itemId).remove();
    await user.save();

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update an item (rename, change quantity, etc.)
app.put('/api/lists/:listId/items/:itemId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const listId = req.params.listId;
    const itemId = req.params.itemId;
    const updatedItem = req.body;

    const user = await User.findById(userId);
    const list = user.lists.id(listId);
    const item = list.items.id(itemId);
    item.set(updatedItem);
    await user.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// create a new list
app.post('/api/lists', async (req, res) => {
  try {
    const userId = req.params.userId;
    const newList = req.body;

    const user = await User.findById(userId);
    user.lists.push(newList);
    await user.save();

    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// get a single list by id





// delete a list



// add an item to a list


// delete an item from a list



// update a list





