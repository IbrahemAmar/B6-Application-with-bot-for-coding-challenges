const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
require('dotenv').config();
const OpenAI = require("openai");

const User = require('./models/User');

const app = express();
const PORT = 5000;
const server = http.createServer(app);

// ✅ LEVELS CONFIG
const TOPIC_LEVELS = ['Initial', 'Beginner', 'Intermediate', 'Advanced'];
const DEFAULT_LEVEL = 'Initial'; 
const PROMOTION_THRESHOLDS = {
  Beginner: 100,
  Intermediate: 200,
};

// --------------------
// OPENAI CONFIGURATION
// --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createXPMap = () => {
  const xp = new Map();
  TOPIC_LEVELS.forEach(level => xp.set(level, 0));
  return xp;
};

const normalizeXPMap = (xp) => {
  const map = new Map();
  TOPIC_LEVELS.forEach(level => {
    const value = xp?.get ? xp.get(level) : xp?.[level];
    map.set(level, Number.isFinite(value) ? value : 0);
  });
  return map;
};

// ✅ FIX 1: MODIFIED ensureTopicProgress
// New topics MUST start at 'Initial', ignoring the user's global level.
const ensureTopicProgress = (user, topic) => {
  if (!user.topicProgress) {
    user.topicProgress = new Map();
  }

  const existing = user.topicProgress.get(topic);
  if (existing) {
    existing.level = TOPIC_LEVELS.includes(existing.level) ? existing.level : DEFAULT_LEVEL;
    existing.xp = normalizeXPMap(existing.xp);
    user.topicProgress.set(topic, existing);
    return { entry: existing, updated: false };
  }

  // ✅ THE FIX: We removed "|| user.level". 
  // If the topic doesn't exist, it defaults STRICTLY to DEFAULT_LEVEL ('Initial').
  const entry = {
    level: DEFAULT_LEVEL, 
    xp: createXPMap(),
  };
  
  user.topicProgress.set(topic, entry);
  return { entry, updated: true };
};

const serializeTopicProgress = (topicProgress) => {
  if (!topicProgress) return {};
  const entries = topicProgress instanceof Map ? topicProgress.entries() : Object.entries(topicProgress);
  const result = {};

  for (const [topicKey, progress] of entries) {
    const level = TOPIC_LEVELS.includes(progress?.level) ? progress.level : DEFAULT_LEVEL;
    const xpMap = normalizeXPMap(progress?.xp);
    result[topicKey] = {
      level,
      xp: Object.fromEntries(xpMap),
    };
  }
  return result;
};

app.use(cors());
app.use(express.json());

// --------------------
// SIGNALING SERVER (WebRTC)
// --------------------
const wss = new WebSocketServer({ server });
const rooms = new Map();

