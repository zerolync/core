import { useWallet as useLazorWallet } from '@lazorkit/wallet';
import { PasskeyStorage, debugLog } from '@zerolync/passkey-core';
import type { WalletInfo } from '@zerolync/passkey-core';
import { clearLazorKitStorage } from './storage-wrapper';
import { useEffect, useRef } from 'react';
import { useSolanaContext } from './provider';

/**
 * React hook for Solana passkey wallet operations
 *
 * @returns Wallet interface with connection, signing, and state management
 *
 * @remarks
 * This hook provides a complete interface for interacting with a Solana wallet
 * using passkey authentication. It handles:
 * - Wallet connection with WebAuthn
 * - Transaction signing and submission
 * - Cross-chain address capture (Sui)
 * - Wallet state management
 *
 * Must be used within a {@link SolanaPasskeyProvider}.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { address, isConnected, connect, signAndSendTransaction } = useSolanaPasskey();
 *
 *   const handleConnect = async () => {
 *     try {
 *       const result = await connect();
 *       console.log('Connected:', result.smartWallet);
 *     } catch (error) {
 *       console.error('Failed to connect:', error);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleConnect}>Connect Wallet</button>
 *   );
 * }
 * ```
 */
export function useSolanaPasskey() {
  const { portalUrl } = useSolanaContext();
  const {
    smartWalletPubkey,
    isConnected,
    isConnecting,
    isSigning,
    error,
    connect: lazorConnect,
    disconnect: lazorDisconnect,
    signAndSendTransaction,
    wallet: lazorWallet,
  } = useLazorWallet();

  // Store the captured suiAddress from portal message
  const suiAddressRef = useRef<string | null>(null);

  // Get the portal origin for message validation
  const portalOrigin = new URL(portalUrl).origin;

  // Listen for portal messages to capture suiAddress
  useEffect(() => {
    const handlePortalMessage = (event: MessageEvent) => {
      // Only process messages from our configured portal
      if (event.origin !== portalOrigin) {
        return;
      }

      const { type, data } = event.data;

      // Capture suiAddress from portal response
      if ((type === 'connect-result' || type === 'WALLET_CONNECTED') && data?.suiAddress) {
        debugLog('📨 Captured suiAddress from portal:', data.suiAddress);
        suiAddressRef.current = data.suiAddress;
      }
    };

    window.addEventListener('message', handlePortalMessage);
    return () => window.removeEventListener('message', handlePortalMessage);
  }, [portalOrigin]);

  const connect = async () => {
    // Clear any previous suiAddress
    suiAddressRef.current = null;

    const result = await lazorConnect();

    const storedWallet = PasskeyStorage.getWallet();
    const walletInfo: WalletInfo = {
      solana: {
        address: result.smartWallet,
        credentialId: result.credentialId,
      },
      passkey: {
        credentialId: result.credentialId,
        publicKey: btoa(String.fromCharCode(...result.passkeyPubkey)),
      },
      ...(storedWallet?.sui && { sui: storedWallet.sui }),
    };

    // If we captured a suiAddress from the portal, add it to wallet info
    if (suiAddressRef.current) {
      walletInfo.sui = {
        address: suiAddressRef.current,
        credentialId: result.credentialId,
      };
      debugLog('✅ Saved Sui address to storage:', suiAddressRef.current);
    }

    PasskeyStorage.saveWallet(walletInfo);
    return result;
  };

  const disconnect = async () => {
    await lazorDisconnect();
    PasskeyStorage.clearWallet();
    clearLazorKitStorage();
  };

  const resetWallet = () => {
    clearLazorKitStorage();
    PasskeyStorage.clearWallet();
  };

  return {
    address: smartWalletPubkey?.toBase58() ?? null,
    isConnected,
    isConnecting,
    isSigning,
    error,
    connect,
    disconnect,
    resetWallet,
    signAndSendTransaction,
    wallet: lazorWallet,
  };
}
