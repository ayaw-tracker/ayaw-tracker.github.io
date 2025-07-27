import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';

// Firestore-compatible types (no auto-increment IDs)
export interface FirestoreBet {
  id?: string; // Firestore document ID
  date: Timestamp;
  source?: string;
  location?: string;
  type?: string;
  stake: string;
  potentialReturn?: string;
  actualReturn?: string;
  odds?: string;
  notes?: string;
  status: 'pending' | 'won' | 'lost' | 'push';
  playerProps?: Array<{
    id: string;
    player: string;
    prop: string;
    result: string;
    sport: string;
    league: string;
    sportsbook: string;
    odds: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUser {
  id?: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences?: {
    currency: string;
    timezone: string;
    notifications: boolean;
  };
}

// Helper to convert Firestore document to bet object
const documentToBet = (doc: QueryDocumentSnapshot<DocumentData>): FirestoreBet => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as FirestoreBet;
};

// Helper to convert bet object for Firestore (remove undefined fields)
const betToFirestore = (bet: Partial<FirestoreBet>): Partial<FirestoreBet> => {
  const cleanBet: Partial<FirestoreBet> = {};
  
  Object.entries(bet).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanBet[key as keyof FirestoreBet] = value;
    }
  });
  
  return cleanBet;
};

export class FirestoreService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Collection references
  private get userDoc() {
    return doc(db, 'users', this.userId);
  }

  private get betsCollection() {
    return collection(db, 'users', this.userId, 'bets');
  }

  private get analyticsCollection() {
    return collection(db, 'users', this.userId, 'analytics');
  }

  // User operations
  async createUserProfile(userData: Partial<FirestoreUser>): Promise<void> {
    const userRef = this.userDoc;
    const now = Timestamp.now();
    
    await updateDoc(userRef, {
      ...userData,
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
    });
  }

  async updateUserProfile(updates: Partial<FirestoreUser>): Promise<void> {
    const userRef = this.userDoc;
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async getUserProfile(): Promise<FirestoreUser | null> {
    const userRef = this.userDoc;
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return { id: userSnap.id, ...userSnap.data() } as FirestoreUser;
  }

  // Bet CRUD operations
  async createBet(betData: Omit<FirestoreBet, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreBet> {
    const now = Timestamp.now();
    const betWithTimestamps = {
      ...betData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(this.betsCollection, betWithTimestamps);
    
    return {
      id: docRef.id,
      ...betWithTimestamps,
    };
  }

  async updateBet(betId: string, updates: Partial<FirestoreBet>): Promise<FirestoreBet | null> {
    const betRef = doc(this.betsCollection, betId);
    const updatesWithTimestamp = {
      ...betToFirestore(updates),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(betRef, updatesWithTimestamp);
    
    const updatedDoc = await getDoc(betRef);
    if (!updatedDoc.exists()) {
      return null;
    }
    
    return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreBet;
  }

  async deleteBet(betId: string): Promise<boolean> {
    try {
      const betRef = doc(this.betsCollection, betId);
      await deleteDoc(betRef);
      return true;
    } catch (error) {
      console.error('Error deleting bet:', error);
      return false;
    }
  }

  async getBet(betId: string): Promise<FirestoreBet | null> {
    const betRef = doc(this.betsCollection, betId);
    const betSnap = await getDoc(betRef);
    
    if (!betSnap.exists()) {
      return null;
    }
    
    return { id: betSnap.id, ...betSnap.data() } as FirestoreBet;
  }

  async getBets(options?: {
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }): Promise<FirestoreBet[]> {
    let q = query(this.betsCollection, orderBy('date', 'desc'));

    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options?.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options?.startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(options.startDate)));
    }

    if (options?.endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(options.endDate)));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(documentToBet);
  }

  // Real-time subscriptions
  subscribeToUserBets(
    callback: (bets: FirestoreBet[]) => void,
    options?: {
      status?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): () => void {
    let q = query(this.betsCollection, orderBy('date', 'desc'));

    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options?.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options?.startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(options.startDate)));
    }

    if (options?.endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(options.endDate)));
    }

    return onSnapshot(q, (querySnapshot) => {
      const bets = querySnapshot.docs.map(documentToBet);
      callback(bets);
    });
  }

  // Analytics operations (read-only)
  async getAnalytics(year?: number): Promise<any> {
    const analyticsRef = year 
      ? doc(this.analyticsCollection, year.toString())
      : doc(this.analyticsCollection, 'current');
    
    const analyticsSnap = await getDoc(analyticsRef);
    
    if (!analyticsSnap.exists()) {
      return null;
    }
    
    return analyticsSnap.data();
  }

  // Batch operations for CSV import
  async importBets(bets: Omit<FirestoreBet, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const promises = bets.map(bet => this.createBet(bet));
    await Promise.all(promises);
  }

  // Offline support
  async goOffline(): Promise<void> {
    await disableNetwork(db);
  }

  async goOnline(): Promise<void> {
    await enableNetwork(db);
  }
}

// Custom hook to get Firestore service instance
export function useFirestore() {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error('User must be authenticated to use Firestore');
  }
  
  return new FirestoreService(user.uid);
}