const broadcastToRoom = (roomId, data, sender) => {
  const room = rooms.get(roomId);
  if (!room) return;
  room.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const removeFromRoom = (ws) => {
  const roomId = ws.roomId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) {
    rooms.delete(roomId);
  } else {
    broadcastToRoom(roomId, { type: 'peer-left' }, ws);
  }
};

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const { type, roomId, payload } = message || {};
    if (!type || !roomId) return;

    if (type === 'join') {
      const room = rooms.get(roomId) || new Set();
      room.add(ws);
      rooms.set(roomId, room);
      ws.roomId = roomId;

      if (room.size > 1) {
        broadcastToRoom(roomId, { type: 'peer-joined' }, ws);
      }
      return;
    }

    if (type === 'leave') {
      removeFromRoom(ws);
      return;
    }

    if (type === 'offer' || type === 'answer' || type === 'candidate') {
      broadcastToRoom(roomId, { type, payload }, ws);
    }
  });

  ws.on('close', () => {
    removeFromRoom(ws);
  });
});

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
    const { username, email, password, preference } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const preferenceTopic = preference || 'Algorithms';
    
    // Create topic progress starting at 'Initial'
    const topicProgress = new Map();
    topicProgress.set(preferenceTopic, {
      level: 'Initial', 
      xp: createXPMap(),
    });

    const newUser = new User({
      username, email, password,
      level: DEFAULT_LEVEL, // Always 'Initial'
      preference: preferenceTopic,
      topicLevels: {},
      topicProgress,
      xp: 0, 
      history: []
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

    // Auto-fix for legacy 'Beginner' users with 0 XP -> Move to Initial
    if ((user.level === 'Beginner' || !user.level) && user.xp === 0) {
      user.level = 'Initial';
    }

    const preferenceTopic = user.preference || 'Algorithms';
    const { entry, updated } = ensureTopicProgress(user, preferenceTopic);
    
    // Sync global level on login
    user.level = entry.level;

    await user.save(); // Always save on login to ensure consistency

    const serializedProgress = serializeTopicProgress(user.topicProgress);
    const currentEntry = serializedProgress[preferenceTopic] || {
      level: DEFAULT_LEVEL,
      xp: { Beginner: 0, Intermediate: 0, Advanced: 0 },
    };

    res.json({
      message: "Login Successful",
      user: {
        username: user.username,
        email: user.email,
        level: user.level, 
        xp: user.xp,
        preference: user.preference,
        topicLevels: user.topicLevels,
        topicProgress: serializedProgress,
        currentTopicLevel: currentEntry.level,
        currentTopicXP: currentEntry.xp[currentEntry.level] || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// ✅ FIX 2: UPDATE PREFERENCE
app.put('/api/user/update', async (req, res) => {
  try {
    const { email, preference } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const preferenceTopic = preference || user.preference || 'Algorithms';
    user.preference = preferenceTopic;

    // 1. Ensure the topic exists (defaults to 'Initial' if new, because of Fix 1)
    const { entry } = ensureTopicProgress(user, preferenceTopic);
    
    // 2. ✅ CRITICAL: Sync Global Level to the Selected Topic's Level
    user.level = entry.level; 

    await user.save();

    const serializedProgress = serializeTopicProgress(user.topicProgress);
    const currentEntry = serializedProgress[preferenceTopic];

    res.json({
      message: "Preference updated!",
      preference: preferenceTopic,
      topicProgress: serializedProgress,
      // Send back the specific level for this topic so frontend updates immediately
      currentTopicLevel: currentEntry.level, 
      currentTopicXP: currentEntry.xp[currentEntry.level] || 0,
    });

  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// --------------------
// 🧠 AI ROUTES
// --------------------

// 1. GENERATE
app.post('/api/generate-challenge', async (req, res) => {
  const { topic, email, language = 'JavaScript' } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { entry, updated } = ensureTopicProgress(user, topic);
    if (updated) {
      await user.save();
    }

    // Logic: If 'Initial', give 'Intermediate' to test them
    let levelToUse = entry.level || DEFAULT_LEVEL;
    if (levelToUse === 'Initial') {
      levelToUse = 'Intermediate';
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
      {
        role: "system",
        content: `You are a coding interview generator. Return a JSON object with these exact fields:
        - title
        - description
        - solutionCode (The fully working, correct solution implementation)
        - starterCode (ONLY the function signature and a 'pass' statement. MUST NOT contain the answer.)
        - testCases (array of 3 objects with 'input' and 'expectedOutput')
        - hints (array of 3 strings)`
      },
      {
        role: "user",
        content: `Generate a ${levelToUse} level coding challenge for ${topic} in ${language}.`
      }
      ]
      // messages: [
      //   {
      //     role: "system",
      //     content: `You are a coding interview generator. Return JSON object with: 
      //     title, 
      //     description, 
      //     starterCode (This must contain ONLY the function signature and a 'pass' or return statement. DO NOT implement the solution logic here.), 
      //     testCases (array of 3 objects with 'input' and 'expectedOutput'), 
      //     and hints (array of 3 strings).`
      //   },
      //   {
      //     role: "user",
      //     content: `Generate a ${levelToUse} level coding challenge for ${topic} in ${language}.`
      //   }
      // ]
    });

    const challenge = JSON.parse(response.choices[0].message.content);
    res.json({ ...challenge, generatedLevel: levelToUse });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// --------------------
// 2. FORFEIT (Placement Fail / Downgrade)
// --------------------
app.post('/api/forfeit', async (req, res) => {
  const { email, topic, problemDescription, language = 'JavaScript' } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { entry } = ensureTopicProgress(user, topic);
    let currentLevel = entry.level || DEFAULT_LEVEL;
    let newLevel = currentLevel;

    // Logic for forfeit
    if (currentLevel === 'Initial') {
      newLevel = 'Beginner';
    } else if (currentLevel === 'Advanced') {
      newLevel = 'Intermediate';
    } else if (currentLevel === 'Intermediate') {
      newLevel = 'Beginner';
    }

    if (newLevel !== currentLevel) {
      entry.level = newLevel;
      // Sync global level if this is their main topic
      if (user.preference === topic) user.level = newLevel; 
      
      user.topicProgress.set(topic, entry);
      await user.save();
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a helpful coding tutor. Return JSON: { \"solutionCode\": \"string\", \"explanation\": \"string\" }" },
        { role: "user", content: `Provide the correct ${language} solution and a brief explanation for this problem: ${problemDescription}` }
      ]
    });
    
    const solutionData = JSON.parse(response.choices[0].message.content);

    const serializedProgress = serializeTopicProgress(user.topicProgress);
    const currentEntry = serializedProgress[topic];

    res.json({ 
        message: `Assessment Failed. Level set to ${newLevel}.`, 
        solution: solutionData,
        updatedUser: {
          topicProgress: serializedProgress,
          currentTopicLevel: currentEntry.level,
          currentTopicXP: currentEntry.xp[currentEntry.level] || 0,
        }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------
// 3. CHECK SOLUTION
// --------------------
app.post('/api/check-solution', async (req, res) => {
  const { userCode, problemDescription, testCases, language = 'JavaScript' } = req.body;
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
        { role: "user", content: `Language: ${language}\nProblem: ${problemDescription}\nTests: ${JSON.stringify(testCases)}\nCode: ${userCode}` }
      ]
    });
    
    res.json(JSON.parse(response.choices[0].message.content));

  } catch (error) {
    res.status(500).json({ passed: false, feedback: "Error validating code." });
  }
});

// 4. SOLVE & SAVE (Placement Success / Promotion)
app.post('/api/solve', async (req, res) => {
  try {
    const { email, title, difficulty, score, duration, topic, challengeId, language } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { entry } = ensureTopicProgress(user, topic);

    const alreadySolved = challengeId
      ? user.history.some(h => h.challengeId === challengeId)
      : user.history.some(h => h.title === title);
    let gainedXP = 0;

    if (!alreadySolved) {
      gainedXP = score;

      const currentLevel = entry.level || DEFAULT_LEVEL;

      // Placement Logic
      if (currentLevel === 'Initial') {
        entry.level = 'Intermediate';
        entry.xp.set('Intermediate', 100); 
        // Update global level if this is the preference
        if (user.preference === topic) user.level = 'Intermediate';
      } else {
        const currentXP = entry.xp.get(currentLevel) || 0;
        const updatedXP = currentXP + gainedXP;
        entry.xp.set(currentLevel, updatedXP);

        let newLevel = currentLevel;
        if (currentLevel === 'Beginner' && updatedXP >= PROMOTION_THRESHOLDS.Beginner) {
          newLevel = 'Intermediate';
        } else if (currentLevel === 'Intermediate' && updatedXP >= PROMOTION_THRESHOLDS.Intermediate) {
          newLevel = 'Advanced';
        }

        if (newLevel !== currentLevel) {
          entry.level = newLevel;
          if (user.preference === topic) user.level = newLevel;
        }
      }

      user.topicProgress.set(topic, entry);

      user.history.push({
        title,
        difficulty,
        score: gainedXP,
        duration,
        language,
        challengeId,
        date: new Date(),
      });
    }

    await user.save();

    const serializedProgress = serializeTopicProgress(user.topicProgress);
    const currentEntry = serializedProgress[topic] || {
      level: DEFAULT_LEVEL,
      xp: { Beginner: 0, Intermediate: 0, Advanced: 0 },
    };

    res.json({ 
        message: "Solved!", 
        gainedXP, 
        updatedUser: {
          topicProgress: serializedProgress,
          currentTopicLevel: currentEntry.level,
          currentTopicXP: currentEntry.xp[currentEntry.level] || 0,
        } 
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
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));