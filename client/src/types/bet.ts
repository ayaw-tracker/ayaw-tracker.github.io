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
