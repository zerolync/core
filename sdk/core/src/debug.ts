/**
 * Debug logging utility for Zerolync SDK
 * Set window.__ZEROLYNC_DEBUG__ = true to enable debug logs in production
 */

let debugEnabled = false;

if (typeof window !== 'undefined') {
  debugEnabled = !!(window as any).__ZEROLYNC_DEBUG__;
}

/**
 * Enable or disable debug logging
 * @param enabled - Whether to enable debug logging
 */
export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
  if (typeof window !== 'undefined') {
    (window as any).__ZEROLYNC_DEBUG__ = enabled;
  }
}

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Log a debug message (only in debug mode)
 */
export function debugLog(...args: any[]): void {
  if (debugEnabled) {
    console.log('[Zerolync]', ...args);
  }
}

/**
 * Log an error message (always logged)
 */
export function errorLog(...args: any[]): void {
  console.error('[Zerolync Error]', ...args);
}

/**
 * Log a warning message (always logged)
 */
export function warnLog(...args: any[]): void {
  console.warn('[Zerolync Warning]', ...args);
}
