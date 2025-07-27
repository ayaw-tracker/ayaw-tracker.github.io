import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestore, type FirestoreBet } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { Timestamp } from 'firebase/firestore';

// Convert Date to Firestore Timestamp for forms
export const dateToTimestamp = (date: Date | string): Timestamp => {
  return Timestamp.fromDate(typeof date === 'string' ? new Date(date) : date);
};

// Convert Firestore Timestamp to Date for forms
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert form data to Firestore format
export const formDataToBet = (formData: any): Omit<FirestoreBet, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    date: dateToTimestamp(formData.date),
    source: formData.source || undefined,
    location: formData.location || undefined,
    type: formData.type || undefined,
    stake: formData.stake.toString(),
    potentialReturn: formData.potentialReturn?.toString() || undefined,
    actualReturn: formData.actualReturn?.toString() || undefined,
    odds: formData.odds || undefined,
    notes: formData.notes || undefined,
    status: formData.status || 'pending',
    playerProps: formData.playerProps || undefined,
  };
};

// Convert Firestore bet to form format
export const betToFormData = (bet: FirestoreBet) => {
  return {
    ...bet,
    date: timestampToDate(bet.date),
    createdAt: bet.createdAt ? timestampToDate(bet.createdAt) : undefined,
    updatedAt: bet.updatedAt ? timestampToDate(bet.updatedAt) : undefined,
  };
};

interface UseBetsOptions {
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  realtime?: boolean;
}

export function useBets(options: UseBetsOptions = {}) {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [realtimeBets, setRealtimeBets] = useState<FirestoreBet[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Query key for caching
  const queryKey = ['bets', user?.uid, options];

  // Standard query (one-time fetch)
  const query = useQuery({
    queryKey,
    queryFn: () => firestore.getBets(options),
    enabled: !!user && !options.realtime,
    staleTime: 30000, // 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime || !user) return;

    setIsListening(true);
    const unsubscribe = firestore.subscribeToUserBets(
      (bets) => {
        setRealtimeBets(bets);
        setIsListening(false);
      },
      options
    );

    return () => {
      unsubscribe();
      setIsListening(false);
    };
  }, [options.realtime, user, JSON.stringify(options)]);

  return {
    data: options.realtime ? realtimeBets : query.data,
    isLoading: options.realtime ? isListening : query.isLoading,
    error: options.realtime ? null : query.error,
    refetch: query.refetch,
  };
}

export function useBet(betId: string) {
  const { user } = useAuth();
  const firestore = useFirestore();

  return useQuery({
    queryKey: ['bet', user?.uid, betId],
    queryFn: () => firestore.getBet(betId),
    enabled: !!user && !!betId,
  });
}

export function useCreateBet() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (betData: any) => {
      const firestoreBet = formDataToBet(betData);
      return firestore.createBet(firestoreBet);
    },
    onSuccess: () => {
      // Invalidate and refetch bets
      queryClient.invalidateQueries({ queryKey: ['bets', user?.uid] });
    },
    onError: (error) => {
      console.error('Error creating bet:', error);
    },
  });
}

export function useUpdateBet() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ betId, updates }: { betId: string; updates: any }) => {
      const firestoreUpdates = formDataToBet(updates);
      return firestore.updateBet(betId, firestoreUpdates);
    },
    onSuccess: () => {
      // Invalidate and refetch bets
      queryClient.invalidateQueries({ queryKey: ['bets', user?.uid] });
    },
    onError: (error) => {
      console.error('Error updating bet:', error);
    },
  });
}

export function useDeleteBet() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (betId: string) => firestore.deleteBet(betId),
    onSuccess: () => {
      // Invalidate and refetch bets
      queryClient.invalidateQueries({ queryKey: ['bets', user?.uid] });
    },
    onError: (error) => {
      console.error('Error deleting bet:', error);
    },
  });
}

export function useImportBets() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bets: any[]) => {
      const firestoreBets = bets.map(bet => formDataToBet(bet));
      return firestore.importBets(firestoreBets);
    },
    onSuccess: () => {
      // Invalidate and refetch bets
      queryClient.invalidateQueries({ queryKey: ['bets', user?.uid] });
    },
    onError: (error) => {
      console.error('Error importing bets:', error);
    },
  });
}

// Analytics hook
export function useBetAnalytics(options: UseBetsOptions = {}) {
  const { data: bets = [], isLoading } = useBets({ ...options, realtime: true });

  const analytics = {
    totalBets: bets.length,
    totalStake: bets.reduce((sum, bet) => sum + parseFloat(bet.stake || '0'), 0),
    totalReturn: bets.reduce((sum, bet) => sum + parseFloat(bet.actualReturn || '0'), 0),
    wins: bets.filter(bet => bet.status === 'won').length,
    losses: bets.filter(bet => bet.status === 'lost').length,
    pushes: bets.filter(bet => bet.status === 'push').length,
    pending: bets.filter(bet => bet.status === 'pending').length,
  };

  const netProfitLoss = analytics.totalReturn - analytics.totalStake;
  const roi = analytics.totalStake > 0 ? (netProfitLoss / analytics.totalStake) * 100 : 0;
  const successRate = analytics.totalBets > 0 ? (analytics.wins / analytics.totalBets) * 100 : 0;

  return {
    ...analytics,
    netProfitLoss,
    roi,
    successRate,
    isLoading,
  };
}