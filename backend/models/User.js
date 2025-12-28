const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Keep this for general display, but rely on topicLevels for logic
  level: { type: String, default: 'Beginner' }, 
  preference: { type: String, default: 'Algorithms' },
  xp: { type: Number, default: 0 },
  
  // ✅ NEW: Track level per topic
  topicLevels: {
    type: Map,
    of: String, // e.g., { "Algorithms": "Beginner", "Backend": "Intermediate" }
    default: {}
  },

  history: [
    {
      title: String,
      difficulty: String,
      score: Number,
      duration: Number,
      date: Date
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);