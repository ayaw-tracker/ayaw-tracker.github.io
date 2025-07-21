// Centralized types and enums for AYAW

export enum BetType {
  STRAIGHT = 'straight',
  PARLAY = 'parlay',
}

export enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  PUSH = 'push',
}

export type ViewMode = 'all' | 'straight' | 'parlays' | 'props';

export const BET_TYPE_LABELS = {
  [BetType.STRAIGHT]: 'Straight Bet',
  [BetType.PARLAY]: 'Parlay',
};

export const BET_STATUS_LABELS = {
  [BetStatus.PENDING]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  [BetStatus.WON]: { label: 'Won', color: 'bg-green-100 text-green-800' },
  [BetStatus.LOST]: { label: 'Lost', color: 'bg-red-100 text-red-800' },
  [BetStatus.PUSH]: { label: 'Push', color: 'bg-yellow-100 text-yellow-800' },
};

export const VIEW_MODE_LABELS = {
  all: 'All Bets',
  straight: 'Straight Bets',
  parlays: 'Parlays',
  props: 'Individual Props',
};