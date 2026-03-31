const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Fake user (for demo)
const user = {
  email: "test@gym.com",
  password: "123456",
  name: "John Doe",
  plan: "Pro"
};

// LOGIN ROUTE
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === user.email && password === user.password) {
    res.json({
      success: true,
      user: {
        name: user.name,
        plan: user.plan
      }
    });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// DASHBOARD DATA
app.get("/dashboard", (req, res) => {
  res.json({
    name: user.name,
    plan: user.plan,
    renewal: "2026-04-15"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
