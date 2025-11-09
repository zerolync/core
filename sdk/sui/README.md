# @zerolync/passkey-sui

Sui passkey authentication SDK - React hooks for passwordless Sui wallets using WebAuthn.

## Overview

This package provides React hooks and components for integrating passkey-based authentication into Sui dApps. Users can create and access Sui wallets using biometric authentication (Face ID, Touch ID, Windows Hello) instead of managing seed phrases.

## Features

- **Passwordless Authentication**: Use biometrics instead of seed phrases
- **React Hooks**: Simple `useSuiPasskey()` hook for wallet operations
- **Cross-Chain Support**: Share the same passkey across multiple blockchains
- **Portal-Based Signing**: Custom signing UI with full control
- **Transaction Execution**: Sign and execute Sui transactions seamlessly
- **Type-Safe**: Full TypeScript support
- **SIP-9 Compliant**: Implements Sui passkey authentication standard

## Installation

```bash
npm install @zerolync/passkey-sui @mysten/sui
# or
pnpm add @zerolync/passkey-sui @mysten/sui
# or
yarn add @zerolync/passkey-sui @mysten/sui
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
import { SuiPasskeyProvider } from '@zerolync/passkey-sui';

function App() {
  return (
    <SuiPasskeyProvider
      network="devnet"  // or 'mainnet', 'testnet', 'localnet'
      portalUrl="https://your-portal-url.com"
    >
      <YourApp />
    </SuiPasskeyProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useSuiPasskey } from '@zerolync/passkey-sui';
import { Transaction } from '@mysten/sui/transactions';

function Wallet() {
  const {
    address,
    isConnected,
    isConnecting,
    isSigning,
    connect,
    disconnect,
    signAndExecuteTransaction,
    getBalance
  } = useSuiPasskey();

  const handleConnect = async () => {
    try {
      const result = await connect();
      console.log('Connected!', result.address);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleTransfer = async () => {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [0.1 * 1e9]); // 0.1 SUI
    tx.transferObjects([coin], 'recipient-address');

    try {
      const result = await signAndExecuteTransaction(tx);
      console.log('Transaction result:', result);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div>
      <p>Address: {address}</p>
      <button onClick={handleTransfer} disabled={isSigning}>
        {isSigning ? 'Sending...' : 'Send 0.1 SUI'}
      </button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## API Reference

### `SuiPasskeyProvider`

Provider component that wraps your app and provides Sui passkey context.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `network` | `'mainnet' \| 'testnet' \| 'devnet' \| 'localnet'` | No | `'devnet'` | Sui network to connect to |
| `rpcUrl` | `string` | No | Network default | Custom RPC endpoint URL |
| `portalUrl` | `string` | Yes | - | Portal service URL for signing interface |
| `children` | `ReactNode` | Yes | - | Child components |

**Default RPC URLs:**
- `mainnet`: https://fullnode.mainnet.sui.io:443
- `testnet`: https://fullnode.testnet.sui.io:443
- `devnet`: https://fullnode.devnet.sui.io:443
- `localnet`: http://127.0.0.1:9000

### `useSuiPasskey()`

Hook that provides access to Sui wallet functionality.

#### Returns

```typescript
{
  address: string | null;                      // Wallet address (hex format with 0x prefix)
  isConnected: boolean;                        // Connection status
  isConnecting: boolean;                       // Loading state during connection
  isSigning: boolean;                          // Loading state during transaction signing
  error: Error | null;                         // Last error that occurred
  connect: () => Promise<{                     // Connect wallet with passkey
    address: string;
  }>;
  disconnect: () => void;                      // Disconnect wallet
  signAndExecuteTransaction: (                 // Sign and execute a transaction
    transaction: Transaction
  ) => Promise<SuiTransactionBlockResponse>;
  getBalance: () => Promise<{                  // Get wallet balance
    coinType: string;
    coinObjectCount: number;
    totalBalance: string;
    lockedBalance: object;
  }>;
  keypair: PasskeyKeypair | null;             // Raw keypair object
}
```

## Advanced Usage

### Using Custom RPC URL

```tsx
<SuiPasskeyProvider
  network="devnet"
  rpcUrl="https://custom-rpc-endpoint.com"
  portalUrl="https://your-portal-url.com"
