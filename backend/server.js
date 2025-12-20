const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Blueprint we just created
const User = require('./models/User');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// Now we use the secure variable from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));

// --- ROUTES (The Menu) ---

app.get('/', (req, res) => {
  res.send('API is running...');
});

// NEW: Registration Route
app.post('/api/register', async (req, res) => {
  try {
    // 1. Get data from the frontend
    const { username, email, password, level } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create a new user in the database
    const newUser = new User({ 
      username, 
      email, 
      password,
      level: level || 'Beginner' 
    });

    await newUser.save(); // <--- THIS SAVES TO MONGO DB!

    res.status(201).json({ message: "User created successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// NEW: Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Check password (Simple comparison for now)
    // Note: In a real production app, we would use encryption (bcrypt) here.
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3. Send back the user's profile (Level, XP, Name)
    res.json({
      message: "Login Successful",
      user: {
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// NEW: Update User Progress (XP + History)
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score } = req.body;

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Add XP
    user.xp += score;

    // 3. Check for Level Up (Simple Logic)
    if (user.level === 'Beginner' && user.xp >= 100) user.level = 'Intermediate';
    if (user.level === 'Intermediate' && user.xp >= 200) user.level = 'Advanced';

    // 4. Add to History
    user.history.push({
      title,
      difficulty,
      score,
      date: new Date()
    });

    // 5. Save changes to MongoDB
    await user.save();

    res.json({ 
      message: "Progress Saved!", 
      updatedUser: {
        level: user.level,
        xp: user.xp,
        history: user.history
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});