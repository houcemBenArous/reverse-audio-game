/**
 * audioContext.ts
 *
 * Manages a single shared AudioContext for the application lifetime.
 * Safari requires AudioContext to be created after a user gesture, so we
 * create it lazily on first use and resume it if suspended.
 */

let sharedContext: AudioContext | null = null;

/**
 * Returns the shared AudioContext, creating it if necessary.
 * Must be called from within a user-gesture handler on Safari.
 *
 * @throws {Error} if the Web Audio API is not supported
 */
export function getAudioContext(): AudioContext {
  if (!window.AudioContext) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContext();
  }

  return sharedContext;
}

/**
 * Resumes the AudioContext if it is suspended.
 * Required on Safari, where the context starts suspended until a user gesture.
 */
export async function ensureAudioContextRunning(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Closes and releases the shared AudioContext.
 * Call this when the game session ends or the application unmounts.
 */
export async function closeAudioContext(): Promise<void> {
  if (sharedContext && sharedContext.state !== 'closed') {
    await sharedContext.close();
    sharedContext = null;
  }
}

/**
 * Returns true if the Web Audio API is available in this browser.
 */
export function isWebAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window;
}
