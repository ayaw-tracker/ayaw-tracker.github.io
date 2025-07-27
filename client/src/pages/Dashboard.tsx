import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Bet } from "@shared/schema";
import { Icon } from "@/components/ui/icon";

export default function Dashboard() {
  const { data: bets = [], isLoading } = useQuery<Bet[]>({
    queryKey: ['/api/bets'],
  });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [quickView, setQuickView] = useState('All Time');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showROI, setShowROI] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Calculate statistics
  const totalBets = bets.length;
  const totalStake = bets.reduce((sum, bet) => sum + parseFloat(bet.stake || '0'), 0);
  const totalReturn = bets.reduce((sum, bet) => sum + parseFloat(bet.actualReturn || '0'), 0);
  const netProfitLoss = totalReturn - totalStake;
  const roi = totalStake > 0 ? (netProfitLoss / totalStake) * 100 : 0;

  const wins = bets.filter(bet => bet.status === 'won').length;
  const losses = bets.filter(bet => bet.status === 'lost').length;
  const pushes = bets.filter(bet => bet.status === 'push').length;

  const successRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

  // Determine text color for profit/loss and ROI
  const profitLossColorClass = netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600';
  const roiColorClass = roi >= 0 ? 'text-green-600' : 'text-red-600';
  const successRateColorClass = successRate >= 50 ? 'text-green-600' : 'text-red-600';

  const toggleTimeline = () => {
    setIsTimelineExpanded(!isTimelineExpanded);
  };

  const toggleROI = () => {
    setShowROI(!showROI);
  };

  return (
    <div className="p-6 bg-gray-50 font-inter">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Summary Statistics</h2>

        {/* Timeline Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div
            className="flex justify-between items-center mb-4 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleTimeline}
          >
            <h3 className="text-lg font-semibold text-gray-700">Timeline</h3>
            <span className="text-blue-600 text-sm">{quickView}</span>
          </div>

          {isTimelineExpanded && (
            <div className="transition-all duration-300 ease-in-out overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label htmlFor="fromDate" className="block text-gray-600 text-xs font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                  <Icon name="calendar" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <label htmlFor="toDate" className="block text-gray-600 text-xs font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                  <Icon name="calendar" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => setQuickView('Last 7 Days')} className="px-4 py-2 text-sm rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">Last 7 Days</button>
                <button onClick={() => setQuickView('Last 30 Days')} className="px-4 py-2 text-sm rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">Last 30 Days</button>
                <button onClick={() => { setFromDate(''); setToDate(''); setQuickView('Custom'); }} className="px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Clear Custom Dates</button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Wagered Card */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Wagered</h3>
            <p className="text-3xl font-bold text-blue-600">${totalStake.toFixed(2)}</p>
          </div>
          
          {/* Net Profit/Loss / ROI Card */}
          <div
            className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center relative cursor-pointer group hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleROI}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {showROI ? 'ROI' : 'Net Profit/Loss'}
            </h3>
            <p className={`text-3xl font-bold ${showROI ? roiColorClass : profitLossColorClass}`}>
              {showROI ? `${roi.toFixed(2)}%` : `$${netProfitLoss.toFixed(2)}`}
            </p>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Click to toggle between Net Profit/Loss and ROI
            </span>
          </div>
          
          {/* Total Bets Card */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bets</h3>
            <p className="text-3xl font-bold text-gray-800">{totalBets}</p>
          </div>

          {/* Wins Card */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wins</h3>
            <p className="text-3xl font-bold text-green-600">{wins}</p>
          </div>
          
          {/* Losses Card */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Losses</h3>
            <p className="text-3xl font-bold text-red-600">{losses}</p>
          </div>
          
          {/* Pushes Card */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pushes</h3>
            <p className="text-3xl font-bold text-yellow-600">{pushes}</p>
          </div>
        </div>

        {/* Success Rate Section */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Success Rate</h3>
          <div className="flex items-center space-x-2">
            <select
              className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 text-sm focus:ring-blue-500 focus:border-transparent"
              defaultValue="all"
            >
              <option value="all">All Bets</option>
            </select>
            <p className={`text-3xl font-bold ${successRateColorClass}`}>
              {successRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}