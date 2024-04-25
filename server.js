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

// single list

// Create a new list for a user
app.post("/api/lists", async (req, res) => {
  const userId = req.body.userId;
  let user = await User.findOne({ userId: userId });

  // tmp kosteel
  if (!user) {
    user = await User.create({ userId: userId });
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
    res
      .status(201)
      .json({ message: `List with id: ${list.listId} was added successfully` });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error: unable to save the new list to user" });
  }
});

// get a single list by id
// use request params: userId, listId and get the list
app.get("/api/lists/:listId", async (req, res) => {
  const userId = req.body.userId;
  const listId = req.params.listId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  if (!listId || listId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid listId",
    });
  }

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

  res.status(200).json(list);
});

// rename a list
app.patch("/api/lists/:listId", async (req, res) => {
  // my goal is to use request params: userId, listId, and update the list name
  const userId = req.body.userId;
  const listId = req.params.listId;
  const newName = req.body.name;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  if (!listId || listId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid listId",
    });
  }

  if (
    !newName ||
    newName.length > 20 ||
    newName.trim().length === 0 ||
    !newName.match(/^[a-zA-Z0-9 ]+$/)
  ) {
    return res.status(400).json({
      message: "Invalid name - must be a string of max 20 characters",
    });
  }

  let user = "";

  try {
    user = await User.findOne({ userId: userId });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  let list = user.lists.find((list) => list.listId === listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  const oldName = list.title;
  list.title = newName;

  try {
    await user.save();

    res
      .status(200)
      .json({ message: `List '${oldName}' was renamed to '${list.title}'` });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to update the list name");
    console.error("Error: ", error);
  }
});

// delete a list
app.delete("/api/lists/:listId", async (req, res) => {
  // my goal is to use request params: userId, list id, and delete the list
  // in positive case i will return 200 status and the item
  // negative scenarios: user not found, list not found, item not found
  // in negative scenario, return 400 status and a message
  // what else can go wrong?
  // hint: if the endpoint has db operations, db can return error. this is an example of a server error,
  // so i will return 500 status and a message
  const userId = req.body.userId;
  const listId = req.params.listId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  if (!listId || listId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid listId",
    });
  }

  let user = "";

  try {
    user = await User.findOne({ userId: userId });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const lists = user.lists;

  if (!lists || lists.length === 0) {
    return res.status(404).json({
      message: "No lists found",
    });
  }

  const list = lists.find((list) => list.listId === listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  user.lists = lists.filter((list) => list.listId !== listId);

  try {
    await user.save();
    res.status(200).json({ message: `${list.title} was deleted successfully` });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to delete the list from the user");
    console.error("Error: ", error);
  }
});

// multiple lists
// get all lists for a user
app.get("/api/lists", async (req, res) => {
  const userId = req.body.userId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  try {
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user.lists);
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }
});

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

// get a single item by id
app.get("/api/lists/:listId/items/:itemId", async (req, res) => {
  const userId = req.body.userId;
  const listId = req.params.listId;
  const itemId = req.params.itemId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  if (!listId || listId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid listId",
    });
  }

  if (!itemId || itemId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid itemId",
    });
  }

  try {
    const user = await User.findOne({ userId: userId });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const list = user.lists.find((list) => list.listId === listId);

  if (!list) {
    return res.status(400).json({
      message: "List not found",
    });
  }

  const item = list.items.find((item) => item.itemId === itemId);

  if (!item) {
    return res.status(400).json({
      message: "Item not found",
    });
  }

  res.status(200).json(item);
});

// update an item in a list (rename, change quantity, etc.)

// delete an item from a list
app.delete("/api/lists/:listId/items/:itemId", async (req, res) => {
  const userId = req.body.userId;
  const listId = req.params.listId;
  const itemId = req.params.itemId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  if (!listId || listId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid listId",
    });
  }

  if (!itemId || itemId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid itemId",
    });
  }

  let user = "";

  try {
    user = await User.findOne({ userId: userId });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }

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

  const item = list.items.find((item) => item.itemId === itemId);

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  list.items = list.items.filter((item) => item.itemId !== itemId);

  try {
    await user.save();
    res.status(200).json({ message: `${item.name} was deleted successfully` });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to delete the item from the list");
    console.error("Error: ", error);
  }
});

// multiple items
app.get("/api/items/unique", async (req, res) => {
  const userId = req.body.userId;

  if (!userId || userId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid userId",
    });
  }

  let user = "";

  try {
    user = await User.findOne({ userId: userId });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const lists = user.lists;

  if (!lists || lists.length === 0) {
    return res.status(404).json({
      message: "No lists found",
    });
  }

  let itemNames = [];

  // for each item, i need to take the name and put into the itemNames array
  // i check if the list has items
  lists.forEach((list) => {
    if (list.items.length > 0) {
      list.items.forEach((item) => {
        itemNames.push(item.name);
      });
    }
  });

  uniqueItems = new Set(itemNames);

  res.status(200).json([...uniqueItems]);
});

// Get a set of items for a user - only unique items

// my goal is to use request params: userId
// get all items from all lists for a user
// in positive case i will return 200 status and the list of unique items
// validate userId 400 status and a message
// negative scenarios: user not found, lists not found, items not found - 404 status and a message
// 500 status and a message for server error when fetching and updating the user
