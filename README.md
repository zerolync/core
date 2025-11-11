# Zerolync Passkey SDK

**One Passkey, Multiple Chains** - Cross-chain passkey authentication for Web3.

Build passwordless blockchain applications using WebAuthn passkeys. Users authenticate with biometrics (Face ID, Touch ID, Windows Hello) instead of managing seed phrases.

## Features

- **Passwordless**: No seed phrases, no private keys to manage
- **Cross-Chain**: Single passkey works across Solana, Sui, and more
- **Secure**: Hardware-backed WebAuthn standard
- **Developer-Friendly**: Simple React hooks, TypeScript support
- **Portal-Based**: Custom signing UI with full UX control
- **Lightweight**: Minimal dependencies, tree-shakeable

## Packages

This monorepo contains the following packages:

### SDKs

| Package | Version | Description |
|---------|---------|-------------|
| [@zero-lync/passkey-core](./sdk/core) | 0.1.0 | Core utilities and types |
| [@zero-lync/passkey-solana](./sdk/solana) | 0.1.0 | Solana passkey authentication |
| [@zero-lync/passkey-sui](./sdk/sui) | 0.1.0 | Sui passkey authentication |

### Services

| Package | Description |
|---------|-------------|
| [Portal](./services/portal) | Signing portal service with custom UI |

### Apps

| App | Description |
|-----|-------------|
| [Demo](./apps/demo) | Cross-chain wallet demo application |

## Quick Start

### Installation

```bash
# Install Solana SDK
npm install @zero-lync/passkey-solana @solana/web3.js

# Install Sui SDK
npm install @zero-lync/passkey-sui @mysten/sui

# Or install both for cross-chain support
npm install @zero-lync/passkey-solana @zero-lync/passkey-sui @solana/web3.js @mysten/sui
```

### Basic Usage

#### Solana Wallet

```tsx
import { SolanaPasskeyProvider, useSolanaPasskey } from '@zero-lync/passkey-solana';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

function App() {
  return (
    <SolanaPasskeyProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://your-portal-url.com"
    >
      <Wallet />
    </SolanaPasskeyProvider>
  );
}

function Wallet() {
  const { address, connect, signAndSendTransaction } = useSolanaPasskey();

  const handleTransfer = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(address!),
      toPubkey: new PublicKey('recipient-address'),
      lamports: 0.1 * LAMPORTS_PER_SOL,
    });

    await (instruction);
  };

  return (
    <div>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Address: {address}</p>
          <button onClick={handleTransfer}>Send 0.1 SOL</button>
        </>
      )}
    </div>
  );
}
```

#### Sui Wallet

```tsx
import { SuiPasskeyProvider, useSuiPasskey } from '@zero-lync/passkey-sui';
import { Transaction } from '@mysten/sui/transactions';

function App() {
  return (
    <SuiPasskeyProvider
      network="devnet"
      portalUrl="https://your-portal-url.com"
    >
      <Wallet />
    </SuiPasskeyProvider>
  );
}

function Wallet() {
  const { address, connect, signAndExecuteTransaction } = useSuiPasskey();

  const handleTransfer = async () => {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [0.1 * 1e9]);
    tx.transferObjects([coin], 'recipient-address');

    await signAndExecuteTransaction(tx);
  };

  return (
    <div>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Address: {address}</p>
          <button onClick={handleTransfer}>Send 0.1 SUI</button>
        </>
      )}
    </div>
  );
}
```

#### Cross-Chain Wallet

```tsx
import { SolanaPasskeyProvider, useSolanaPasskey } from '@zero-lync/passkey-solana';
import { SuiPasskeyProvider, useSuiPasskey } from '@zero-lync/passkey-sui';

function App() {
  return (
    <SolanaPasskeyProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://your-portal-url.com"
    >
      <SuiPasskeyProvider
        network="devnet"
        portalUrl="https://your-portal-url.com"
      >
        <CrossChainWallet />
      </SuiPasskeyProvider>
    </SolanaPasskeyProvider>
  );
}

function CrossChainWallet() {
  const solana = useSolanaPasskey();
  const sui = useSuiPasskey();

  const connectBoth = async () => {
    // Connect to Solana first (creates passkey)
    await solana.connect();

    // Connect to Sui (reuses same passkey)
    await sui.connect();
  };

  return (
    <div>
      <button onClick={connectBoth}>Connect to Both Chains</button>
      {solana.address && <p>Solana: {solana.address}</p>}
      {sui.address && <p>Sui: {sui.address}</p>}
    </div>
  );
}
```

