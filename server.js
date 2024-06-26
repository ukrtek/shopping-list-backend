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

// Hardcoded user ID for testing
const HARDCODED_USER_ID = "u126";

// single list

// Create a new list for a user
app.post("/api/lists", async (req, res) => {
  const userId = HARDCODED_USER_ID;
  let user = await User.findOne({ userId: userId });

  if (!user) {
    user = await User.create({ userId: userId });
  }

  const name = req.body.name;

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
app.get("/api/lists/:listId", async (req, res) => {
  const userId = HARDCODED_USER_ID;
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
  const userId = HARDCODED_USER_ID;
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
  const userId = HARDCODED_USER_ID;
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

// get all lists for a user
app.get("/api/lists", async (req, res) => {
  const userId = HARDCODED_USER_ID;

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

// search for items by name
app.get("/api/items/search", async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm || searchTerm.trim().length === 0) {
    return res.status(400).json({ message: "Search term is required" });
  }

  try {
    const user = await User.findOne({ userId: HARDCODED_USER_ID });
    if (!user) {
      return res.statur(404).json({ message: "User not found" });
    }

    const lists = user.lists;
    if (!lists || lists.length === 0) {
      return res.status(404).json({ message: "No lists found" });
    }

    const items = lists.reduce((acc, list) => {
      return acc.concat(list.items);
    }, []);

    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.status(200).json(filteredItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// add a new item to a list
app.post("/api/lists/:listId/items", async (req, res) => {
  try {
    const userId = HARDCODED_USER_ID;
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

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// get a single item by id
app.get("/api/lists/:listId/items/:itemId", async (req, res) => {
  const userId = HARDCODED_USER_ID;
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

    res.status(200).json(item);
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }
});

// rename an item in a list
app.patch("/api/lists/:listId/items/:itemId/name", async (req, res) => {
  const userId = HARDCODED_USER_ID;
  const listId = req.params.listId;
  const itemId = req.params.itemId;
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

  if (!itemId || itemId.trim().length === 0) {
    return res.status(400).json({
      message: "Invalid itemId",
    });
  }

  if (
    !newName ||
    newName.length > 20 ||
    newName.trim().length === 0 ||
    !newName.match(/^[a-zA-Z0-9 ,.!\/:-?]+$/)
  ) {
    return res.status(400).json({
      message: `Invalid name - must be a string of max 20 characters and may contain letters, numbers, spaces, and the following symbols: , . ! / : - ?`,
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

  const oldName = item.name;

  item.name = newName;

  try {
    await user.save();
    res
      .status(200)
      .json({ message: `Item '${oldName}' was renamed to '${item.name}'` });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to update the item name");
    console.error("Error: ", error);
  }
});

// update the quantity of an item in a list
app.patch("/api/lists/:listId/items/:itemId/quantity", async (req, res) => {
  const userId = HARDCODED_USER_ID;
  const listId = req.params.listId;
  const itemId = req.params.itemId;
  const newQuantity = req.body.quantity;

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

  if (!newQuantity || newQuantity <= 0) {
    return res.status(400).json({
      message: "Invalid quantity - must be a positive number",
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

  const oldQuantity = item.quantity;

  item.quantity = newQuantity;

  try {
    await user.save();
    res.status(200).json({
      message: `Quantity of ${item.name} was updated from ${oldQuantity} to ${item.quantity}`,
    });
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to update the item quantity");
    console.error("Error: ", error);
  }
});

// delete an item from a list
app.delete("/api/lists/:listId/items/:itemId", async (req, res) => {
  const userId = HARDCODED_USER_ID;
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

// multiple itemsx

// get an array of unique item names for a user
app.get("/api/items/unique", async (req, res) => {
  const userId = HARDCODED_USER_ID;

  try {
    const user = await User.findOne({ userId: userId });

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

    lists.forEach((list) => {
      if (list.items.length > 0) {
        list.items.forEach((item) => {
          itemNames.push(item.name);
        });
      }
    });

    uniqueItems = new Set(itemNames);

    res.status(200).json([...uniqueItems]);
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while trying to fetch the user document");
    console.error("Error: ", error);
  }
});
