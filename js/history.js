// js/history.js

function renderHistory() {
  const tbody = document.getElementById("history-tbody");
  tbody.innerHTML = "";

  fakeHistory.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";

    tr.innerHTML = `
      <td class="px-3 py-2 text-sm text-gray-800">${item.title}</td>
      <td class="px-3 py-2 text-sm">
        <span class="inline-flex px-2 py-0.5 rounded-full text-xs ${difficultyClasses(item.difficulty)}">
          ${item.difficulty}
        </span>
      </td>
      <td class="px-3 py-2 text-sm text-gray-700">${item.score}</td>
      <td class="px-3 py-2 text-sm text-gray-700">${item.time}</td>
      <td class="px-3 py-2 text-sm text-gray-500">${item.date}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAchievements() {
  const container = document.getElementById("achievements-list");
  container.innerHTML = "";

  fakeAchievements.forEach(a => {
    const div = document.createElement("div");
    div.className = "rounded-xl p-3 text-xs " + a.color;
    div.innerHTML = `
      <p class="font-semibold mb-1">${a.label}</p>
      <p>${a.description}</p>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  renderAchievements();
});
