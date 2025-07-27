import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDownIcon, ChevronUpIcon, EditIcon, TrashIcon, EyeIcon } from "lucide-react";
import type { Bet, UpdateBet } from "@shared/schema";

type ViewMode = 'all' | 'straight' | 'parlays' | 'props';

interface BetHistoryProps {
  // Integration props to sync with Summary Statistics
  viewMode?: ViewMode;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  onFiltersChange?: (filteredBets: Bet[], filteredCount: number) => void;
}

export default function History({ 
  viewMode = 'all',
  startDate = '',
  endDate = '',
  searchTerm = '',
  onFiltersChange
}: BetHistoryProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // View details modal state
  const [viewingBet, setViewingBet] = useState<Bet | null>(null);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  
  // Edit modal state
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [editFormData, setEditFormData] = useState<{
    id?: number;
    date?: string;
    source?: string;
    location?: string;
    type?: string;
    stake?: string;
    potentialReturn?: string;
    actualReturn?: string;
    odds?: string;
    notes?: string;
    status?: string;
  }>({});
  
  // Delete confirmation state
  const [deletingBetId, setDeletingBetId] = useState<number | null>(null);

  const { data: bets, isLoading } = useQuery<Bet[]>({
    queryKey: ['/api/bets'],
  });

  // Update bet mutation
  const updateBetMutation = useMutation({
    mutationFn: async (data: UpdateBet) => {
      const response = await fetch(`/api/bets/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update bet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      setEditingBet(null);
      setEditFormData({});
      toast({
        title: "Bet updated",
        description: "Your bet has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extract keywords for Individual Props search - identical to Summary Statistics
  const extractKeywords = useCallback((bets: Bet[]) => {
    const keywords = new Set<string>();
    
    bets.forEach(bet => {
      if (bet.playerProps && Array.isArray(bet.playerProps)) {
        (bet.playerProps as any[]).forEach(prop => {
          // Player name
          if (prop.player) keywords.add(prop.player.toLowerCase());
          
          // Prop type/description
          if (prop.prop) keywords.add(prop.prop.toLowerCase());
          
          // Sport/category
          if (prop.sport) keywords.add(prop.sport.toLowerCase());
          if (prop.category) keywords.add(prop.category.toLowerCase());
          if (prop.league) keywords.add(prop.league.toLowerCase());
          
          // Result status
          if (prop.result) keywords.add(prop.result.toLowerCase());
          
          // Extract from bet notes that might contain additional context
          if (bet.notes) {
            const noteWords = bet.notes.split(/[\s\-\+\(\)]+/).filter(word => word.length > 2);
            noteWords.forEach(word => keywords.add(word.toLowerCase()));
          }
        });
      }
    });
    
    return Array.from(keywords).sort();
  }, []);

  // Update available keywords when data changes
  useEffect(() => {
    if (bets && viewMode === 'props') {
      const keywords = extractKeywords(bets);
      setAvailableKeywords(keywords);
    }
  }, [bets, viewMode, extractKeywords]);

  // Sync with external props when they change (from Summary Statistics)
  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);



  // Delete bet mutation 
  const deleteBetMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/bets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      setDeletingBetId(null);
      toast({
        title: "Bet deleted",
        description: "Your bet has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed", 
        description: error.message || "Failed to delete bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Integrated filtering logic - IDENTICAL to Summary Statistics
  const filteredBets = useMemo(() => {
    if (!bets) return [];
    
    let filtered = bets.filter(bet => {
      // Date filtering - use either props or local state
      const effectiveStartDate = startDate || localStartDate;
      const effectiveEndDate = endDate || localEndDate;
      
      if (effectiveStartDate || effectiveEndDate) {
        const betDate = new Date(bet.date);
        if (effectiveStartDate && betDate < new Date(effectiveStartDate)) return false;
        if (effectiveEndDate && betDate > new Date(effectiveEndDate)) return false;
      }
      
      // Bet type filtering based on viewMode
      if (viewMode === 'straight') {
        return bet.type === 'single' || (!bet.playerProps || (Array.isArray(bet.playerProps) && bet.playerProps.length <= 1));
      } else if (viewMode === 'parlays') {
        return bet.type === 'parlay' || (bet.playerProps && Array.isArray(bet.playerProps) && bet.playerProps.length > 1);
      } else if (viewMode === 'props') {
        return bet.playerProps && Array.isArray(bet.playerProps) && bet.playerProps.length > 0;
      }
      
      return true; // 'all' mode
    });
    
    // Individual Props search filtering - IDENTICAL to Summary Statistics
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
            bet.notes
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchWords.every(word => searchableText.includes(word));
        });
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filtered;
  }, [bets, viewMode, startDate, endDate, localStartDate, localEndDate, searchTerm]);

  // Notify parent component of filter changes (for Summary Statistics sync)
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filteredBets, filteredBets.length);
    }
  }, [filteredBets, onFiltersChange]);

  // Helper functions for formatting
  const formatCurrency = (amount: number): string => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const getProfitColor = (amount: number): string => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string | null): string => {
    if (status === 'won') return 'bg-green-100 text-green-800';
    if (status === 'lost') return 'bg-red-100 text-red-800';
    if (status === 'push') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // View details handlers
  const handleViewBet = (bet: Bet) => {
    setViewingBet(bet);
  };

  const closeViewModal = () => {
    setViewingBet(null);
  };

  // Edit handlers
  const handleEditBet = (bet: Bet) => {
    setEditingBet(bet);
    setEditFormData({
      id: bet.id,
      date: format(new Date(bet.date), 'yyyy-MM-dd'),
      source: bet.source || '',
      location: bet.location || '',
      type: bet.type || '',
      stake: bet.stake,
      potentialReturn: bet.potentialReturn || '',
      actualReturn: bet.actualReturn || '',
      odds: bet.odds || '',
      notes: bet.notes || '',
      status: bet.status || 'pending',
    });
  };

  const handleSaveEdit = () => {
    if (!editingBet || !editFormData.id) return;
    
    const updateData: UpdateBet = {
      id: editFormData.id,
      date: editFormData.date ? new Date(editFormData.date) : undefined,
      source: editFormData.source || null,
      location: editFormData.location || null,
      type: editFormData.type || null,
      stake: editFormData.stake || undefined,
      potentialReturn: editFormData.potentialReturn || null,
      actualReturn: editFormData.actualReturn || null,
      odds: editFormData.odds || null,
      notes: editFormData.notes || null,
      status: editFormData.status || undefined,
    };
    
    updateBetMutation.mutate(updateData);
  };

  const handleCancelEdit = () => {
    setEditingBet(null);
    setEditFormData({});
  };

  // Delete handlers
  const handleDeleteBet = (betId: number) => {
    setDeletingBetId(betId);
  };

  const confirmDelete = () => {
    if (deletingBetId) {
      deleteBetMutation.mutate(deletingBetId);
    }
  };

  const cancelDelete = () => {
    setDeletingBetId(null);
  };



  const calculateProfit = (bet: Bet): number => {
    if (bet.status === 'won' && bet.actualReturn) {
      return parseFloat(bet.actualReturn) - parseFloat(bet.stake);
    } else if (bet.status === 'lost') {
      return -parseFloat(bet.stake);
    }
    return 0;
  };

  const exportToCSV = () => {
    if (!filteredBets.length) {
      toast({
        title: "No data",
        description: "No bets to export with current filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Date", "Source", "Type", "Stake", "Status", "Odds", 
      "Potential_Return", "Actual_Return", "Location", "Notes", 
      "Player_Props_Count", "Player_Props_Details"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredBets.map(bet => {
        const playerPropsCount = bet.playerProps ? (Array.isArray(bet.playerProps) ? bet.playerProps.length : 0) : 0;
        const playerPropsDetails = bet.playerProps && Array.isArray(bet.playerProps) 
          ? (bet.playerProps as any[]).map(prop => `${prop.player}: ${prop.prop || 'N/A'}`).join('; ')
          : '';
        
        return [
          `"${format(new Date(bet.date), "yyyy-MM-dd")}"`,
          `"${bet.source || ""}"`,
          `"${bet.type || ""}"`,
          bet.stake,
          `"${bet.status || ""}"`,
          `"${bet.odds || ""}"`,
          bet.potentialReturn || "",
          bet.actualReturn || "",
          `"${bet.location || ""}"`,
          `"${(bet.notes || "").replace(/"/g, '""')}"`,
          playerPropsCount,
          `"${playerPropsDetails.replace(/"/g, '""')}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bet-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${filteredBets.length} bets to CSV.`,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Export to JSON functionality
  const exportToJSON = () => {
    if (!filteredBets.length) {
      toast({
        title: "No data",
        description: "No bets to export with current filters.",
        variant: "destructive",
      });
      return;
    }

    const jsonData = JSON.stringify(filteredBets, null, 2);
    const blob = new Blob([jsonData], { type: "application/json;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bet-history-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${filteredBets.length} bets to JSON.`,
    });
  };

  // CSV Import functionality
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            toast({
              title: "Invalid CSV",
              description: "CSV file must have at least a header and one data row.",
              variant: "destructive",
            });
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const requiredFields = ['date', 'stake', 'type'];
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            toast({
              title: "Missing Required Fields",
              description: `CSV must include: ${missingFields.join(', ')}`,
              variant: "destructive",
            });
            return;
          }

          const importedBets = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const bet: any = { id: `imported_${Date.now()}_${index}` };

            headers.forEach((header, i) => {
              const value = values[i] || '';
              switch (header) {
                case 'date':
                  bet.date = value;
                  break;
                case 'stake':
                  bet.stake = parseFloat(value) || 0;
                  break;
                case 'type':
                  bet.type = value;
                  break;
                case 'source':
                  bet.source = value;
                  break;
                case 'status':
                  bet.status = value;
                  break;
                case 'odds':
                  bet.odds = value;
                  break;
                case 'potentialreturn':
                case 'potential_return':
                  bet.potentialReturn = parseFloat(value) || null;
                  break;
                case 'actualreturn':
                case 'actual_return':
                  bet.actualReturn = parseFloat(value) || null;
                  break;
                case 'location':
                  bet.location = value;
                  break;
                case 'notes':
                  bet.notes = value;
                  break;
              }
            });

            return bet;
          }).filter(bet => bet.date && bet.stake > 0);

          // Batch import bets using the API
          let successCount = 0;
          let errorCount = 0;
          
          const importPromises = importedBets.map(async (bet) => {
            try {
              const response = await fetch('/api/bets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bet)
              });
              
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
              }
            } catch {
              errorCount++;
            }
          });
          
          Promise.all(importPromises).then(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
            
            if (successCount > 0) {
              toast({
                title: "Import Completed",
                description: `Successfully imported ${successCount} bets${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
              });
            } else {
              toast({
                title: "Import Failed", 
                description: "No bets could be imported. Please check the CSV format.",
                variant: "destructive",
              });
            }
          });

        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Desktop table view for empty state
  if (!bets || bets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with action buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bet History</h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
            >
              📥 Import
            </Button>
            <Button 
              onClick={exportToCSV} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
              disabled
            >
              📊 Export CSV
            </Button>
            <Button 
              onClick={exportToJSON} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
              disabled
            >
              📋 Export JSON
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RESULT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYPE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WAGERED
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PROFIT/LOSS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DETAILS
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No bets recorded yet. Add your first bet above to get started!</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Filtered empty state
  if (filteredBets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with action buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bet History</h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
            >
              📥 Import
            </Button>
            <Button 
              onClick={exportToCSV} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
              disabled
            >
              📊 Export CSV
            </Button>
            <Button 
              onClick={exportToJSON} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              size="sm"
              disabled
            >
              📋 Export JSON
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RESULT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYPE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WAGERED
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PROFIT/LOSS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DETAILS
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No bets match your current filters</p>
                    <p className="text-sm">Try adjusting your date range or bet type filter to see more results.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bet History</h2>
          <p className="text-sm text-gray-600">
            {viewMode === 'props' && searchTerm ? 
              `Found ${filteredBets.length} props matching "${searchTerm}"` :
              `Showing ${filteredBets.length} of ${bets.length} bets`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            size="sm"
          >
            📥 Import
          </Button>
          <Button 
            onClick={exportToCSV} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            size="sm"
          >
            📊 Export CSV
          </Button>
          <Button 
            onClick={exportToJSON} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            size="sm"
          >
            📋 Export JSON
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DATE
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                RESULT
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                TYPE
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                WAGERED
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PROFIT/LOSS
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DETAILS
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBets.map((bet) => {
              const profit = calculateProfit(bet);
              
              return (
                <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(bet.date.includes('T') ? bet.date : bet.date + 'T12:00:00'), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(bet.status)}>
                        {bet.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bet.type || '—'}
                      {bet.source && <div className="text-xs text-gray-400">{bet.source}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${bet.stake}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {bet.status === 'pending' ? (
                        <span className="text-gray-600">—</span>
                      ) : (
                        <span className={getProfitColor(profit)}>
                          {formatCurrency(profit)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {/* Player Props Summary */}
                      {bet.playerProps && Array.isArray(bet.playerProps) && bet.playerProps.length > 0 ? (
                        <div>
                          {(bet.playerProps as any[]).slice(0, 1).map((prop: any, index: number) => (
                            <div key={index}>
                              <span className="font-medium">{prop.player}</span>
                              {prop.prop && <span> - {prop.prop}</span>}
                            </div>
                          ))}
                          {bet.playerProps.length > 1 && (
                            <div className="text-xs text-gray-400 mt-1">
                              +{(bet.playerProps as any[]).length - 1} more props
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewBet(bet)}
                          className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditBet(bet)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 text-xs px-2 py-1"
                          title="Edit bet"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBet(bet.id)}
                          disabled={deleteBetMutation.isPending}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 text-xs px-2 py-1"
                          title="Delete bet"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              );
            })}
          </tbody>
        </table>
      </div>



      {/* Edit Bet Modal */}
      <Dialog open={!!editingBet} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-source">Source</Label>
                <Select value={editFormData.source || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DraftKings">DraftKings</SelectItem>
                    <SelectItem value="FanDuel">FanDuel</SelectItem>
                    <SelectItem value="BetMGM">BetMGM</SelectItem>
                    <SelectItem value="Caesars">Caesars</SelectItem>
                    <SelectItem value="PointsBet">PointsBet</SelectItem>
                    <SelectItem value="BetRivers">BetRivers</SelectItem>
                    <SelectItem value="Barstool">Barstool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editFormData.type || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="parlay">Parlay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-stake">Stake ($)</Label>
                <Input
                  id="edit-stake"
                  value={editFormData.stake || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, stake: e.target.value }))}
                  placeholder="25.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-odds">Odds</Label>
                <Input
                  id="edit-odds"
                  value={editFormData.odds || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, odds: e.target.value }))}
                  placeholder="+110"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editFormData.status || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-potential">Potential Return ($)</Label>
                <Input
                  id="edit-potential"
                  value={editFormData.potentialReturn || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, potentialReturn: e.target.value }))}
                  placeholder="55.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-actual">Actual Return ($)</Label>
                <Input
                  id="edit-actual"
                  value={editFormData.actualReturn || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, actualReturn: e.target.value }))}
                  placeholder="55.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="NJ"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this bet..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={updateBetMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateBetMutation.isPending}>
              {updateBetMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBetId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bet? This action cannot be undone and will permanently remove the bet from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteBetMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteBetMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBetMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Modal - Simple Structure */}
      <Dialog open={!!viewingBet} onOpenChange={(open) => !open && closeViewModal()}>
        <DialogContent className="max-w-2xl">
          {viewingBet && (
            <div className="space-y-4">
              {/* Header with ROI */}
              <DialogHeader>
                <DialogTitle className="text-lg font-medium text-gray-900">
                  Individual Bets for {format(new Date(viewingBet.date.includes('T') ? viewingBet.date : viewingBet.date + 'T12:00:00'), "MMMM dd, yyyy")} | ROI: {
                    viewingBet.status !== 'pending' && viewingBet.stake && viewingBet.actualReturn
                      ? (((parseFloat(viewingBet.actualReturn) - parseFloat(viewingBet.stake)) / parseFloat(viewingBet.stake) * 100).toFixed(1))
                      : '0.0'
                  }%
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View detailed information about this bet including player props and results.
                </DialogDescription>
              </DialogHeader>

              {/* Player Props List */}
              <div className="space-y-3">
                {viewingBet.playerProps && Array.isArray(viewingBet.playerProps) && viewingBet.playerProps.length > 0 ? (
                  (viewingBet.playerProps as any[]).map((prop: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="mb-2">
                        <span className="text-gray-900 font-medium">
                          {prop.player}: {prop.prop} {prop.result && (
                            <span className={`ml-1 ${
                              prop.result === 'Win' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ({prop.result})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Sport: {prop.sport || 'N/A'} | League: {prop.league || 'N/A'} | Category: {prop.prop || 'N/A'} | Sportsbook: {prop.sportsbook || viewingBet.source || 'N/A'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                    <span className="text-gray-600">No player props for this bet</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={closeViewModal} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}