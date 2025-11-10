/**
 * WebAuthn/Passkey credential information
 *
 * @remarks
 * This interface represents the core passkey credential used for authentication
 * across all supported chains.
 */
export interface PasskeyCredential {
  /** The unique credential ID from WebAuthn */
  credentialId: string;
  /** Base64-encoded public key */
  publicKey: string;
}

/**
 * Cross-chain wallet information
 *
 * @remarks
 * This interface stores wallet addresses and credentials for multiple blockchain networks.
 * Each chain (Solana, Sui) has its own optional wallet configuration, allowing for
 * multi-chain support with a single passkey.
 *
 * @example
 * ```typescript
 * const walletInfo: WalletInfo = {
 *   passkey: {
 *     credentialId: 'abc123...',
 *     publicKey: 'base64encodedkey...'
 *   },
 *   solana: {
 *     address: 'FYz8w...',
 *     credentialId: 'abc123...'
 *   },
 *   sui: {
 *     address: '0x123...',
 *     credentialId: 'abc123...'
 *   }
 * };
 * ```
 */
export interface WalletInfo {
  /** Solana wallet configuration (optional) */
  solana?: {
    /** Solana wallet address */
    address: string;
    /** Credential ID associated with this wallet */
    credentialId: string;
  };
  /** Sui wallet configuration (optional) */
  sui?: {
    /** Sui wallet address */
    address: string;
    /** Credential ID associated with this wallet */
    credentialId: string;
  };
  /** Core passkey credential (required) */
  passkey: PasskeyCredential;
}

/**
 * Supported blockchain networks
 */
export type Chain = 'solana' | 'sui';
