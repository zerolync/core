'use client';

import { SolanaPasskeyProvider, useSolanaPasskey } from '@zero-lync/passkey-solana';
import { SuiPasskeyProvider, useSuiPasskey } from '@zero-lync/passkey-sui';
import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';

function CrossChainWallet() {
  const solana = useSolanaPasskey();
  const sui = useSuiPasskey();
  const [suiBalance, setSuiBalance] = useState<string | null>(null);
  const [solanaBalance, setSolanaBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Transfer states
  const [solanaRecipient, setSolanaRecipient] = useState('');
  const [solanaAmount, setSolanaAmount] = useState('');
  const [suiRecipient, setSuiRecipient] = useState('');
  const [suiAmount, setSuiAmount] = useState('');

  const connectBoth = async () => {
    setIsConnecting(true);
    try {
      console.log('🔵 [STEP 1] Starting Solana connection...');

      // Connect to Solana first (creates/recovers passkey)
      try {
        const solanaResult = await solana.connect();
        console.log('✅ [STEP 1] Solana connected successfully');
        console.log('   📋 Solana address:', solana.address);
        console.log('   📋 Solana result:', JSON.stringify(solanaResult, null, 2));
      } catch (solanaErr: any) {
        console.error('❌ [STEP 1] Solana connection failed');
        console.error('   Error name:', solanaErr?.name);
        console.error('   Error message:', solanaErr?.message);
        console.error('   Error stack:', solanaErr?.stack);
        console.error('   Full error:', solanaErr);
        throw solanaErr;
      }

      console.log('🔵 [STEP 2] Starting Sui connection...');

      // Then connect to Sui (reuses same passkey)
      try {
        const suiResult = await sui.connect();
        console.log('✅ [STEP 2] Sui connected successfully');
        console.log('   📋 Sui result:', JSON.stringify(suiResult, null, 2));

        // Load balances - pass the address directly from the result
        console.log('🔵 [STEP 3] Loading balances...');
        await Promise.all([
          checkSolanaBalance(),
          checkSuiBalance(suiResult.address)
        ]);
        console.log('✅ [STEP 3] Balances loaded');
      } catch (suiErr: any) {
        console.error('❌ [STEP 2] Sui connection failed');
        console.error('   Error name:', suiErr?.name);
        console.error('   Error message:', suiErr?.message);
        console.error('   Error stack:', suiErr?.stack);
        console.error('   Full error:', suiErr);
        throw suiErr;
      }
    } catch (err: any) {
      console.error('❌ [OVERALL] Connection failed');
      console.error('   Error type:', typeof err);
      console.error('   Error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const createNewWallet = async () => {
    setIsConnecting(true);
    try {
      console.log('🔵 [NEW WALLET - STEP 0] Resetting wallet...');
      solana.resetWallet();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('✅ [NEW WALLET - STEP 0] Wallet reset complete');

      console.log('🔵 [NEW WALLET - STEP 1] Starting Solana connection...');

      try {
        const solanaResult = await solana.connect();
        console.log('✅ [NEW WALLET - STEP 1] Solana connected successfully');
        console.log('   📋 Solana address:', solana.address);
        console.log('   📋 Solana result:', JSON.stringify(solanaResult, null, 2));
      } catch (solanaErr: any) {
        console.error('❌ [NEW WALLET - STEP 1] Solana connection failed');
        console.error('   Error name:', solanaErr?.name);
        console.error('   Error message:', solanaErr?.message);
        console.error('   Error stack:', solanaErr?.stack);
        console.error('   Full error:', solanaErr);
        throw solanaErr;
      }

      console.log('🔵 [NEW WALLET - STEP 2] Starting Sui connection...');

      try {
        const suiResult = await sui.connect();
        console.log('✅ [NEW WALLET - STEP 2] Sui connected successfully');
        console.log('   📋 Sui result:', JSON.stringify(suiResult, null, 2));

        // Load balances - pass the address directly from the result
        console.log('🔵 [NEW WALLET - STEP 3] Loading balances...');
        await Promise.all([
          checkSolanaBalance(),
          checkSuiBalance(suiResult.address)
        ]);
        console.log('✅ [NEW WALLET - STEP 3] Balances loaded');
      } catch (suiErr: any) {
        console.error('❌ [NEW WALLET - STEP 2] Sui connection failed');
        console.error('   Error name:', suiErr?.name);
        console.error('   Error message:', suiErr?.message);
        console.error('   Error stack:', suiErr?.stack);
        console.error('   Full error:', suiErr);
        throw suiErr;
      }
    } catch (err: any) {
      console.error('❌ [NEW WALLET - OVERALL] Wallet creation failed');
      console.error('   Error type:', typeof err);
      console.error('   Error:', err);
    } finally {
      setIsConnecting(false);
    }
  };


  const disconnectBoth = async () => {
    await solana.disconnect();
    sui.disconnect();
    setSolanaBalance(null);
    setSuiBalance(null);
  };

  const checkSolanaBalance = async () => {
    try {
      if (!solana.address) return;
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
      const balance = await connection.getBalance(new PublicKey(solana.address));
      setSolanaBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
    } catch (err) {
      console.error('Failed to check Solana balance:', err);
    }
  };

  const checkSuiBalance = async (address?: string) => {
    try {
      const suiAddr = address || sui.address;
      console.log('🔍 Checking Sui balance, address:', suiAddr, 'isConnected:', sui.isConnected);
      if (!suiAddr) {
        console.log('⚠️ No Sui address, skipping balance check');
        return;
      }

      // Use SuiClient directly with the address instead of relying on hook state
      const client = new SuiClient({
        url: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
      });
      const balance = await client.getBalance({ owner: suiAddr });
      console.log('💰 Sui balance fetched:', balance);
      const formattedBalance = (Number(balance.totalBalance) / 1e9).toFixed(4);
      console.log('💰 Setting Sui balance to:', formattedBalance);
      setSuiBalance(formattedBalance);
    } catch (err) {
      console.error('❌ Failed to check Sui balance:', err);
    }
  };

  const transferSolana = async () => {
    try {
      if (!solanaRecipient || !solanaAmount) return;

      const instruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(solana.address!),
        toPubkey: new PublicKey(solanaRecipient),
        lamports: Math.floor(parseFloat(solanaAmount) * LAMPORTS_PER_SOL),
      });

      await solana.signAndSendTransaction(instruction);
      alert('Solana transfer successful!');
      setSolanaRecipient('');
      setSolanaAmount('');
      await checkSolanaBalance();
    } catch (err: any) {
      console.error('Solana transfer failed:', err);
      alert(`Transfer failed: ${err.message}`);
    }
  };

  const transferSui = async () => {
    try {
      if (!suiRecipient || !suiAmount) return;

      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [Math.floor(parseFloat(suiAmount) * 1e9)]);
      tx.transferObjects([coin], suiRecipient);

      await sui.signAndExecuteTransaction(tx);
      alert('Sui transfer successful!');
      setSuiRecipient('');
      setSuiAmount('');
      await checkSuiBalance();
    } catch (err: any) {
      console.error('Sui transfer failed:', err);
      alert(`Transfer failed: ${err.message}`);
    }
  };

  const refreshBalances = async () => {
    await Promise.all([checkSolanaBalance(), checkSuiBalance()]);
  };

  const isConnected = solana.isConnected && sui.isConnected;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>Zerolync Cross-Chain Passkey Wallet</h1>
      <p>One passkey, multiple chains (Solana + Sui)</p>

      {!isConnected ? (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={connectBoth}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              marginBottom: '10px',
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Existing Wallet'}
          </button>
          <button
            onClick={createNewWallet}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {isConnecting ? 'Creating...' : 'Create New Wallet'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={refreshBalances}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Refresh Balances
            </button>
            <button
              onClick={disconnectBoth}
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
              Disconnect All
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
            {/* Solana Card */}
            <div style={{ padding: '20px', border: '2px solid #14F195', borderRadius: '8px', backgroundColor: '#f8f8f8' }}>
              <h2 style={{ marginTop: 0, color: '#14F195' }}>Solana</h2>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}><strong>Address:</strong></p>
                <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{solana.address}</p>
                {solanaBalance !== null && (
                  <p style={{ margin: '5px 0' }}><strong>Balance:</strong> {solanaBalance} SOL</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Transfer SOL</h3>
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={solanaRecipient}
                  onChange={(e) => setSolanaRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={solanaAmount}
                  onChange={(e) => setSolanaAmount(e.target.value)}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={transferSolana}
                  disabled={!solanaRecipient || !solanaAmount || solana.isSigning}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    cursor: (!solanaRecipient || !solanaAmount || solana.isSigning) ? 'not-allowed' : 'pointer',
                    backgroundColor: '#14F195',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  {solana.isSigning ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Sui Card */}
            <div style={{ padding: '20px', border: '2px solid #4DA2FF', borderRadius: '8px', backgroundColor: '#f8f8f8' }}>
              <h2 style={{ marginTop: 0, color: '#4DA2FF' }}>Sui</h2>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}><strong>Address:</strong></p>
                <p style={{ wordBreak: 'break-all', fontSize: '11px', margin: '5px 0' }}>{sui.address}</p>
                {suiBalance !== null && (
                  <p style={{ margin: '5px 0' }}><strong>Balance:</strong> {suiBalance} SUI</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Transfer SUI</h3>
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={suiRecipient}
                  onChange={(e) => setSuiRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={suiAmount}
                  onChange={(e) => setSuiAmount(e.target.value)}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={transferSui}
                  disabled={!suiRecipient || !suiAmount || sui.isSigning}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    cursor: (!suiRecipient || !suiAmount || sui.isSigning) ? 'not-allowed' : 'pointer',
                    backgroundColor: '#4DA2FF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  {sui.isSigning ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {(solana.error || sui.error) && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fee', borderRadius: '4px' }}>
          <p style={{ color: '#c00', fontSize: '14px' }}>
            {solana.error?.message || sui.error?.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <SolanaPasskeyProvider
      rpcUrl={process.env.NEXT_PUBLIC_SOLANA_RPC_URL!}
      portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL}
      paymasterUrl={process.env.NEXT_PUBLIC_PAYMASTER_URL}
    >
      <SuiPasskeyProvider
        network="devnet"
        portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL}
      >
        <CrossChainWallet />
      </SuiPasskeyProvider>
    </SolanaPasskeyProvider>
  );
}
