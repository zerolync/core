import React, { createContext, useContext } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';

interface SolanaProviderProps {
  children: React.ReactNode;
  rpcUrl: string;
  portalUrl?: string;
  paymasterUrl?: string;
}

interface SolanaContextValue {
  rpcUrl: string;
  portalUrl: string;
}

const SolanaContext = createContext<SolanaContextValue | null>(null);

export function SolanaPasskeyProvider({
  children,
  rpcUrl,
  portalUrl,
  paymasterUrl,
}: SolanaProviderProps) {
  if (!portalUrl) {
    throw new Error('portalUrl is required for SolanaPasskeyProvider');
  }

  console.log('🔧 SolanaPasskeyProvider initialized with portal:', portalUrl);

  return (
    <SolanaContext.Provider value={{ rpcUrl, portalUrl }}>
      <LazorkitProvider
        rpcUrl={rpcUrl}
        portalUrl={portalUrl}
        paymasterUrl={paymasterUrl}
      >
        {children}
      </LazorkitProvider>
    </SolanaContext.Provider>
  );
}

export function useSolanaContext() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolanaContext must be used within SolanaPasskeyProvider');
  }
  return context;
}
