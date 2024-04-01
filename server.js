const express = require('express');
const cors = require('cors');
const app = express();

require('./db');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const User = require('./models/schema.js');

app.post('/api/lists', async (req, res) => {
  
  // this is a blank endpoint for list creating
  // my goal is to use request params: userId, name and create a new BLANK list for a user userId
  // i will not check auth for now
  // i am going to create a new user if userId does not exist in database 
  // (this is a tmp solution until i implement auth)
  // then i am going to create a new blank list named req.name and add it to the user
  // in positive case i will return 201 status and the list
  // in negative case i will return ...
  // by the way, what is negative case?
  // i think that we are not accepting anything for list name, it can be invalid
  // what are validation criterias? i dont know today but i will think about it tomorrow
  // btw, in this case i will return 400 status and a message
  // what else can go wrong? 
  // hint: if the endpoint has db operations, db can return error. this is an example of a server error, 
  // so i will return 500 status and a message
  // that's all for now

  res.status(200).json({ message: 'Test endpoint reached successfully' });
});
    // const userId = req.params.userId;
    // const user = await User.findById(userId);
    // console.log(user);

  //   user.lists.push(newList);
  //   await user.save();

  //   res.status(201).json(newList);
  // } catch (err) {
  //   res.status(500).json({ message: err.message });
  


// lists

// Get all lists for a user
// app.get('/api/lists', async (req, res) => {
//   try {
//     const userId = "65eb51f836d71edaa0911203";

//     const user = await User.findById(userId).select('lists');
//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     res.json(user.lists);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Get a single list for a user
// app.get('/api/lists/:listId', async (req, res) => {
//   try {
//     const userId = "65eb51f836d71edaa0911203";
//     const listId = req.params.listId;
  

//     const user = await User.findById(userId).select('lists');
//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     const specificList = user.lists.find(list => list.listId === listId);
//     if (!specificList) {
//       return res.status(404).send('List not found');
//     }

//     res.json(specificList);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// get a single list

// rename a list


// delete a list
  
// items

// Get all items from a list
// app.get('/api/lists/:listId/items', async (req, res) => {
//   try {
//     const items = await User.findById(req.params.userId).select('lists')
//       .then(user => user.lists.id(req.params.listId).items);
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Get a set of items for a user
// app.get('/api/items/unique', async (req, res) => {
//   try {
//     const userId = req.query.userId; // Assuming userId is passed as a query parameter

//     if (!userId) {
//       return res.status(400).send('User ID is required');
//     }

//     // Fetch the user document by userId
//     const user = await User.findOne({ userId: userId });

//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     // Extract items from all lists and flatten the array
//     const allItems = user.lists.flatMap(list => list.items);

//     // Create a set to get unique items based on the item name
//     const uniqueItems = Array.from(new Set(allItems.map(item => item.name)))
//       .map(name => {
//         // Find and return the first item that matches the unique name
//         return allItems.find(item => item.name === name);
//       });

//     // Send the unique items as a response
//     res.json(uniqueItems);
//   } catch (error) {
//     console.error('Error in /api/items/unique:', error);
//     res.status(500).send('An error occurred while fetching unique items');
//   }
// });


// Add a new item to list
// app.post('/api/lists/:listId/items', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const listId = req.params.listId;
//     const newItem = req.body;

//     const user = await User.findById(userId);
//     const list = user.lists.id(listId);
//     list.items.push(newItem);
//     await user.save();

//     res.status(201).json(newItem);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// Delete an item from a list
// app.delete('/api/lists/:listId/items/:itemId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const listId = req.params.listId;
//     const itemId = req.params.itemId;

//     const user = await User.findById(userId);
//     const list = user.lists.id(listId);
//     list.items.id(itemId).remove();
//     await user.save();

//     res.status(204).end();
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// Update an item (rename, change quantity, etc.)
// app.put('/api/lists/:listId/items/:itemId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const listId = req.params.listId;
//     const itemId = req.params.itemId;
//     const updatedItem = req.body;

//     const user = await User.findById(userId);
//     const list = user.lists.id(listId);
//     const item = list.items.id(itemId);
//     item.set(updatedItem);
//     await user.save();

//     res.json(item);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// add an item to a list


// delete an item from a list


