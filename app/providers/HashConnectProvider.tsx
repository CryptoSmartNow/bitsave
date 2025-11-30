'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HashConnectContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  accountId: string | null;
}

const HashConnectContext = createContext<HashConnectContextType | undefined>(undefined);

interface HashConnectProviderProps {
  children: ReactNode;
}

export const HashConnectProvider: React.FC<HashConnectProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  const connect = async () => {
    try {
      console.log('HashConnect: Connecting...');
      // Basic connection logic would go here
      setIsConnected(true);
      setAccountId('0.0.123456'); // Mock account ID
    } catch (error) {
      console.error('HashConnect connection failed:', error);
    }
  };

  const disconnect = () => {
    console.log('HashConnect: Disconnecting...');
    setIsConnected(false);
    setAccountId(null);
  };

  const value: HashConnectContextType = {
    isConnected,
    connect,
    disconnect,
    accountId,
  };

  return (
    <HashConnectContext.Provider value={value}>
      {children}
    </HashConnectContext.Provider>
  );
};

export const useHashConnect = (): HashConnectContextType => {
  const context = useContext(HashConnectContext);
  if (context === undefined) {
    throw new Error('useHashConnect must be used within a HashConnectProvider');
  }
  return context;
};

export default HashConnectProvider;