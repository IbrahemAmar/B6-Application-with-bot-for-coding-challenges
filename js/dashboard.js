// js/dashboard.js

// choose default difficulty based on user level
const currentDifficulty = currentUser.level || "Beginner";

const lastBotFeedback =
  "Bot: Try to think about using a stack to match parentheses.";

function renderDashboard() {
  // user info
  document.getElementById("user-name").textContent = currentUser.name;
  document.getElementById("user-track").textContent = currentUser.track;
  document.getElementById("user-level").textContent = currentUser.level;

  // stats
  document.getElementById("stat-solved").textContent = currentUser.solved;
  document.getElementById("stat-streak").textContent = currentUser.streak;
  document.getElementById("stat-rating").textContent = currentUser.rating;

  // today's challenge
  const ch = challengesByDifficulty[currentDifficulty];
  const titleEl = document.getElementById("dash-challenge-title");
  const diffEl = document.getElementById("dash-challenge-diff");

  titleEl.textContent = ch.title;
  diffEl.textContent = ch.difficulty;
  diffEl.className =
    "text-xs inline-flex px-2 py-0.5 rounded-full " +
    difficultyClasses(ch.difficulty);

  // last feedback
  document.getElementById("dash-last-feedback").textContent = lastBotFeedback;
}

document.addEventListener("DOMContentLoaded", renderDashboard);
