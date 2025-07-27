import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import type { Bet } from "@shared/schema";

type ViewMode = 'all' | 'straight' | 'parlays' | 'props';

type Stats = {
  totalBets: number;
  totalWagered: number;
  totalProfit: number;
  winCount: number;
  lossCount: number;
  pushCount: number;
  winRate: number;
};

interface SummaryProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Summary({
  viewMode,
  setViewMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchTerm,
  setSearchTerm
}: SummaryProps) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  const [showROI, setShowROI] = useState(false);

  const { data: bets, isLoading } = useQuery<Bet[]>({ 
    queryKey: ['/api/bets'],
  });

  // Extract keywords from player props for filtering
  const extractKeywords = useCallback(() => {
    if (!bets || bets.length === 0) return [];
    
    const keywords = new Set<string>();
    
    bets.forEach(bet => {
      if (bet.playerProps && Array.isArray(bet.playerProps)) {
        bet.playerProps.forEach((prop: any) => {
          // Extract different components for comprehensive search
          if (prop.player) keywords.add(prop.player.toLowerCase());
          if (prop.prop) keywords.add(prop.prop.toLowerCase());
          if (prop.sport) keywords.add(prop.sport.toLowerCase());
          if (prop.league) keywords.add(prop.league.toLowerCase());
          if (prop.sportsbook) keywords.add(prop.sportsbook.toLowerCase());
          if (prop.result) keywords.add(prop.result.toLowerCase());
        });
      }
      // Add bet source and notes as keywords too
      if (bet.source) keywords.add(bet.source.toLowerCase());
      if (bet.notes) {
        // Split notes into words and add as keywords
        bet.notes.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 2) keywords.add(word); // Only add words longer than 2 chars
        });
      }
    });
    
    return Array.from(keywords).sort();
  }, []);

  // Update available keywords when data changes - moved to top level
  useEffect(() => {
    if (bets && viewMode === 'props') {
      const keywords = extractKeywords();
      setAvailableKeywords(keywords);
    }
  }, [bets, viewMode, extractKeywords]);

  // Helper functions for calculations
  const formatCurrency = (amount: number): string => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatROI = (profit: number, totalWagered: number): string => {
    if (totalWagered === 0) return "0.00%";
    const roi = (profit / totalWagered) * 100;
    const prefix = roi >= 0 ? '+' : '';
    return `${prefix}${roi.toFixed(2)}%`;
  };

  const getProfitColor = (amount: number): string => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Calculate statistics based on current filters
  let filteredBets = bets || [];
  let stats: Stats;

  // Apply date filters first
  if (startDate || endDate) {
    filteredBets = filteredBets.filter(bet => {
      const betDate = new Date(bet.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && betDate < start) return false;
      if (end && betDate > end) return false;
      
      return true;
    });
  }

  if (viewMode === 'props') {
    // Props filtering logic
    const allProps: any[] = [];
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
    
    filteredBets.forEach(bet => {
      if (bet.playerProps && Array.isArray(bet.playerProps)) {
        bet.playerProps.forEach((prop: any) => {
          // If we have a search term, filter props
          if (searchTerm && searchWords.length > 0) {
            // Extract all detectable keywords from this prop
            const detectedKeywords = new Set<string>();
            
            // Add direct prop data
            if (prop.player) detectedKeywords.add(prop.player.toLowerCase());
            if (prop.prop) detectedKeywords.add(prop.prop.toLowerCase());
            if (prop.sport) detectedKeywords.add(prop.sport.toLowerCase());
            if (prop.league) detectedKeywords.add(prop.league.toLowerCase());
            if (prop.sportsbook) detectedKeywords.add(prop.sportsbook.toLowerCase());
            if (prop.result) detectedKeywords.add(prop.result.toLowerCase());
            
            // Create comprehensive searchable text including all extracted data
            const searchableFields = [
              prop.player || '',
              prop.prop || '',
              prop.sport || '',
              prop.league || '',
              prop.sportsbook || '',
              prop.result || '',
              bet.notes || '',
              bet.source || ''
            ];
            
            const propText = searchableFields.join(' ').toLowerCase();
            
            // Advanced matching: exact word matches + partial matches for numbers/stats
            const matchesAllWords = searchWords.every(searchWord => {
              // Direct text match
              if (propText.includes(searchWord)) return true;
              
              // Check against detected keywords for fuzzy matching
              return Array.from(detectedKeywords).some((keyword: string) => 
                keyword.includes(searchWord) || searchWord.includes(keyword)
              );
            });
            
            if (!matchesAllWords) return;
          }
          allProps.push(prop);
        });
      }
    });

    // Calculate props statistics
    stats = {
      totalBets: allProps.length,
      totalWagered: 0, // Not applicable for individual props
      totalProfit: 0, // Not applicable for individual props
      winCount: 0,
      lossCount: 0,
      pushCount: 0,
      winRate: 0,
    };

    allProps.forEach(prop => {
      const result = prop.result?.toLowerCase();
      if (result === 'won' || result === 'win') stats.winCount++;
      else if (result === 'lost' || result === 'loss') stats.lossCount++;
      else if (result === 'push') stats.pushCount++;
    });

    // Calculate win rate for props
    const settledProps = stats.winCount + stats.lossCount + stats.pushCount;
    stats.winRate = settledProps > 0 ? (stats.winCount / settledProps) * 100 : 0;

  } else {
    // Regular bet filtering (all, straight, parlay)
    if (filteredBets && viewMode === 'straight') {
      filteredBets = filteredBets.filter(bet => bet.type === 'straight');
    } else if (filteredBets && viewMode === 'parlays') {
      filteredBets = filteredBets.filter(bet => bet.type === 'parlay');
    }

    // Calculate base statistics for regular bets
    stats = {
      totalBets: filteredBets.length,
      totalWagered: filteredBets.reduce((sum, bet) => sum + parseFloat(bet.stake), 0),
      totalProfit: 0,
      winCount: 0,
      lossCount: 0,
      pushCount: 0,
      winRate: 0,
    };

    // Calculate profit and counts
    filteredBets.forEach(bet => {
      if (bet.status === 'won' && bet.actualReturn) {
        const profit = parseFloat(bet.actualReturn) - parseFloat(bet.stake);
        stats.totalProfit += profit;
        stats.winCount++;
      } else if (bet.status === 'lost') {
        stats.totalProfit -= parseFloat(bet.stake);
        stats.lossCount++;
      } else if (bet.status === 'push') {
        stats.pushCount++;
      }
    });

    // Calculate win rate (exclude pending bets)
    const settledBets = stats.winCount + stats.lossCount + stats.pushCount;
    stats.winRate = settledBets > 0 ? (stats.winCount / settledBets) * 100 : 0;
  }

  // Helper functions for date filtering
  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const setLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const setLast90Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  // Determine current timeline display
  const getTimelineDisplay = () => {
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      return `${start} - ${end}`;
    } else if (startDate) {
      return `From ${new Date(startDate).toLocaleDateString()}`;
    } else if (endDate) {
      return `Until ${new Date(endDate).toLocaleDateString()}`;
    }
    return "All Time";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with Timeline */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        {/* Title Row */}
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Summary Statistics</h2>
        </div>
        
        {/* Timeline Row - Collapsible */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2 -m-2"
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Timeline</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{getTimelineDisplay()}</span>
          </div>
          
          {/* Expanded Timeline Controls */}
          {isTimelineExpanded && (
            <div className="mt-4 p-4 bg-white rounded border border-gray-200">
              {/* Date Pickers Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm h-8"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm h-8"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>
              
              {/* Quick Date Presets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <button
                  onClick={setLast7Days}
                  className="h-8 px-3 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={setLast30Days}
                  className="h-8 px-3 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={setLast90Days}
                  className="h-8 px-3 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
                >
                  Last 90 Days
                </button>
                <button
                  onClick={clearDateFilters}
                  className="h-8 px-3 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
                >
                  Clear Custom Dates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Main Statistics Grid */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        {viewMode === 'props' ? (
          /* Individual Props Layout */
          <div className="space-y-4">
            {/* Search Bar and Total Props Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 bg-gray-50 rounded p-3 relative">
                <Input
                  type="text"
                  placeholder="Filter by player, sport, prop, or combinations... then press enter"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(e.target.value.length > 1);
                  }}
                  onFocus={() => setShowSuggestions(searchTerm.length > 1)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full border-0 bg-transparent text-base placeholder:text-gray-500 focus-visible:ring-0"
                />
                
                {/* Keyword Suggestions Dropdown */}
                {showSuggestions && availableKeywords.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                    {availableKeywords
                      .filter(keyword => 
                        keyword.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        keyword.toLowerCase() !== searchTerm.toLowerCase()
                      )
                      .slice(0, 8)
                      .map(keyword => (
                        <button
                          key={keyword}
                          onClick={() => {
                            setSearchTerm(keyword);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm capitalize"
                        >
                          {keyword}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600 font-medium">Total Props</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBets}</p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-green-600 font-medium">Wins</p>
                <p className="text-2xl font-bold text-green-600">{stats.winCount}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-red-600 font-medium">Losses</p>
                <p className="text-2xl font-bold text-red-600">{stats.lossCount}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-yellow-600 font-medium">Pushes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pushCount}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Bets Layout */
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-gray-600 font-medium">Total Wagered</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalWagered.toFixed(2)}</p>
            </div>
            <div 
              className="bg-gray-50 rounded p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowROI(!showROI)}
            >
              <p className="text-sm text-orange-600 font-medium">
                {showROI ? 'ROI %' : 'Net Profit/Loss'} ⇄
              </p>
              <p className={`text-2xl font-bold ${getProfitColor(stats.totalProfit)}`}>
                {showROI ? formatROI(stats.totalProfit, stats.totalWagered) : formatCurrency(stats.totalProfit)}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-gray-600 font-medium">
                {viewMode === 'straight' ? 'Total Straight' :
                 viewMode === 'parlays' ? 'Total Parlays' : 
                 'Total Bets'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBets}</p>
            </div>
          </div>
        )}
        
        {/* Bottom Row for Regular Bets Only */}
        {viewMode !== 'props' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-green-600 font-medium">Wins</p>
              <p className="text-2xl font-bold text-green-600">{stats.winCount}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-red-600 font-medium">Losses</p>
              <p className="text-2xl font-bold text-red-600">{stats.lossCount}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-yellow-600 font-medium">Pushes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pushCount}</p>
            </div>
          </div>
        )}

        {/* Success Rate Section */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">Success Rate</p>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value="all">All Bets</option>
              <option value="straight">Straight Bets</option>
              <option value="parlays">Parlays</option>
              <option value="props">Individual Props</option>
            </select>
            <p className="text-2xl font-bold text-gray-900">
              {viewMode === 'props' 
                ? `${stats.winRate.toFixed(2)}% (${stats.winCount + stats.lossCount + stats.pushCount} props)`
                : `${stats.winRate.toFixed(2)}%`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}