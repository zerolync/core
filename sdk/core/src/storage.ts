import { WalletInfo } from './types';

const STORAGE_KEY = 'zerolync-wallet';

export class PasskeyStorage {
  static saveWallet(wallet: WalletInfo): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }

  static getWallet(): WalletInfo | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  static clearWallet(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
