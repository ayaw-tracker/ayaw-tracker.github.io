import { describe, it, expect } from 'vitest';
import { filterBets } from './filters';
import { ViewMode } from './types';

describe('filterBets', () => {
  const bets = [
    { id: 1, type: 'straight', date: '2024-01-01', playerProps: [], status: 'won', stake: '10', source: '', notes: '' },
    { id: 2, type: 'parlay', date: '2024-01-02', playerProps: [{ player: 'LeBron', prop: 'Points', result: 'won' }], status: 'lost', stake: '20', source: '', notes: '' },
    { id: 3, type: 'straight', date: '2024-01-03', playerProps: [], status: 'pending', stake: '15', source: '', notes: '' },
  ];

  it('filters by type: straight', () => {
    const result = filterBets(bets as any, { viewMode: 'straight' as ViewMode });
    expect(result.every(b => b.type === 'straight')).toBe(true);
  });

  it('filters by type: parlays', () => {
    const result = filterBets(bets as any, { viewMode: 'parlays' as ViewMode });
    expect(result.every(b => b.type === 'parlay')).toBe(true);
  });

  it('filters by date range', () => {
    const result = filterBets(bets as any, { viewMode: 'all' as ViewMode, startDate: '2024-01-02', endDate: '2024-01-03' });
    expect(result.length).toBe(2);
    expect(result[0].date >= '2024-01-02').toBe(true);
    expect(result[1].date <= '2024-01-03').toBe(true);
  });

  it('filters by props search', () => {
    const result = filterBets(bets as any, { viewMode: 'props' as ViewMode, searchTerm: 'LeBron' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });
});