export interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
}

export interface WalletInfo {
  solana?: {
    address: string;
    credentialId: string;
  };
  sui?: {
    address: string;
    credentialId: string;
  };
  passkey: PasskeyCredential;
}

export type Chain = 'solana' | 'sui';
