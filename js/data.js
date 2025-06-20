// Storage functions (localStorage)
export function getAllParlays() {
  const raw = localStorage.getItem('parlays');
  return raw ? JSON.parse(raw) : [];
}

export function saveParlay(entry) {
  const parlays = getAllParlays();
  parlays.unshift(entry); // newest first
  localStorage.setItem('parlays', JSON.stringify(parlays));
}

export function exportJSON() {
  const data = JSON.stringify(getAllParlays(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ayaw_parlays.json';
  a.click();
  URL.revokeObjectURL(url);
}

// (Optional) CSV export can be added here
