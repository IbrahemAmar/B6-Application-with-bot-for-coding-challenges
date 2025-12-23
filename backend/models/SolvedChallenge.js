const mongoose = require("mongoose");

const solvedChallengeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    title: String,
    difficulty: String,
    score: Number,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SolvedChallenge", solvedChallengeSchema);
