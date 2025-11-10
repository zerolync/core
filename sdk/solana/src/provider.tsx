import React, { createContext, useContext } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { debugLog } from '@zerolync/passkey-core';

/**
 * Props for the Solana Passkey Provider
 */
interface SolanaProviderProps {
  /** React children to wrap */
  children: React.ReactNode;
  /** Solana RPC URL (e.g., https://api.devnet.solana.com) */
  rpcUrl: string;
  /** Portal URL for signing interface (required) */
  portalUrl?: string;
  /** Optional paymaster URL for sponsored transactions */
  paymasterUrl?: string;
}

/**
 * Context value provided by SolanaPasskeyProvider
 */
interface SolanaContextValue {
  /** Configured Solana RPC URL */
  rpcUrl: string;
  /** Configured portal URL */
  portalUrl: string;
}

const SolanaContext = createContext<SolanaContextValue | null>(null);

/**
 * Provider component for Solana passkey wallet functionality
 *
 * @param props - Provider configuration
 *
 * @remarks
 * This provider must wrap your app or the components that use {@link useSolanaPasskey}.
 * It configures the RPC endpoint, portal URL for signing, and optional paymaster
 * for sponsored transactions.
 *
 * @example
 * ```typescript
 * import { SolanaPasskeyProvider } from '@zerolync/passkey-solana';
 *
 * function App() {
 *   return (
 *     <SolanaPasskeyProvider
 *       rpcUrl="https://api.devnet.solana.com"
 *       portalUrl="http://localhost:5173"
 *       paymasterUrl="https://kora.lazorkit.com"
 *     >
 *       <YourApp />
 *     </SolanaPasskeyProvider>
 *   );
 * }
 * ```
 *
 * @throws {Error} If portalUrl is not provided
 */
export function SolanaPasskeyProvider({
  children,
  rpcUrl,
  portalUrl,
  paymasterUrl,
}: SolanaProviderProps) {
  if (!portalUrl) {
    throw new Error('portalUrl is required for SolanaPasskeyProvider');
  }

  debugLog('🔧 SolanaPasskeyProvider initialized with portal:', portalUrl);

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
