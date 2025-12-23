const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: String, default: 'Beginner' },
  xp: { type: Number, default: 0 },
  preference: { type: String, default: 'Algorithms' },

  history: [
    {
      title: String,
      difficulty: String,
      score: Number,
      duration: Number, // ⏱️ seconds
      date: Date
    }
  ]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;