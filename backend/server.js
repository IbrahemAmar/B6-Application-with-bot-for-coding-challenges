const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");

const User = require('./models/User');
const challenges = require('./data/challenges');

const app = express();
const PORT = 5000;

// --------------------
// OPENAI CONFIGURATION
// --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// --------------------
// DATABASE CONNECTION
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));

// --------------------
// AUTH ROUTES
// --------------------
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, level, preference } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      username, email, password,
      level: level || 'Beginner',
      preference: preference || 'Algorithms',
      topicLevels: {}, // Start empty
      xp: 0, history: []
    });

    await newUser.save();
    res.status(201).json({ message: "User created!" });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login Successful",
      user: {
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        preference: user.preference,
        topicLevels: user.topicLevels // Send this to frontend
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --------------------
// 🧠 AI ROUTES (UPDATED)
// --------------------

// 1. GENERATE (With Assessment Logic)
app.post('/api/generate-challenge', async (req, res) => {
  const { topic, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🧠 LOGIC: Check if user has a stored level for this topic.
    // If NOT (undefined), default to 'Intermediate' for assessment.
    let levelToUse = user.topicLevels.get(topic) || 'Intermediate';

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a coding interview generator. Return JSON object with: 
            title, description, starterCode, 
            testCases (array of 3 objects with 'input' and 'expectedOutput'), 
            and hints (array of 3 strings).`
        },
        {
          role: "user",
          content: `Generate a ${levelToUse} level coding challenge for ${topic} in JavaScript.`
        }
      ]
    });

    const challenge = JSON.parse(response.choices[0].message.content);
    // Send back the level used so Frontend knows
    res.json({ ...challenge, generatedLevel: levelToUse });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// 2. FORFEIT (Downgrade Logic)
app.post('/api/forfeit', async (req, res) => {
  const { email, topic } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // If they give up and were on 'Intermediate' (Assessment mode), drop them to Beginner
    const currentLevel = user.topicLevels.get(topic);
    
    if (!currentLevel || currentLevel === 'Intermediate') {
       user.topicLevels.set(topic, 'Beginner');
       await user.save();
       return res.json({ message: "Level set to Beginner for next time.", newLevel: 'Beginner' });
    }

    res.json({ message: "Forfeit recorded." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. CHECK SOLUTION
app.post('/api/check-solution', async (req, res) => {
  const { userCode, problemDescription, testCases } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a code judge. Return JSON: { \"passed\": boolean, \"feedback\": \"string\" }" },
        { role: "user", content: `Problem: ${problemDescription}\nTests: ${JSON.stringify(testCases)}\nCode: ${userCode}` }
      ]
    });
    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ passed: false, feedback: "Error validating code." });
  }
});

// 4. SOLVE & SAVE (Lock-in Level)
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score, duration } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySolved = user.history.some(h => h.title === title);
    let gainedXP = 0;

    if (!alreadySolved) {
      user.xp += score;
      gainedXP = score;

      // ✅ NEW: If they solved it, ensure their level for this topic is saved
      // If it was their first time (undefined), this locks them as 'Intermediate'
      // If they were already 'Beginner' but solved 'Intermediate', you could upgrade them here (optional logic)
      if (!user.topicLevels.get(user.preference)) {
          user.topicLevels.set(user.preference, difficulty); 
      }
    }

    user.history.push({ title, difficulty, score: gainedXP, duration, date: new Date() });
    await user.save();

    res.json({ message: "Solved!", gainedXP, updatedUser: { xp: user.xp } });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// --------------------
// STANDARD ROUTES
// --------------------
app.get('/api/history/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (user) res.json([...user.history].reverse());
  else res.status(404).json({ message: "Not found" });
});

app.get('/api/challenges', async (req, res) => {
  // Keeping your existing static challenge logic
  res.json(challenges);
});

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));