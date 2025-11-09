import { useState, useCallback } from 'react';
import { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PasskeyStorage } from '@zerolync/passkey-core';
import { useSuiContext } from './provider';
import { Buffer } from 'buffer';
import { bcs } from '@mysten/sui/bcs';

export function useSuiPasskey() {
  const { rpcUrl, portalUrl } = useSuiContext();
  const [keypair, setKeypair] = useState<PasskeyKeypair | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Read wallet info from storage
      const storedWallet = PasskeyStorage.getWallet();

      if (!storedWallet?.passkey?.credentialId || !storedWallet?.sui?.address) {
        throw new Error('Passkey credential or Sui address not found. Please connect Solana first.');
      }

      // Use the Sui address
      const suiAddress = storedWallet.sui.address;

      console.log('✅ Sui wallet connected, address:', suiAddress);

      setAddress(suiAddress);

      return { address: suiAddress };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setKeypair(null);
    setAddress(null);
    const stored = PasskeyStorage.getWallet();
    if (stored) {
      const { sui, ...rest } = stored;
      PasskeyStorage.saveWallet(rest);
    }
  }, []);

  const signAndExecuteTransaction = useCallback(async (transaction: Transaction) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsSigning(true);
    setError(null);

    try {
      const client = new SuiClient({ url: rpcUrl });

      transaction.setSender(address);

      // Build transaction bytes
      const txBytes = await transaction.build({ client });
      const txBytesBase64 = Buffer.from(txBytes).toString('base64');

      // Open portal for signing
      console.log('🔑 Opening portal for Sui signing...');
      const portalWindow = window.open(
        `${portalUrl}?action=sign_sui&sui_tx=${encodeURIComponent(txBytesBase64)}`,
        'portal',
        'width=400,height=600'
      );

      if (!portalWindow) {
        throw new Error('Failed to open portal window');
      }

      // Wait for signature from portal
      const signResult = await new Promise<{signature: string, authenticatorData: string, clientDataJSON: string}>((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== new URL(portalUrl).origin) return;

          const { type, signature, authenticatorData, clientDataJSON } = event.data;

          if (type === 'sui-sign-result') {
            window.removeEventListener('message', handleMessage);
            portalWindow.close();
            resolve({ signature, authenticatorData, clientDataJSON });
          } else if (type === 'error') {
            window.removeEventListener('message', handleMessage);
            portalWindow.close();
            reject(new Error(event.data.message || 'Signing failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout after 5 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          portalWindow.close();
          reject(new Error('Signing timeout'));
        }, 300000);
      });

      console.log('✅ Received signature from portal');

      // Get the public key from storage
      const storedWallet = PasskeyStorage.getWallet();
      if (!storedWallet?.passkey?.publicKey) {
        throw new Error('Public key not found in storage');
      }

      // Convert signature components from base64 to bytes
      const signatureBytes = Buffer.from(signResult.signature, 'base64'); // 64 bytes (r + s)
      const publicKeyBytes = Buffer.from(storedWallet.passkey.publicKey, 'base64'); // 33 bytes compressed
      const authenticatorDataBytes = Buffer.from(signResult.authenticatorData, 'base64');
      const clientDataJSONBytes = Buffer.from(signResult.clientDataJSON, 'base64');

      // Construct the userSignature according to SIP-9:
      // userSignature = [0x02] + signature(64 bytes) + publicKey(33 bytes)
      const userSignature = new Uint8Array([
        0x02, // Secp256r1 flag
        ...signatureBytes,
        ...publicKeyBytes
      ]);

      // Define PasskeyAuthenticator struct for BCS serialization
      // IMPORTANT: Field names must match the Move struct exactly (snake_case)
      const PasskeyAuthenticatorStruct = bcs.struct('PasskeyAuthenticator', {
        authenticator_data: bcs.vector(bcs.u8()),
        client_data_json: bcs.vector(bcs.u8()),
        user_signature: bcs.vector(bcs.u8()),
      });

      // Serialize the PasskeyAuthenticator struct
      const passkeyAuthenticator = PasskeyAuthenticatorStruct.serialize({
        authenticator_data: Array.from(authenticatorDataBytes),
        client_data_json: Array.from(clientDataJSONBytes),
        user_signature: Array.from(userSignature),
      }).toBytes();

      // Final signature format: [0x06] + BCS(PasskeyAuthenticator)
      const fullSignature = new Uint8Array([
        0x06, // Passkey authenticator scheme flag
        ...passkeyAuthenticator
      ]);

      // Convert to base64 for transmission
      const fullSignatureBase64 = Buffer.from(fullSignature).toString('base64');

      console.log('🔐 Constructed SIP-9 signature:', {
        userSig: userSignature.length,
        authData: authenticatorDataBytes.length,
        clientData: clientDataJSONBytes.length,
        totalBCS: passkeyAuthenticator.length,
        fullSignature: fullSignature.length
      });

      // Execute transaction with signature
      const result = await client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: fullSignatureBase64,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  }, [address, rpcUrl, portalUrl]);

  const getBalance = useCallback(async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const client = new SuiClient({ url: rpcUrl });
    const balance = await client.getBalance({ owner: address });
    return balance;
  }, [address, rpcUrl]);

  return {
    address,
    isConnected: !!address,
    isConnecting,
    isSigning,
    error,
    connect,
    disconnect,
    signAndExecuteTransaction,
    getBalance,
    keypair,
  };
}