## Documentation

- [Core SDK Documentation](./sdk/core/README.md)
- [Solana SDK Documentation](./sdk/solana/README.md)
- [Sui SDK Documentation](./sdk/sui/README.md)

## Development

This project uses pnpm workspaces for monorepo management.

### Prerequisites

- Node.js >= 20
- pnpm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/zerolync/zerolync-passkey-sdk.git
cd zerolync-passkey-sdk

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run demo app
pnpm dev
```

### Project Structure

```
zerolync-passkey-sdk/
├── sdk/                    # SDK packages
│   ├── core/              # Core utilities
│   ├── solana/            # Solana SDK
│   └── sui/               # Sui SDK
├── services/              # Backend services
│   └── portal/            # Signing portal
├── apps/                  # Applications
│   └── demo/              # Demo app
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace configuration
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @zero-lync/passkey-solana build

# Watch mode for development
pnpm --filter @zero-lync/passkey-solana dev
```

### Running the Demo

The demo app showcases cross-chain wallet functionality:

```bash
# Development mode (HTTP)
pnpm dev

# Development mode (HTTPS)
pnpm --filter demo dev:https
```

Visit [http://localhost:3000](http://localhost:3000)

### Running the Portal Service

The portal service provides the signing interface:

```bash
cd services/portal
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Publishing

The SDKs are published to npm under the `@zero-lync` scope.

### Publishing a Package

```bash
# From the package directory
cd sdk/solana
pnpm publish

# Or from root
pnpm --filter @zero-lync/passkey-solana publish
```

The `prepublishOnly` script will automatically build the package before publishing.

### Version Management

Update versions in the respective `package.json` files before publishing. We follow semantic versioning:

- **Patch** (0.1.x): Bug fixes
- **Minor** (0.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## Environment Variables

### Demo App

Create a `.env.local` file in `apps/demo/`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_PORTAL_URL=http://localhost:5173
NEXT_PUBLIC_PAYMASTER_URL=https://your-paymaster.com  # optional
```

### Portal Service

Create a `.env` file in `services/portal/` if needed for custom configuration.

## How It Works

1. **Passkey Creation**: When a user connects for the first time, a WebAuthn passkey is created using their device's biometric authentication
2. **Keypair Derivation**: The passkey's public key is used to derive blockchain-specific keypairs (Solana, Sui, etc.)
3. **Address Generation**: Each blockchain address is generated from its respective keypair
4. **Signing**: Transactions are signed using the WebAuthn credential through the portal interface
5. **Cross-Chain**: The same passkey can be reused across different blockchains

## Security

- **Hardware-Backed**: Passkeys are stored in secure hardware (TPM, Secure Enclave)
- **No Seed Phrases**: Private keys never leave the device
- **WebAuthn Standard**: Uses the W3C WebAuthn specification
- **Origin-Bound**: Passkeys are bound to your domain for phishing protection

## Browser Support

- ✅ Chrome/Edge 67+
- ✅ Safari 16+
- ✅ Firefox 60+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](./LICENSE) for details

## Links

- [Website](https://zerolync.com)
- [Documentation](https://docs.zerolync.com)
- [GitHub](https://github.com/zerolync/zerolync-passkey-sdk)
- [npm](https://www.npmjs.com/org/zerolync)

## Support

- GitHub Issues: [Report a bug](https://github.com/zerolync/zerolync-passkey-sdk/issues)
- Discord: [Join our community](https://discord.gg/zerolync)
- Twitter: [@zerolync](https://twitter.com/zerolync)

---

Made with ❤️ by the Zerolync team
