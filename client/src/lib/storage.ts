// Local storage utility for AYAW (Are You Actually Winning?)

const BETS_KEY = 'ayaw_bets';

export function getBets(): any[] {
  try {
    const data = localStorage.getItem(BETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setBets(bets: any[]): void {
  try {
    localStorage.setItem(BETS_KEY, JSON.stringify(bets));
  } catch {
    // Handle quota exceeded or other errors
  }
}

export function addBet(bet: any): void {
  const bets = getBets();
  bets.push(bet);
  setBets(bets);
}

export function removeBet(betId: number): void {
  const bets = getBets().filter(bet => bet.id !== betId);
  setBets(bets);
}

export function clearBets(): void {
  localStorage.removeItem(BETS_KEY);
}

// Ready for future extension: user settings, opt-in analytics, etc.