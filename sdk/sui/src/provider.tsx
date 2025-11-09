import React, { createContext, useContext } from 'react';

interface SuiProviderProps {
  children: React.ReactNode;
  network?: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
  rpcUrl?: string;
  portalUrl?: string;
}

interface SuiContextValue {
  network: string;
  rpcUrl: string;
  portalUrl: string;
}

const SuiContext = createContext<SuiContextValue | null>(null);

const DEFAULT_RPCS = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  testnet: 'https://fullnode.testnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
  localnet: 'http://127.0.0.1:9000',
};

export function SuiPasskeyProvider({
  children,
  network = 'devnet',
  rpcUrl,
  portalUrl,
}: SuiProviderProps) {
  if (!portalUrl) {
    throw new Error('portalUrl is required for SuiPasskeyProvider');
  }

  const finalRpcUrl = rpcUrl || DEFAULT_RPCS[network];

  return (
    <SuiContext.Provider value={{ network, rpcUrl: finalRpcUrl, portalUrl }}>
      {children}
    </SuiContext.Provider>
  );
}

export function useSuiContext() {
  const context = useContext(SuiContext);
  if (!context) {
    throw new Error('useSuiContext must be used within SuiPasskeyProvider');
  }
  return context;
}
