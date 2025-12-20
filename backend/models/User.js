const mongoose = require('mongoose');

// This is the Blueprint
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level:    { type: String, default: 'Beginner' },
  xp:       { type: Number, default: 0 },
  
  // NEW: History Array to store solved challenges
  history: [
    {
      title: String,
      difficulty: String,
      score: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

// Create the Model based on the Blueprint
const User = mongoose.model('User', UserSchema);

module.exports = User;