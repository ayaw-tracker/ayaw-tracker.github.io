import { getAllParlays, saveParlay, exportJSON } from './data.js';
import { renderAnalytics } from './analytics.js';

const form = document.getElementById('parlay-form');
const historySection = document.getElementById('history-section');
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Theme toggle
themeBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeIcon.src = `/assets/icons/${isDark ? 'sun' : 'moon'}.svg`;
});

// Initialize theme
(() => {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.toggle('dark', saved === 'dark');
  themeIcon.src = `/assets/icons/${saved === 'dark' ? 'sun' : 'moon'}.svg`;
})();

// Render history entries
export function renderHistory() {
  const parlays = getAllParlays();
  historySection.innerHTML = parlays.map(p => `
    <div class="p-4 mb-2 bg-gray-100 dark:bg-gray-800 rounded">
      <div class="flex justify-between">
        <span>${p.date}</span>
        <span>${p.net >= 0 ? '+' : ''}${p.net.toFixed(2)}</span>
      </div>
      <button data-id="${p.id}" class="mt-2 text-sm text-blue-500">Reflection</button>
    </div>
  `).join('');

  document.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', e => showReflection(e.target.dataset.id));
  });
}
