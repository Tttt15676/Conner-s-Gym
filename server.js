const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "supersecretkey";

// CONNECT DB
mongoose.connect("mongodb://127.0.0.1:27017/gymApp");

// USER MODEL
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  plan: { type: String, default: "Basic" },
  progress: {
    workouts: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    weightLost: { type: Number, default: 0 },
    strength: { type: Number, default: 40 },
    endurance: { type: Number, default: 30 },
    consistency: { type: Number, default: 50 }
  }
});


// ======================
// SIGN UP
// ======================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();

  res.json({ success: true, message: "Account created" });
});


// ======================
// LOGIN
// ======================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ success: false, message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "2h"
  });

  res.json({
    success: true,
    token
  });
});


// ======================
// AUTH MIDDLEWARE
// ======================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}


// ======================
// GET USER DATA
// ======================
app.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});


// ======================
// UPDATE PROGRESS
// ======================
app.post("/progress", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  user.progress = req.body;
  await user.save();

  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running"));
