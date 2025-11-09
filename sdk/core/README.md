# @zerolync/passkey-core

Core utilities and types for Zerolync Passkey SDK - cross-chain passkey authentication.

## Overview

This package provides the core functionality shared across all Zerolync passkey SDKs, including storage utilities, type definitions, and common interfaces for cross-chain passkey authentication.

## Features

- **Cross-chain storage**: Unified storage for passkey credentials across multiple blockchains
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Browser-based**: Works entirely in the browser using localStorage
- **Zero dependencies**: Lightweight package with no external dependencies

## Installation

```bash
npm install @zerolync/passkey-core
# or
pnpm add @zerolync/passkey-core
# or
yarn add @zerolync/passkey-core
```

## Usage

### PasskeyStorage

The `PasskeyStorage` utility provides methods to manage wallet information across chains:

```typescript
import { PasskeyStorage, type WalletInfo } from '@zerolync/passkey-core';

// Save wallet info
const walletInfo: WalletInfo = {
  solana: {
    address: '5xot9PAtQRTN...',
    credentialId: 'credential123'
  },
  sui: {
    address: '0x1234...',
    credentialId: 'credential123'
  },
  passkey: {
    credentialId: 'credential123',
    publicKey: 'base64-encoded-public-key'
  }
};

PasskeyStorage.saveWallet(walletInfo);

// Get wallet info
const wallet = PasskeyStorage.getWallet();

// Clear wallet info
PasskeyStorage.clearWallet();
```

## API Reference

### Types

#### `WalletInfo`

```typescript
interface WalletInfo {
  solana?: {
    address: string;
    credentialId: string;
  };
  sui?: {
    address: string;
    credentialId: string;
  };
  passkey?: {
    credentialId: string;
    publicKey: string;
  };
}
```

### PasskeyStorage

#### `saveWallet(wallet: WalletInfo): void`

Saves wallet information to localStorage.

#### `getWallet(): WalletInfo | null`

Retrieves wallet information from localStorage. Returns `null` if no wallet is stored.

#### `clearWallet(): void`

Removes wallet information from localStorage.

## Related Packages

- [@zerolync/passkey-solana](../solana) - Solana passkey authentication
- [@zerolync/passkey-sui](../sui) - Sui passkey authentication

## License

MIT
