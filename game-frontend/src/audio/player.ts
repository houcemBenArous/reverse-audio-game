/**
 * player.ts
 *
 * Manages playback of a single AudioBuffer at a time.
 * Prevents overlapping playback by stopping the current source before starting a new one.
 *
 * Pause/resume is implemented by tracking elapsed offset time and recreating the
 * AudioBufferSourceNode from that offset, since Web Audio API source nodes cannot
 * be paused natively.
 */

import type { PlaybackState } from '@types-app/audio';
import { ensureAudioContextRunning, getAudioContext } from './audioContext';

export type PlaybackStateChangeCallback = (state: PlaybackState) => void;

export interface Player {
  /** Plays the given AudioBuffer from the beginning (or from offset if provided). */
  play: (buffer: AudioBuffer) => Promise<void>;
  /** Pauses playback at the current position. No-op if not playing. */
  pause: () => void;
  /** Resumes from the paused position. No-op if not paused. */
  resume: (buffer: AudioBuffer) => Promise<void>;
  /** Stops playback and resets position to 0. */
  stop: () => void;
  /** Returns the current playback state. */
  getState: () => PlaybackState;
  /** Releases all resources held by this player. */
  dispose: () => void;
}

/**
 * Creates a stateful Player instance.
 * One Player instance should be shared for the entire game session to prevent
 * simultaneous playback from different call sites.
 *
 * @param onStateChange - Optional callback fired whenever the playback state changes.
 */
export function createPlayer(onStateChange?: PlaybackStateChangeCallback): Player {
  let sourceNode: AudioBufferSourceNode | null = null;
  let state: PlaybackState = 'idle';
  let startedAt = 0;        // AudioContext time when current playback started
  let pausedOffset = 0;     // How many seconds into the buffer we are when paused

  function setState(next: PlaybackState): void {
    state = next;
    onStateChange?.(next);
  }

  function stopCurrentSource(): void {
    if (sourceNode) {
      try {
        sourceNode.onended = null;
        sourceNode.stop();
        sourceNode.disconnect();
      } catch {
        // Source may already be stopped; ignore.
      }
      sourceNode = null;
    }
  }

  async function startFrom(buffer: AudioBuffer, offsetSeconds: number): Promise<void> {
    stopCurrentSource();
    await ensureAudioContextRunning();

    const ctx = getAudioContext();
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(ctx.destination);

    node.onended = () => {
      // Only transition to 'ended' if we are still playing (not manually stopped).
      if (state === 'playing') {
        pausedOffset = 0;
        setState('ended');
      }
    };

    const clampedOffset = Math.min(Math.max(offsetSeconds, 0), buffer.duration);
    node.start(0, clampedOffset);
    startedAt = ctx.currentTime - clampedOffset;
    sourceNode = node;
    setState('playing');
  }

  return {
    async play(buffer: AudioBuffer): Promise<void> {
      pausedOffset = 0;
      await startFrom(buffer, 0);
    },

    pause(): void {
      if (state !== 'playing' || !sourceNode) return;

      const ctx = getAudioContext();
      // Calculate how far into the buffer we are
      pausedOffset = ctx.currentTime - startedAt;
      stopCurrentSource();
      setState('paused');
    },

    async resume(buffer: AudioBuffer): Promise<void> {
      if (state !== 'paused') return;
      await startFrom(buffer, pausedOffset);
    },

    stop(): void {
      stopCurrentSource();
      pausedOffset = 0;
      setState('idle');
    },

    getState(): PlaybackState {
      return state;
    },

    dispose(): void {
      stopCurrentSource();
      pausedOffset = 0;
      state = 'idle';
    },
  };
}
