const LAZOR_STORAGE_KEYS = [
  'lazorkit-wallet',
  'lazorkit-credentials',
  'PUBLIC_KEY',
  'CREDENTIAL_ID',
  'SMART_WALLET_ADDRESS',
  'lazorkit-wallet-store',
  'lazorkit-config',
];

export function clearLazorKitStorage() {
  if (typeof window === 'undefined') return;

  LAZOR_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear storage key:', key, e);
    }
  });
}

export function hasLazorKitWallet(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem('lazorkit-wallet') !== null;
  } catch (e) {
    return false;
  }
}
