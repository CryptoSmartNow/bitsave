export interface PendingTransaction {
  id: string; // usually txnhash
  amount: string;
  txnhash: string;
  chain: string;
  savingsname: string;
  useraddress: string;
  transaction_type: string;
  currency: string;
  timestamp: number;
}

const STORAGE_KEY = 'bitsave_pending_transactions';

export const savePendingTransaction = (tx: Omit<PendingTransaction, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const pending = getPendingTransactions();
    const newTx: PendingTransaction = {
      ...tx,
      id: tx.txnhash,
      timestamp: Date.now()
    };
    
    // Check if it already exists to prevent duplicates
    if (!pending.find(p => p.txnhash === tx.txnhash)) {
      pending.push(newTx);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    }
  } catch (error) {
    console.error('Failed to save pending transaction', error);
  }
};

export const getPendingTransactions = (): PendingTransaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get pending transactions', error);
    return [];
  }
};

export const removePendingTransaction = (txnhash: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const pending = getPendingTransactions();
    const filtered = pending.filter(p => p.txnhash !== txnhash);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove pending transaction', error);
  }
};

export const syncPendingTransactions = async () => {
  if (typeof window === 'undefined') return;
  
  const pending = getPendingTransactions();
  if (pending.length === 0) return;
  
  for (const tx of pending) {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: tx.amount,
          txnhash: tx.txnhash,
          chain: tx.chain,
          savingsname: tx.savingsname,
          useraddress: tx.useraddress,
          transaction_type: tx.transaction_type,
          currency: tx.currency
        }),
      });
      
      if (response.ok) {
        removePendingTransaction(tx.txnhash);
      }
    } catch (error) {
      console.error(`Failed to sync pending transaction ${tx.txnhash}`, error);
      // We don't remove it so it can be retried later
    }
  }
};

export const submitTransaction = async (tx: Omit<PendingTransaction, 'id' | 'timestamp'>) => {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tx),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to submit transaction, saving to fallback queue", error);
    savePendingTransaction(tx);
    // Don't throw, assume it will sync later
    return null;
  }
};
