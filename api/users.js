const express = require("express");
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser } = require("../db");
const jwt = require("jsonwebtoken");

//----------------------------------------------

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

//----------------------------------------------

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

//----------------------------------------------

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("missing something");
    return next({ name: "Register Error", message: "Missing login input" });
  }
  try {
    const user = await getUserByUsername(username);
    console.log(user.username);
    if (!user.username) {
      return next({ name: "Login Error", message: "User name doesn't exist" });
    }
    if (password !== user.password) {
      return next({ name: "Login Error", message: "Password is incorrect" });
    }
    const token = jwt.sign(
      { username: user.username, id: user.id },
      process.env.JWT_SECRET
    );
    console.log(token);
    res.send("Login successful!");
  } catch (error) {
    next(error);
  }
});

//----------------------------------------------

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;
  if (!username || !password || !name | !location) {
    return next({ name: "Register Error", message: "Missing register input" });
  }
  const user = await getUserByUsername(username);
  if (user) {
    return next({ name: "Register Error", message: "User name already exist" });
  }
  const newUser = await createUser({ username, password, name, location });
  const token = jwt.sign(
    { username: newUser.username, id: newUser.id },
    process.env.JWT_SECRET,
    { expiresIn: "1w" }
  );
  res.send("Will register a user");
  next();
});

//----------------------------------------------

module.exports = usersRouter;