>
  <YourApp />
</SuiPasskeyProvider>
```

### Checking Balance

```tsx
function Balance() {
  const { getBalance, isConnected } = useSuiPasskey();
  const [balance, setBalance] = useState<string>('0');

  const checkBalance = async () => {
    if (!isConnected) return;

    try {
      const result = await getBalance();
      // Convert from MIST to SUI (1 SUI = 1e9 MIST)
      const suiBalance = (Number(result.totalBalance) / 1e9).toFixed(4);
      setBalance(suiBalance);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  return (
    <div>
      <p>Balance: {balance} SUI</p>
      <button onClick={checkBalance}>Refresh</button>
    </div>
  );
}
```

### Complex Transactions

```tsx
import { Transaction } from '@mysten/sui/transactions';

function ComplexTransaction() {
  const { signAndExecuteTransaction, address } = useSuiPasskey();

  const executeComplex = async () => {
    const tx = new Transaction();

    // Split coins
    const [coin1, coin2] = tx.splitCoins(tx.gas, [0.1 * 1e9, 0.2 * 1e9]);

    // Transfer to multiple recipients
    tx.transferObjects([coin1], 'recipient1-address');
    tx.transferObjects([coin2], 'recipient2-address');

    // Set sender
    tx.setSender(address!);

    const result = await signAndExecuteTransaction(tx);
    console.log('Complex transaction executed:', result);
  };

  return <button onClick={executeComplex}>Execute Complex TX</button>;
}
```

## Cross-Chain Usage

The same passkey can be used across multiple chains. When combined with `@zerolync/passkey-solana`, the Sui wallet must be connected **after** the Solana wallet to reuse the passkey:

```tsx
import { SolanaPasskeyProvider, useSolanaPasskey } from '@zerolync/passkey-solana';
import { SuiPasskeyProvider, useSuiPasskey } from '@zerolync/passkey-sui';

function CrossChainWallet() {
  const solana = useSolanaPasskey();
  const sui = useSuiPasskey();

  const connectBoth = async () => {
    // Connect to Solana first (creates passkey)
    await solana.connect();

    // Connect to Sui (reuses passkey)
    await sui.connect();
  };

  return <button onClick={connectBoth}>Connect Both Chains</button>;
}

function App() {
  return (
    <SolanaPasskeyProvider rpcUrl="..." portalUrl="...">
      <SuiPasskeyProvider network="devnet" portalUrl="...">
        <CrossChainWallet />
      </SuiPasskeyProvider>
    </SolanaPasskeyProvider>
  );
}
```

## Environment Setup

### Development

For local development, you'll need to run a portal service. See the [@zerolync/portal](../../services/portal) package for setup instructions.

### Environment Variables

```env
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_PORTAL_URL=http://localhost:5173
```

## How It Works

1. **Passkey Creation**: When connecting for the first time (via Solana SDK), a WebAuthn passkey is created and stored in the browser
2. **Sui Address Derivation**: The portal service derives a Sui address from the passkey's public key
3. **Transaction Signing**: Transactions are signed using the WebAuthn credential
4. **SIP-9 Compliance**: Signatures follow the Sui Improvement Proposal 9 standard for passkey authentication

## Troubleshooting

### "Passkey credential or Sui address not found"

This error occurs when trying to connect to Sui without first connecting to Solana. The Sui SDK reuses the passkey created by the Solana SDK, so you must:

1. Connect to Solana first using `@zerolync/passkey-solana`
2. Then connect to Sui using this SDK

### Transaction Fails with Signature Error

Ensure that:
- The portal service is running and accessible
- The `portalUrl` is correctly configured
- The transaction sender matches the connected wallet address

## Related Packages

- [@zerolync/passkey-core](../core) - Core utilities and types
- [@zerolync/passkey-solana](../solana) - Solana passkey authentication

## License

MIT
