const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- REGISTER ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, level, preference } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username,
      email,
      password,
      level: level || 'Beginner',
      preference: preference || 'Algorithms',
      xp: 0,
      history: []
    });

    await newUser.save();
    res.status(201).json({ message: "User created!" });

  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login Successful",
      user: {
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        preference: user.preference,
        history: user.history
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --- UPDATE USER SETTINGS ---
app.put('/api/user/update', async (req, res) => {
  try {
    const { email, preference } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preference = preference;
    await user.save();

    res.json({ message: "Preference updated!", preference });

  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --- SOLVE CHALLENGE (NO DOUBLE XP) ---
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score, duration } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Check if already solved before
    const alreadySolved = user.history.some(
      h => h.title === title
    );

    let gainedXP = 0;

    // ➕ Add XP only if first time
    if (!alreadySolved) {
      user.xp += score;
      gainedXP = score;
    }

    // 🧠 Level logic
    if (user.xp >= 200) user.level = 'Advanced';
    else if (user.xp >= 100) user.level = 'Intermediate';
    else user.level = 'Beginner';

    // 🕒 Always add history (new attempt)
    user.history.push({
      title,
      difficulty,
      score: gainedXP,   // 0 if already solved
      duration,
      date: new Date()
    });

    await user.save();

    res.json({
      message: alreadySolved
        ? "Solved again (time recorded, no XP gained)"
        : "Challenge solved!",
      gainedXP,
      updatedUser: {
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// --- GET HISTORY ---
app.get('/api/history/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json([...user.history].reverse());

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history",
      error: error.message
    });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});