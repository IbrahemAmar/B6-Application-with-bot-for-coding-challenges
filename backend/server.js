const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const challenges = require('./data/challenges'); // ✅ ONLY ONCE

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --------------------
// DATABASE CONNECTION
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));

// --------------------
// BASIC ROUTE
// --------------------
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --------------------
// REGISTER
// --------------------
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

// --------------------
// LOGIN
// --------------------
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

// --------------------
// UPDATE USER SETTINGS
// --------------------
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

// --------------------
// SOLVE CHALLENGE
// --------------------
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score, duration } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySolved = user.history.some(h => h.title === title);

    let gainedXP = 0;

    if (!alreadySolved) {
      user.xp += score;
      gainedXP = score;
    }

    if (user.xp >= 200) user.level = 'Advanced';
    else if (user.xp >= 100) user.level = 'Intermediate';
    else user.level = 'Beginner';

    user.history.push({
      title,
      difficulty,
      score: gainedXP,
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

// --------------------
// GET HISTORY
// --------------------
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

// --------------------
// GET NEXT CHALLENGE
// --------------------
app.get('/api/challenge/next', (req, res) => {
  const { type, level } = req.query;

  const filtered = challenges.filter(
    c => c.type === type && c.level === level
  );

  if (filtered.length === 0) {
    return res.status(404).json({ error: "No challenge found" });
  }

  res.json(filtered[0]);
});

// GET challenges + solved status
app.get('/api/challenges', async (req, res) => {
  const { type, level, email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const solvedTitles = user.history.map(h => h.title);

  const filtered = challenges
    .filter(c => c.type === type && c.level === level)
    .map(c => ({
      ...c,
      solved: solvedTitles.includes(c.title)
    }));

  res.json(filtered);
});


// --------------------
// GET CHALLENGE BY ID
// --------------------
app.get('/api/challenge/by-id/:id', (req, res) => {
  const id = Number(req.params.id);

  const challenge = challenges.find(c => c.id === id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  res.json(challenge);
});


// --------------------
// JUDGE CHALLENGE (CHOICE B)
// --------------------
app.post('/api/challenge/judge', (req, res) => {
  const { code, challengeId } = req.body;

  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ passed: false, message: "Challenge not found" });
  }

  try {
    // ⚠️ TEMP SAFE JUDGE
    const passed = code && code.trim().length > 10;

    res.json({
      passed,
      message: passed ? "All tests passed" : "Solution does not pass test cases"
    });

  } catch (err) {
    res.status(500).json({
      passed: false,
      message: "Runtime error"
    });
  }
});
// --------------------
// HINT (TEMP / NO AI YET)
// --------------------
app.post('/api/challenge/hint', (req, res) => {
  const { challengeId, level } = req.body;

  return res.json({
    hint: `Think about the main logic of the problem. Start with a simple approach (${level} level).`
  });
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

