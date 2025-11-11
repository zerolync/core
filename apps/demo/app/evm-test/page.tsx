'use client';

import { useState } from 'react';
import { createPublicClient, createWalletClient, http, parseEther, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { toWebAuthnAccount } from '@zerodev/permissions/accounts';
import { toPermissionValidator } from '@zerodev/permissions';
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk';
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';

// Simple EVM passkey test using ZeroDev
function EvmPasskeyTest() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:5173';
  const rpcUrl = process.env.NEXT_PUBLIC_EVM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
  const zerodevProjectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';

  const createPasskey = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Open portal for passkey creation (using same Sui portal action)
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
      console.log('   📋 Credential ID:', result.credentialId);
      console.log('   📋 Public Key:', result.publicKey);

      // Store the credentials
      setCredentialId(result.credentialId);
      setPublicKey(result.publicKey);

      // Create ZeroDev smart account from the passkey
      const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: sepolia,
      });

      // Convert the passkey public key to WebAuthn format for ZeroDev
      const publicKeyBytes = Buffer.from(result.publicKey, 'base64');

      // Create WebAuthn account from existing passkey
      const webAuthnAccount = await toWebAuthnAccount({
        client: publicClient,
        credentialId: result.credentialId,
        publicKey: {
          prefix: 0x02, // Compressed secp256r1 public key
          x: BigInt('0x' + publicKeyBytes.slice(1, 33).toString('hex')),
          y: BigInt('0x' + publicKeyBytes.slice(33).toString('hex')),
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: '0.3.0',
      });

      // Create kernel account with passkey validator
      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: await toPermissionValidator(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            kernelVersion: '0.3.0',
            signer: webAuthnAccount,
          }),
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: '0.3.0',
      });

      const smartAccountAddress = kernelAccount.address;
      setAddress(smartAccountAddress);

      console.log('✅ EVM Smart Account created:', smartAccountAddress);

      // Save to localStorage for persistence
      localStorage.setItem('evm-passkey-test', JSON.stringify({
        address: smartAccountAddress,
        credentialId: result.credentialId,
        publicKey: result.publicKey,
      }));

      // Fetch balance
      await checkBalance(smartAccountAddress);

    } catch (err: any) {
      console.error('❌ Failed to create passkey:', err);
      setError(err.message || 'Failed to create passkey');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadExistingPasskey = async () => {
    try {
      const stored = localStorage.getItem('evm-passkey-test');
      if (!stored) {
        setError('No existing passkey found. Please create one first.');
        return;
      }

      const data = JSON.parse(stored);
      setAddress(data.address);
      setCredentialId(data.credentialId);
      setPublicKey(data.publicKey);

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

      const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: sepolia,
      });

      const balanceResult = await publicClient.getBalance({
        address: targetAddress as `0x${string}`
      });
      const ethBalance = (Number(balanceResult) / 1e18).toFixed(6);
      setBalance(ethBalance);
    } catch (err: any) {
      console.error('❌ Failed to check balance:', err);
    }
  };

  const executeTransfer = async () => {
    if (!address || !recipient || !amount || !credentialId || !publicKey) {
      setError('Please fill in all transfer fields and ensure wallet is connected');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      console.log('🔑 Preparing EVM transfer...');

      // This is a simplified version - full implementation would need:
      // 1. Reconstruct kernel account from stored credentials
      // 2. Create kernel client with paymaster
      // 3. Sign and send transaction using the passkey

      // For now, show what needs to be done
      setError('EVM signing implementation coming soon. Need to integrate ZeroDev kernel client with portal signing.');

    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsSigning(false);
    }
  };

  const resetWallet = () => {
    localStorage.removeItem('evm-passkey-test');
    setAddress(null);
    setBalance(null);
    setCredentialId(null);
    setPublicKey(null);
    setError(null);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>EVM Passkey Test (ZeroDev)</h1>
      <p>Test EVM passkeys using ZeroDev smart accounts with LazorKit portal</p>

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
              <p style={{ margin: '5px 0' }}><strong>Smart Account Address:</strong></p>
              <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{address}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0' }}><strong>Credential ID:</strong></p>
              <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{credentialId}</p>
            </div>

            {balance !== null && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}><strong>Balance:</strong> {balance} ETH (Sepolia)</p>
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
            <h2 style={{ marginTop: 0, color: '#4DA2FF' }}>Transfer ETH</h2>

            <input
              type="text"
              placeholder="Recipient address (0x...)"
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
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.001"
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
              {isSigning ? 'Signing & Sending...' : 'Send ETH'}
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Instructions:</h3>
        <ol>
          <li>Click "Create New Passkey" to create a new EVM wallet with passkey</li>
          <li>The portal will open for passkey creation (Face ID/Touch ID)</li>
          <li>Your EVM smart account address will be generated using ZeroDev</li>
          <li>Fund the address from a faucet (Sepolia testnet)</li>
          <li>Use the transfer form to send ETH to another address (coming soon)</li>
        </ol>
        <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <strong>Note:</strong> This uses the same passkey as Solana and Sui implementations.
          ZeroDev creates an ERC-4337 smart account controlled by your passkey.
        </p>
      </div>
    </div>
  );
}

export default function EvmTestPage() {
  return <EvmPasskeyTest />;
}
