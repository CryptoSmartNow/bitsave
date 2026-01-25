// Note: File-based storage has been replaced with MongoDB
// All interactions are now stored in MongoDB via API endpoints

// Type definitions for interaction data
export interface BaseInteractionData {
  url: string;
  referrer?: string;
}

export interface WalletConnectData extends BaseInteractionData {
  [key: string]: unknown;
}

export interface SavingsData extends BaseInteractionData {
  amount?: string;
  currency?: string;
  chain?: string;
  name?: string;
  endDate?: string;
  penalty?: string;
  [key: string]: unknown;
}

export interface TransactionData extends BaseInteractionData {
  txHash?: string;
  amount?: string;
  currency?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ErrorData extends BaseInteractionData {
  error: string;
  stack?: string;
  component?: string;
  [key: string]: unknown;
}

export interface PageVisitData extends BaseInteractionData {
  page: string;
  [key: string]: unknown;
}

export type InteractionData = 
  | WalletConnectData 
  | SavingsData 
  | TransactionData 
  | ErrorData 
  | PageVisitData 
  | BaseInteractionData;

export interface UserInteraction {
  id: string;
  timestamp: string;
  type: 'wallet_connect' | 'wallet_disconnect' | 'savings_created' | 'page_visit' | 'transaction' | 'error';
  walletAddress?: string;
  userAgent: string;
  ip?: string;
  data: InteractionData;
  sessionId: string;
}

class InteractionTracker {
  constructor() {
    // MongoDB-based storage - no file system setup needed
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('bitsave_session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('bitsave_session_id', sessionId);
      }
      return sessionId;
    }
    return `server-session-${Date.now()}`;
  }

  async trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp' | 'sessionId'>) {
    const newInteraction: UserInteraction = {
      ...interaction,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
    };

    try {
      // Send to MongoDB API for both client and server-side
      await fetch('/api/user-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInteraction),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  // Note: File-based methods removed - all data now stored in MongoDB
  // Use the API endpoints in /api/user-interactions for data operations
}

export const interactionTracker = new InteractionTracker();
export { InteractionTracker };

// Client-side helper functions
export const trackWalletConnect = (walletAddress: string, additionalData?: Partial<WalletConnectData>) => {
  if (typeof window !== 'undefined') {
    interactionTracker.trackInteraction({
      type: 'wallet_connect',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        url: window.location.href,
        referrer: document.referrer,
        ...additionalData,
      },
    });
  }
};

export const trackWalletDisconnect = (walletAddress?: string) => {
  if (typeof window !== 'undefined') {
    interactionTracker.trackInteraction({
      type: 'wallet_disconnect',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        url: window.location.href,
      },
    });
  }
};

export const trackPageVisit = (page: string, additionalData?: Partial<PageVisitData> & { walletAddress?: string }) => {
  if (typeof window !== 'undefined') {
    const { walletAddress, ...restData } = additionalData || {};
    interactionTracker.trackInteraction({
      type: 'page_visit',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        page,
        url: window.location.href,
        referrer: document.referrer,
        ...restData,
      },
    });
  }
};

export const trackSavingsCreated = (walletAddress: string, savingsData: Partial<SavingsData>) => {
  if (typeof window !== 'undefined') {
    interactionTracker.trackInteraction({
      type: 'savings_created',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        url: window.location.href,
        ...savingsData,
      },
    });
  }
};

export const trackTransaction = (walletAddress: string, transactionData: Partial<TransactionData>) => {
  if (typeof window !== 'undefined') {
    interactionTracker.trackInteraction({
      type: 'transaction',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        url: window.location.href,
        ...transactionData,
      },
    });
  }
};

export const trackError = (walletAddress: string | undefined, error: string, additionalData?: Partial<ErrorData>) => {
  if (typeof window !== 'undefined') {
    interactionTracker.trackInteraction({
      type: 'error',
      walletAddress,
      userAgent: navigator.userAgent,
      data: {
        error,
        url: window.location.href,
        ...additionalData,
      },
    });
  }
};