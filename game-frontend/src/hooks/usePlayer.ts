/**
 * usePlayer.ts
 *
 * React hook that provides audio playback controls for a single AudioBuffer.
 * Wraps the Player audio engine and keeps React state in sync.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { PlaybackState } from '@types-app/audio';
import { createPlayer } from '@audio/player';
import type { Player } from '@audio/player';

export interface UsePlayerReturn {
  playbackState: PlaybackState;
  play: (buffer: AudioBuffer) => Promise<void>;
  pause: () => void;
  resume: (buffer: AudioBuffer) => Promise<void>;
  stop: () => void;
}

/**
 * Creates and manages a shared Player instance.
 * The player is disposed on unmount.
 */
export function usePlayer(): UsePlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const playerRef = useRef<Player | null>(null);

  // Create the player once
  if (!playerRef.current) {
    playerRef.current = createPlayer((newState) => {
      setPlaybackState(newState);
    });
  }

  // Dispose on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  const play = useCallback(async (buffer: AudioBuffer): Promise<void> => {
    await playerRef.current?.play(buffer);
  }, []);

  const pause = useCallback((): void => {
    playerRef.current?.pause();
  }, []);

  const resume = useCallback(async (buffer: AudioBuffer): Promise<void> => {
    await playerRef.current?.resume(buffer);
  }, []);

  const stop = useCallback((): void => {
    playerRef.current?.stop();
  }, []);

  return { playbackState, play, pause, resume, stop };
}
