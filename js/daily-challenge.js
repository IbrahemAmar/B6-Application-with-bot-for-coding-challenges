// js/daily-challenge.js

let currentDifficulty = currentUser.level || "Intermediate";

function renderChallenge() {
  const ch = challengesByDifficulty[currentDifficulty];

  document.getElementById("challenge-title").textContent = ch.title;

  const pill = document.getElementById("challenge-diff-pill");
  pill.textContent = ch.difficulty;
  pill.className =
    "inline-flex px-2 py-0.5 rounded-full text-xs font-medium " +
    difficultyClasses(ch.difficulty);

  document.getElementById("challenge-description").textContent = ch.description;
  document.getElementById("challenge-io").textContent = ch.io;

  document.getElementById("difficulty-select").value = currentDifficulty;
}

function setupDifficultySelect() {
  const select = document.getElementById("difficulty-select");
  select.addEventListener("change", () => {
    currentDifficulty = select.value;
    renderChallenge();
  });
}

function setupBotActions() {
  const hintsContainer = document.getElementById("bot-hints");
  const testResults = document.getElementById("test-results");
  const codeEditor = document.getElementById("code-editor");

  document.getElementById("btn-hint").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg px-2 py-1 shadow-sm";
    div.textContent =
      "Hint: Think about time complexity. Can you do it in O(n)?";
    hintsContainer.appendChild(div);
  });

  document.getElementById("btn-run").addEventListener("click", () => {
    if (!codeEditor.value.trim()) {
      testResults.textContent =
        "No code provided. Please write a solution first.";
      return;
    }
    testResults.innerHTML = `
      <p>Running tests...</p>
      <ul class="list-disc pl-4 mt-1">
        <li>Test #1: Passed ✅</li>
        <li>Test #2: Passed ✅</li>
        <li>Edge case: Failed ❌ – check empty input.</li>
      </ul>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderChallenge();
  setupDifficultySelect();
  setupBotActions();
});
