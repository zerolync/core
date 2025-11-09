import { useWallet as useLazorWallet } from '@lazorkit/wallet';
import { PasskeyStorage } from '@zerolync/passkey-core';
import type { WalletInfo } from '@zerolync/passkey-core';
import { clearLazorKitStorage } from './storage-wrapper';
import { useEffect, useRef } from 'react';
import { useSolanaContext } from './provider';

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
        console.log('📨 Captured suiAddress from portal:', data.suiAddress);
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
      console.log('✅ Saved Sui address to storage:', suiAddressRef.current);
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
