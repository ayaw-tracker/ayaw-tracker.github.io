import { getAllParlays } from './data.js';
import Chart from 'chart.js/auto';

export function renderAnalytics() {
  const parlays = getAllParlays().reverse();
  const dates = parlays.map(p => p.date);
  const profits = parlays.map(p => p.net);

  // Cumulative P&L
  const cum = profits.reduce((acc, v) => {
    acc.push((acc.length ? acc[acc.length-1] : 0) + v);
    return acc;
  }, []);
  new Chart(document.getElementById('pl-chart'), { type: 'line', data: { labels: dates, datasets: [{ label: 'Cumulative P&L', data: cum }] } });

  // Rolling Win Rate (last 20)
  const wins = parlays.map(p => p.net > 0 ? 1 : 0);
  const roll = wins.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i-19), i+1);
    return slice.reduce((a,b) => a + b, 0) / slice.length * 100;
  });
  new Chart(document.getElementById('winrate-chart'), { type: 'line', data: { labels: dates, datasets: [{ label: 'Win Rate (%)', data: roll }] } });

  // Average Net per Bet
  const avg = profits.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i-9), i+1);
    return slice.reduce((a,b) => a + b, 0) / slice.length;
  });
  new Chart(document.getElementById('avgnet-chart'), { type: 'bar', data: { labels: dates, datasets: [{ label: 'Avg Net (last 10)', data: avg }] } });
}
