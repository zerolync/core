# @zerolync/passkey-solana

Solana passkey authentication SDK - React hooks for passwordless Solana wallets using WebAuthn.

## Overview

This package provides React hooks and components for integrating passkey-based authentication into Solana dApps. Users can create and access Solana wallets using biometric authentication (Face ID, Touch ID, Windows Hello) instead of managing seed phrases.

## Features

- **Passwordless Authentication**: Use biometrics instead of seed phrases
- **React Hooks**: Simple `useSolanaPasskey()` hook for wallet operations
- **Cross-Chain Support**: Share the same passkey across multiple blockchains
- **Portal-Based Signing**: Custom signing UI with full control
- **Transaction Signing**: Sign and send Solana transactions seamlessly
- **Type-Safe**: Full TypeScript support

## Installation

```bash
npm install @zerolync/passkey-solana @solana/web3.js
# or
pnpm add @zerolync/passkey-solana @solana/web3.js
# or
yarn add @zerolync/passkey-solana @solana/web3.js
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
import { SolanaPasskeyProvider } from '@zerolync/passkey-solana';

function App() {
  return (
    <SolanaPasskeyProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://your-portal-url.com"
      paymasterUrl="https://your-paymaster-url.com" // optional
    >
      <YourApp />
    </SolanaPasskeyProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useSolanaPasskey } from '@zerolync/passkey-solana';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

function Wallet() {
  const {
    address,
    isConnected,
    isConnecting,
    isSigning,
    connect,
    disconnect,
    signAndSendTransaction
  } = useSolanaPasskey();

  const handleConnect = async () => {
    try {
      await connect();
      console.log('Connected!', address);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleTransfer = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(address!),
      toPubkey: new PublicKey('recipient-address'),
      lamports: 0.1 * LAMPORTS_PER_SOL,
    });

    try {
      const signature = await signAndSendTransaction(instruction);
      console.log('Transaction signature:', signature);
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
        {isSigning ? 'Sending...' : 'Send 0.1 SOL'}
      </button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## API Reference

### `SolanaPasskeyProvider`

Provider component that wraps your app and provides Solana passkey context.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `rpcUrl` | `string` | Yes | Solana RPC endpoint URL |
| `portalUrl` | `string` | Yes | Portal service URL for signing interface |
| `paymasterUrl` | `string` | No | Paymaster service URL for sponsored transactions |
| `children` | `ReactNode` | Yes | Child components |

### `useSolanaPasskey()`

Hook that provides access to Solana wallet functionality.

#### Returns

```typescript
{
  address: string | null;           // Wallet address (base58)
  isConnected: boolean;             // Connection status
  isConnecting: boolean;            // Loading state during connection
  isSigning: boolean;               // Loading state during transaction signing
  error: Error | null;              // Last error that occurred
  connect: () => Promise<any>;      // Connect wallet with passkey
  disconnect: () => Promise<void>;  // Disconnect wallet
  resetWallet: () => void;          // Reset wallet state (for creating new wallet)
  signAndSendTransaction: (        // Sign and send a transaction
    instruction: TransactionInstruction | TransactionInstruction[]
  ) => Promise<string>;
  wallet: any;                      // Raw wallet object from underlying provider
}
```

## Advanced Usage

### Creating a New Wallet

```tsx
function NewWallet() {
  const { resetWallet, connect } = useSolanaPasskey();

  const createNewWallet = async () => {
    // Reset any existing wallet state
    resetWallet();

    // Connect will create a new passkey
    await connect();
  };

  return <button onClick={createNewWallet}>Create New Wallet</button>;
}
```

### Multiple Transactions

```tsx
import { Transaction } from '@solana/web3.js';

const { signAndSendTransaction } = useSolanaPasskey();

// Send multiple instructions in one transaction
const instructions = [
  SystemProgram.transfer({
    fromPubkey: new PublicKey(address!),
    toPubkey: new PublicKey('recipient1'),
    lamports: 0.1 * LAMPORTS_PER_SOL,
  }),
  SystemProgram.transfer({
    fromPubkey: new PublicKey(address!),
    toPubkey: new PublicKey('recipient2'),
    lamports: 0.1 * LAMPORTS_PER_SOL,
  }),
];

await signAndSendTransaction(instructions);
```

## Environment Setup

### Development

For local development, you'll need to run a portal service. See the [@zerolync/portal](../../services/portal) package for setup instructions.

### Environment Variables

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=http://localhost:5173
NEXT_PUBLIC_PAYMASTER_URL=https://your-paymaster.com  # optional
```

## Cross-Chain Usage

The same passkey can be used across multiple chains. Combine with `@zerolync/passkey-sui`:

```tsx
import { SolanaPasskeyProvider } from '@zerolync/passkey-solana';
import { SuiPasskeyProvider } from '@zerolync/passkey-sui';

function App() {
  return (
    <SolanaPasskeyProvider rpcUrl="..." portalUrl="...">
      <SuiPasskeyProvider network="devnet" portalUrl="...">
        <YourApp />
      </SuiPasskeyProvider>
    </SolanaPasskeyProvider>
  );
}
```

## Related Packages

- [@zerolync/passkey-core](../core) - Core utilities and types
- [@zerolync/passkey-sui](../sui) - Sui passkey authentication

## License

MIT
