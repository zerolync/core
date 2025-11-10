import { WalletInfo } from './types';
import { errorLog } from './debug';

const STORAGE_KEY = 'zerolync-wallet';

/**
 * Storage utility for managing wallet information in localStorage
 *
 * @remarks
 * This class provides a centralized way to persist wallet data across sessions.
 * All methods are safe to call in SSR environments (they no-op when window is undefined).
 *
 * @example
 * ```typescript
 * // Save wallet info
 * PasskeyStorage.saveWallet({
 *   solana: { address: '...', credentialId: '...' },
 *   passkey: { credentialId: '...', publicKey: '...' }
 * });
 *
 * // Retrieve wallet info
 * const wallet = PasskeyStorage.getWallet();
 *
 * // Clear wallet
 * PasskeyStorage.clearWallet();
 * ```
 */
export class PasskeyStorage {
  /**
   * Save wallet information to localStorage
   *
   * @param wallet - The wallet information to store
   *
   * @remarks
   * This method serializes the wallet object to JSON and stores it in localStorage.
   * Safe to call in SSR environments (no-ops when window is undefined).
   */
  static saveWallet(wallet: WalletInfo): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }

  /**
   * Retrieve wallet information from localStorage
   *
   * @returns The stored wallet information, or null if not found or corrupted
   *
   * @remarks
   * If the stored data is corrupted (invalid JSON), this method will:
   * 1. Log an error
   * 2. Clear the corrupted data
   * 3. Return null
   *
   * Safe to call in SSR environments (returns null when window is undefined).
   */
  static getWallet(): WalletInfo | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      errorLog('Failed to parse wallet data from storage:', err);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /**
   * Clear wallet information from localStorage
   *
   * @remarks
   * This removes all stored wallet data. Users will need to reconnect their wallet.
   * Safe to call in SSR environments (no-ops when window is undefined).
   */
  static clearWallet(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
