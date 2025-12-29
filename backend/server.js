const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");

const User = require('./models/User');

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
      topicLevels: {}, 
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
        topicLevels: user.topicLevels 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

app.put('/api/user/update', async (req, res) => {
  try {
    const { email, preference } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.preference = preference;
    await user.save();
    res.json({ message: "Preference updated!", preference });

  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --------------------
// 🧠 AI ROUTES
// --------------------

// 1. GENERATE
app.post('/api/generate-challenge', async (req, res) => {
  const { topic, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Assessment Logic: If no history for this topic, start Intermediate
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
    res.json({ ...challenge, generatedLevel: levelToUse });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// --------------------
// 2. FORFEIT (Downgrade + Show Answer)
// --------------------
app.post('/api/forfeit', async (req, res) => {
  const { email, topic, problemDescription } = req.body; // ✅ Added problemDescription

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Downgrade Logic
    const currentLevel = user.topicLevels.get(topic);
    if (!currentLevel || currentLevel === 'Intermediate') {
       user.topicLevels.set(topic, 'Beginner');
       await user.save();
    }

    // 2. ✅ NEW: Generate the Solution Explanation
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful coding tutor. Return JSON: { \"solutionCode\": \"string\", \"explanation\": \"string\" }" },
          { role: "user", content: `Provide the correct JavaScript solution and a brief explanation for this problem: ${problemDescription}` }
        ]
    });
    
    const solutionData = JSON.parse(response.choices[0].message.content);

    res.json({ 
        message: "Assessment Failed. Level set to Beginner.", 
        solution: solutionData // Send the answer back
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------
// 3. CHECK SOLUTION (+ Code Review)
// --------------------
app.post('/api/check-solution', async (req, res) => {
  const { userCode, problemDescription, testCases } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        { 
            role: "system", 
            content: `You are a code judge. Return JSON object: 
            { 
              "passed": boolean, 
              "feedback": "string (short)", 
              "betterSolution": "string (optimized code, only if passed)", 
              "improvementTips": "string (why the better solution is better, only if passed)" 
            }` 
        },
        { role: "user", content: `Problem: ${problemDescription}\nTests: ${JSON.stringify(testCases)}\nCode: ${userCode}` }
      ]
    });
    
    res.json(JSON.parse(response.choices[0].message.content));

  } catch (error) {
    res.status(500).json({ passed: false, feedback: "Error validating code." });
  }
});

// 4. SOLVE & SAVE (Pass Assessment Logic)
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score, duration, topic } = req.body; // ✅ Added 'topic'
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySolved = user.history.some(h => h.title === title);
    let gainedXP = 0;

    if (!alreadySolved) {
      
      // 🧠 CHECK ASSESSMENT STATUS
      const currentTopicLevel = user.topicLevels.get(topic);

      if (!currentTopicLevel) {
          // ✅ CASE 1: First time ever for this topic (Assessment Passed!)
          gainedXP = 100; // PLACEMENT BONUS
          user.topicLevels.set(topic, 'Intermediate'); // Lock in Intermediate
      } else {
          // ✅ CASE 2: Regular Solve
          gainedXP = score; 
      }

      user.xp += gainedXP;
    }

    // Level Up Check
    if (user.xp >= 200) user.level = 'Advanced';
    else if (user.xp >= 100) user.level = 'Intermediate';
    else user.level = 'Beginner';

    user.history.push({ title, difficulty, score: gainedXP, duration, date: new Date() });
    
    await user.save();

    res.json({ 
        message: "Solved!", 
        gainedXP, 
        updatedUser: { xp: user.xp, level: user.level } 
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// --------------------
// HISTORY
// --------------------
app.get('/api/history/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (user) res.json([...user.history].reverse());
  else res.status(404).json({ message: "Not found" });
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));