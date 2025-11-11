'use client';

import { useState } from 'react';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

// Simple passkey creation using WebAuthn directly
function SuiPasskeyTest() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<Uint8Array | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:5174';
  const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

  const createPasskey = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Open portal for passkey creation
      console.log('🔑 Opening portal for passkey creation...');
      const portalWindow = window.open(
        `${portalUrl}?action=create_sui`,
        'portal',
        'width=400,height=600'
      );

      if (!portalWindow) {
        throw new Error('Failed to open portal window. Please check if popups are blocked.');
      }

      // Wait for passkey creation result from portal
      const result = await new Promise<{
        suiAddress: string;
        credentialId: string;
        publicKey: string;
      }>((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleMessage = (event: MessageEvent) => {
          const portalOrigin = new URL(portalUrl).origin;
          if (event.origin !== portalOrigin) return;

          const { type, data } = event.data;

          if (type === 'sui-create-result') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
            portalWindow.close();
            resolve(data);
          } else if (type === 'error') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
            portalWindow.close();
            reject(new Error(data.message || 'Passkey creation failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          portalWindow.close();
          reject(new Error('Passkey creation timeout'));
        }, 300000);
      });

      console.log('✅ Passkey created:', result);
      console.log('   📋 Sui Address:', result.suiAddress);
      console.log('   📋 Credential ID:', result.credentialId);
      console.log('   📋 Public Key:', result.publicKey);

      // Store the credentials
      setAddress(result.suiAddress);
      setCredentialId(result.credentialId);

      // Convert base64 public key to Uint8Array
      const pubKeyBytes = Uint8Array.from(atob(result.publicKey), c => c.charCodeAt(0));
      setPublicKey(pubKeyBytes);

      console.log('   📋 Public Key length:', pubKeyBytes.length, 'bytes');

      // Save to localStorage for persistence
      localStorage.setItem('sui-passkey-test', JSON.stringify({
        address: result.suiAddress,
        credentialId: result.credentialId,
        publicKey: result.publicKey,
      }));

      // Fetch balance
      await checkBalance(result.suiAddress);

    } catch (err: any) {
      console.error('❌ Failed to create passkey:', err);
      setError(err.message || 'Failed to create passkey');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadExistingPasskey = async () => {
    try {
      const stored = localStorage.getItem('sui-passkey-test');
      if (!stored) {
        setError('No existing passkey found. Please create one first.');
        return;
      }

      const data = JSON.parse(stored);
      setAddress(data.address);
      setCredentialId(data.credentialId);

      const pubKeyBytes = Uint8Array.from(atob(data.publicKey), c => c.charCodeAt(0));
      setPublicKey(pubKeyBytes);

      await checkBalance(data.address);
    } catch (err: any) {
      console.error('❌ Failed to load passkey:', err);
      setError(err.message || 'Failed to load passkey');
    }
  };

  const checkBalance = async (addr?: string) => {
    try {
      const targetAddress = addr || address;
      if (!targetAddress) return;

      const client = new SuiClient({ url: rpcUrl });
      const balanceResult = await client.getBalance({ owner: targetAddress });
      const suiBalance = (Number(balanceResult.totalBalance) / 1e9).toFixed(4);
      setBalance(suiBalance);
    } catch (err: any) {
      console.error('❌ Failed to check balance:', err);
    }
  };

  const executeTransfer = async () => {
    if (!address || !recipient || !amount) {
      setError('Please fill in all transfer fields');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const client = new SuiClient({ url: rpcUrl });

      // Create transaction
      const tx = new Transaction();
      tx.setSender(address);
      const [coin] = tx.splitCoins(tx.gas, [Math.floor(parseFloat(amount) * 1e9)]);
      tx.transferObjects([coin], recipient);

      // Build transaction bytes
      const txBytes = await tx.build({ client });
      const txBytesBase64 = Buffer.from(txBytes).toString('base64');

      console.log('🔑 Opening portal for signing...');
      console.log('   📋 Using Credential ID:', credentialId);
      console.log('   📋 Using Address:', address);
      console.log('   📋 Public Key length:', publicKey?.length, 'bytes');

      // Pass the credential ID to the portal so it uses the correct credential
      const portalWindow = window.open(
        `${portalUrl}?action=sign_sui&sui_tx=${encodeURIComponent(txBytesBase64)}&credential_id=${encodeURIComponent(credentialId || '')}`,
        'portal',
        'width=400,height=600'
      );

      if (!portalWindow) {
        throw new Error('Failed to open portal window. Please check if popups are blocked.');
      }

      // Wait for signature from portal
      const signResult = await new Promise<{
        signature: string;
        authenticatorData: string;
        clientDataJSON: string;
      }>((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleMessage = (event: MessageEvent) => {
          const portalOrigin = new URL(portalUrl).origin;
          if (event.origin !== portalOrigin) return;

          const { type, signature, authenticatorData, clientDataJSON } = event.data;

          if (type === 'sui-sign-result') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
            // TEMPORARILY DISABLED FOR DEBUGGING - Keep portal window open
            // portalWindow.close();
            console.log('🔍 [DEBUG] Portal window kept open for log inspection. Close it manually.');
            resolve({ signature, authenticatorData, clientDataJSON });
          } else if (type === 'error') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
            // TEMPORARILY DISABLED FOR DEBUGGING - Keep portal window open
            // portalWindow.close();
            console.log('🔍 [DEBUG] Portal window kept open for log inspection. Close it manually.');
            reject(new Error(event.data.message || 'Signing failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          portalWindow.close();
          reject(new Error('Signing timeout'));
        }, 300000);
      });

      console.log('✅ Received signature from portal');
      console.log('   📋 Signature length:', signResult.signature ? Buffer.from(signResult.signature, 'base64').length : 0, 'bytes');
      console.log('   📋 Authenticator data length:', signResult.authenticatorData ? Buffer.from(signResult.authenticatorData, 'base64').length : 0, 'bytes');
      console.log('   📋 Client data JSON length:', signResult.clientDataJSON ? Buffer.from(signResult.clientDataJSON, 'base64').length : 0, 'bytes');

      if (!publicKey) {
        throw new Error('Public key not found');
      }

      // Construct SIP-9 compliant signature
      const signatureBytes = Buffer.from(signResult.signature, 'base64');
      const authenticatorDataBytes = Buffer.from(signResult.authenticatorData, 'base64');
      // clientDataJSON should be decoded as a string, not kept as bytes
      const clientDataJSONString = Buffer.from(signResult.clientDataJSON, 'base64').toString('utf-8');

      console.log('🔐 Constructing SIP-9 signature...');
      console.log('   📋 Signature bytes:', signatureBytes.length);
      console.log('   📋 Public key bytes:', publicKey.length);
      console.log('   📋 Client data JSON string length:', clientDataJSONString.length, 'chars');

      // SIP-9 userSignature format: [flag (0x02)] || [64-byte signature] || [33-byte public key]
      const userSignature = new Uint8Array([
        0x02, // Secp256r1 flag
        ...signatureBytes, // 64 bytes
        ...publicKey, // 33 bytes (compressed public key)
      ]);

      console.log('   📋 User signature length:', userSignature.length, 'bytes (should be 98 for SIP-9: 1 + 64 + 33)');

      // BCS serialize PasskeyAuthenticator - IMPORTANT: clientDataJson is bcs.string(), not bcs.vector(bcs.u8())
      const PasskeyAuthenticatorStruct = bcs.struct('PasskeyAuthenticator', {
        authenticator_data: bcs.vector(bcs.u8()),
        client_data_json: bcs.string(),
        user_signature: bcs.vector(bcs.u8()),
      });

      const passkeyAuthenticator = PasskeyAuthenticatorStruct.serialize({
        authenticator_data: Array.from(authenticatorDataBytes),
        client_data_json: clientDataJSONString,
        user_signature: Array.from(userSignature),
      }).toBytes();

      // Final signature: [0x06] + BCS(PasskeyAuthenticator)
      const fullSignature = new Uint8Array([
        0x06, // Passkey authenticator scheme flag
        ...passkeyAuthenticator
      ]);

      const fullSignatureBase64 = Buffer.from(fullSignature).toString('base64');

      console.log('🔐 Executing transaction...');

      // Execute transaction
      const result = await client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: fullSignatureBase64,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('✅ Transaction successful:', result.digest);
      alert(`Transaction successful!\nDigest: ${result.digest}`);

      // Refresh balance
      await checkBalance();

      // Clear form
      setRecipient('');
      setAmount('');

    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsSigning(false);
    }
  };

  const resetWallet = () => {
    localStorage.removeItem('sui-passkey-test');
    setAddress(null);
    setBalance(null);
    setCredentialId(null);
    setPublicKey(null);
    setError(null);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>Sui Passkey Test</h1>
      <p>Test Sui passkeys using LazorKit portal</p>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      {!address ? (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={createPasskey}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              backgroundColor: '#4DA2FF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              marginBottom: '10px',
            }}
          >
            {isConnecting ? 'Creating Passkey...' : 'Create New Passkey'}
          </button>

          <button
            onClick={loadExistingPasskey}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            Load Existing Passkey
          </button>
        </div>
      ) : (
        <>
          <div style={{
            padding: '20px',
            border: '2px solid #4DA2FF',
            borderRadius: '8px',
            backgroundColor: '#f8f8f8',
            marginTop: '20px'
          }}>
            <h2 style={{ marginTop: 0, color: '#4DA2FF' }}>Wallet Info</h2>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0' }}><strong>Address:</strong></p>
              <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{address}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0' }}><strong>Credential ID:</strong></p>
              <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{credentialId}</p>
            </div>

            {balance !== null && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}><strong>Balance:</strong> {balance} SUI</p>
              </div>
            )}

            <button
              onClick={() => checkBalance()}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                marginRight: '10px',
              }}
            >
              Refresh Balance
            </button>

            <button
              onClick={resetWallet}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Reset Wallet
            </button>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #4DA2FF',
            borderRadius: '8px',
            backgroundColor: '#f8f8f8',
            marginTop: '20px'
          }}>
            <h2 style={{ marginTop: 0, color: '#4DA2FF' }}>Transfer SUI</h2>

            <input
              type="text"
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />

            <input
              type="number"
              placeholder="Amount (SUI)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />

            <button
              onClick={executeTransfer}
              disabled={!recipient || !amount || isSigning}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                cursor: (!recipient || !amount || isSigning) ? 'not-allowed' : 'pointer',
                backgroundColor: '#4DA2FF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              {isSigning ? 'Signing & Sending...' : 'Send SUI'}
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Instructions:</h3>
        <ol>
          <li>Click "Create New Passkey" to create a new Sui wallet with passkey</li>
          <li>The portal will open for passkey creation (Face ID/Touch ID)</li>
          <li>Your Sui address will be generated from the passkey</li>
          <li>Fund the address from a faucet if testing on testnet</li>
          <li>Use the transfer form to send SUI to another address</li>
        </ol>
      </div>
    </div>
  );
}

export default function SuiTestPage() {
  return <SuiPasskeyTest />;
}
