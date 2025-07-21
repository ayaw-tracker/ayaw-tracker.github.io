import { Bet } from './schema';
import { ViewMode } from './types';

interface BetFilterOptions {
  viewMode: ViewMode;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export function filterBets(
  bets: Bet[],
  { viewMode, startDate, endDate, searchTerm }: BetFilterOptions
): Bet[] {
  let filtered = bets;

  // Date filtering
  if (startDate || endDate) {
    filtered = filtered.filter(bet => {
      const betDate = new Date(bet.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && betDate < start) return false;
      if (end && betDate > end) return false;
      return true;
    });
  }

  // Bet type/view mode filtering
  if (viewMode === 'straight') {
    filtered = filtered.filter(bet => bet.type === 'straight');
  } else if (viewMode === 'parlays') {
    filtered = filtered.filter(bet => bet.type === 'parlay');
  } else if (viewMode === 'props') {
    filtered = filtered.filter(bet => bet.playerProps && Array.isArray(bet.playerProps) && bet.playerProps.length > 0);
  }

  // Individual Props search filtering
  if (viewMode === 'props' && searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    filtered = filtered.filter(bet => {
      if (!bet.playerProps || !Array.isArray(bet.playerProps)) return false;
      return (bet.playerProps as any[]).some(prop => {
        const searchableText = [
          prop.player,
          prop.prop,
          prop.sport,
          prop.category,
          prop.league,
          prop.result,
          bet.notes,
          bet.source
        ].filter(Boolean).join(' ').toLowerCase();
        return searchWords.every(word => searchableText.includes(word));
      });
    });
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return filtered;
}