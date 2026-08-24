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

export const syncPendingTransactions = async (getAccessToken?: () => Promise<string | null>) => {
  if (typeof window === 'undefined') return;
  
  const pending = getPendingTransactions();
  if (pending.length === 0) return;
  
  for (const tx of pending) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (getAccessToken) {
        const token = await getAccessToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch("/api/savefi/record-tx", {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: tx.amount,
          txHash: tx.txnhash,
          chain: tx.chain,
          planName: tx.savingsname,
          type: tx.transaction_type,
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

export const submitTransaction = async (
  tx: Omit<PendingTransaction, 'id' | 'timestamp'>, 
  getAccessToken?: () => Promise<string | null>
) => {
  try {
    // 1. Immediately store in local client transaction history for instant UI update
    if (typeof window !== 'undefined' && tx.useraddress) {
      try {
        const storageKey = `bitsave_txs_${tx.useraddress.toLowerCase()}`;
        const stored = localStorage.getItem(storageKey);
        const list = stored ? JSON.parse(stored) : [];
        const existingIdx = list.findIndex((item: any) => item.txnhash === tx.txnhash);
        const newRecord = {
          id: tx.txnhash,
          amount: tx.amount,
          txnhash: tx.txnhash,
          chain: tx.chain,
          savingsname: tx.savingsname,
          useraddress: tx.useraddress,
          transaction_type: tx.transaction_type,
          currency: tx.currency,
          created_at: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          list[existingIdx] = newRecord;
        } else {
          list.unshift(newRecord);
        }
        localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 50)));
        window.dispatchEvent(new CustomEvent('bitsave_tx_updated', { detail: newRecord }));
      } catch {}
    }

    // 2. Post to /api/transactions
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: tx.amount,
        txnhash: tx.txnhash,
        chain: tx.chain,
        savingsname: tx.savingsname,
        useraddress: tx.useraddress,
        transaction_type: tx.transaction_type,
        currency: tx.currency
      }),
    }).catch(() => {});

    // 3. Post to /api/savefi/record-tx
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (getAccessToken) {
      const token = await getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch("/api/savefi/record-tx", {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: tx.amount,
        txHash: tx.txnhash,
        chain: tx.chain,
        planName: tx.savingsname,
        type: tx.transaction_type,
        currency: tx.currency
      }),
    });

    if (!response.ok) {
      savePendingTransaction(tx);
    }
  } catch (error) {
    console.error("Transaction submission failed:", error);
    savePendingTransaction(tx);
  }
};
