export interface BetFormData {
  date: string;
  source: string;
  location: string;
  betType: string;
  stake: string;
  potentialReturn: string;
  odds: string;
  notes: string;
}

export interface BetFilters {
  source: string;
  status: string;
  dateRange: string;
}

export const BET_SOURCES = [
  { value: "draftkings", label: "DraftKings" },
  { value: "fanduel", label: "FanDuel" },
  { value: "betmgm", label: "BetMGM" },
  { value: "caesars", label: "Caesars" },
  { value: "other", label: "Other" },
];

export const BET_LOCATIONS = [
  { value: "ca", label: "California" },
  { value: "ny", label: "New York" },
  { value: "nj", label: "New Jersey" },
  { value: "pa", label: "Pennsylvania" },
  { value: "other", label: "Other" },
];

export const BET_TYPES = [
  { value: "single", label: "Single Bet" },
  { value: "2-leg", label: "2-Leg Parlay" },
  { value: "3-leg", label: "3-Leg Parlay" },
  { value: "4-leg", label: "4-Leg Parlay" },
  { value: "5-leg", label: "5+ Leg Parlay" },
];

export const BET_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "won", label: "Won", color: "bg-green-100 text-green-800" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
];
