const express = require("express");
const cors = require("cors");
const app = express();

require("./db");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const User = require("./models/schema.js");
const List = require("./models/schema.js");

// single list

// Create a new list for a user
app.post("/api/lists", async (req, res) => {
    const userId = req.body.userId;
    try {
      let user = await User.findOne({ userId: userId });

      // tmp kosteel
      if (!user) {
        user = await User.create({ userId: userId });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }

    const name = req.body.name;

    // check if name is valid: not empty, not more than 20 characters
    if (!name || name.length > 20 || name.trim().length === 0) {
      return res.status(400).json({
        message: "Invalid name - must be a string of max 20 characters",
      });
    }

    const id = Math.random().toString(36).substring(2, 9);

    const list = {
      listId: id,
      title: name,
      items: [],
    };

    user.lists.push(list);

    try {
      await user.save();
      res.status(201).json({ message: "List was added successfully" });
    }
    catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error: unable to save the new list to user" });
    }
    

  // this is a blank endpoint for list creating
  // my goal is to use request params: userId, name and create a new BLANK list for a user userId
  // i am going to create a new user if userId does not exist in database
  // then i am going to create a new blank list named req.name and add it to the user
  // in positive case i will return 201 status and the list
  // in negative case i will return ...
  // by the way, what is negative case?
  // i think that we are not accepting anything for list name, it can be invalid
  // no empty strings, no special characters, no more than 20 characters
  // btw, in this case i will return 400 status and a message
  // what else can go wrong?
  // hint: if the endpoint has db operations, db can return error. this is an example of a server error,
  // so i will return 500 status and a message
  // that's all for now
});

// get a single list by id
// use request params: userId, listId and get the list
app.get("/api/lists/:listId", async (req, res) => {
  const userId = req.body.userId;
  const listId = req.params.listId;

  try {
    
  }
});
// in positive case i will return 200 status and the list
// in negative case i will return ...
// negative cases: invalid userId, invalid listId, list not found
// i think that we are not accepting anything for list name, it can be invalid
// no empty strings, no special characters, no more than 20 characters
// btw, in this case i will return 400 status and a message
// server errors?
// hint: if the endpoint has db operations, db can return error. this is an example of a server error,
// so i will return 500 status and a message

// rename a list

// delete a list

// multiple lists
// fetch all lists for a user

//single item

// add a new item to a list
app.post("/api/lists/:listId/items", async (req, res) => {
  try {
    // request params: listId, userId, name, quantity
    const userId = req.body.userId;
    const listId = req.params.listId;
    const name = req.body.name;
    const quantity = req.body.quantity;

    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const list = user.lists.find((list) => list.listId === listId);
    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    if (!name || name.length > 20 || name.trim().length === 0) {
      return res.status(400).json({
        message: "Invalid name - must be a string of max 20 characters",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity - must be a positive number",
      });
    }

    const id = Math.random().toString(36).substring(2, 9);

    const item = {
      itemId: id,
      name: name,
      quantity: quantity,
    };

    list.items.push(item);
    await user.save();

    res.status(201).json({ message: `${item.name} was added` });
    // validate name and quantity
    // negative case: return 400 status and a message
    // what else can go wrong?
    // hint: if the endpoint has db operations, db can return error. this is an example of a server error,
    // so i will return 500 status and a message
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// fetch a single item by id

// update an item in a list (rename, change quantity, etc.)

// delete an item from a list

// multiple items

// Get all items from a list

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
