/**
 * usePWAInstall.ts
 *
 * Captures the browser's native PWA install prompt and exposes a simple
 * install() function that triggers it.
 *
 * The prompt is only available when:
 *   1. The app is served over HTTPS (or localhost).
 *   2. A service worker is registered.
 *   3. The user has not already installed the app.
 *   4. The browser supports the beforeinstallprompt event (Chrome/Edge/Android).
 *
 * Safari on iOS does NOT fire beforeinstallprompt — it shows a manual
 * "Add to Home Screen" option in the Share sheet instead.
 * We detect this case and show a separate instruction banner.
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export type InstallState =
  | 'unavailable'   // Browser doesn't support, or already installed
  | 'ready'         // Install prompt is available — show the button
  | 'ios-manual'    // iOS Safari — show manual "Add to Home Screen" instructions
  | 'installed';    // User just accepted the install

export interface UsePWAInstallReturn {
  installState: InstallState;
  install: () => Promise<void>;
  dismissIOSBanner: () => void;
}

/** Returns true if the app is already running in standalone mode. */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

/** Returns true if the current browser is Safari on iOS. */
function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/CriOS/.test(ua);
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>('unavailable');

  useEffect(() => {
    // Already installed — nothing to show
    if (isStandalone()) {
      setInstallState('installed');
      return;
    }

    // iOS Safari — can't use beforeinstallprompt, show manual instructions
    if (isIOSSafari()) {
      setInstallState('ios-manual');
      return;
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing automatically on mobile
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setInstallState('ready');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // When the app gets installed (e.g., from the browser menu)
    window.addEventListener('appinstalled', () => {
      setInstallState('installed');
      setPromptEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = useCallback(async (): Promise<void> => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      setInstallState('installed');
    }
    // Whether accepted or dismissed, the prompt can only be shown once
    setPromptEvent(null);
  }, [promptEvent]);

  const dismissIOSBanner = useCallback((): void => {
    setInstallState('unavailable');
  }, []);

  return { installState, install, dismissIOSBanner };
}
