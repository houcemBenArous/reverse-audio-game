/**
 * useGame.ts
 *
 * Central React hook that orchestrates the entire game session.
 * Connects game state transitions, audio recording, decoding, reversal and playback.
 *
 * Components should consume this hook via GameContext (see App.tsx).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState } from '@types-app/game';
import type { GameAudioAssets, AudioError, AudioAsset } from '@types-app/audio';
import {
  createInitialGameState,
  startGame,
  advanceToPhase2,
  incrementListenCount,
  advanceToPhase3,
  advanceToPhase4,
  advanceToResult,
  revealSecret,
  resetGame,
} from '@game/gameState';
import {
  getAudioContext,
  closeAudioContext,
  reverseAudioBuffer,
  decodeAudioBlob,
  validateAudioBuffer,
  isWebAudioSupported,
  isRecordingSupported,
} from '@audio/index';
import { createRecorder } from '@audio/recorder';
import { createPlayer } from '@audio/player';
import type { Player } from '@audio/player';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseGameReturn {
  gameState: GameState;
  audioAssets: GameAudioAssets;
  /** True while an audio operation (decode/reverse/playback) is in progress. */
  isProcessing: boolean;
  /** The current audio error, if any. */
  audioError: AudioError | null;
  /** True if recording is currently active. */
  isRecording: boolean;
  /** True if audio is currently playing. */
  isPlaying: boolean;
  /** Browser compatibility issues detected on startup. */
  compatibilityError: string | null;

  // --- Actions ---
  onStartGame: () => void;
  /** Phase 1: Player 1 starts/stops recording. */
  onStartRecordingP1: () => Promise<void>;
  onStopRecordingP1: () => Promise<void>;
  /** Phase 2: Player 2 listens to the reversed original. */
  onListenReversed: () => Promise<void>;
  onStopListening: () => void;
  onReadyToImitate: () => void;
  /** Phase 3: Player 2 starts/stops recording their imitation. */
  onStartRecordingP2: () => Promise<void>;
  onStopRecordingP2: () => Promise<void>;
  /** Phase 4: Listen to the reversed imitation. */
  onListenResult: () => Promise<void>;
  onStopResult: () => void;
  onGoToResultScreen: () => void;
  /** Result screen. */
  onRevealSecret: () => void;
  onListenOriginal: () => Promise<void>;
  onNewGame: () => void;
  onClearError: () => void;
}

// ---------------------------------------------------------------------------
// Empty assets
// ---------------------------------------------------------------------------

const emptyAssets: GameAudioAssets = {
  originalRecording: null,
  reversedOriginal: null,
  imitationRecording: null,
  reversedImitation: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [audioAssets, setAudioAssets] = useState<GameAudioAssets>(emptyAssets);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioError, setAudioError] = useState<AudioError | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);

  // Refs for audio engine resources
  const stopRecordingRef = useRef<(() => Promise<{ blob: Blob; durationSeconds: number }>) | null>(null);
  const playerRef = useRef<Player | null>(null);

  // Check browser compatibility once on mount
  useEffect(() => {
    if (!isWebAudioSupported()) {
      setCompatibilityError(
        "Votre navigateur ne supporte pas la Web Audio API. Veuillez utiliser Chrome, Firefox, Edge ou Safari récent.",
      );
    } else if (!isRecordingSupported()) {
      setCompatibilityError(
        "Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser Chrome, Firefox, Edge ou Safari récent.",
      );
    }
  }, []);

  // Create player once, dispose on unmount
  useEffect(() => {
    playerRef.current = createPlayer((s) => {
      setIsPlaying(s === 'playing');
    });
    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
      closeAudioContext();
    };
  }, []);

  // Helper: revoke all object URLs and clear assets
  const clearAllAssets = useCallback(() => {
    setAudioAssets(emptyAssets);
  }, []);

  // Helper: stop any active playback
  const stopPlayback = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);
  }, []);

  // Helper: decode a Blob into an AudioAsset
  async function blobToAsset(blob: Blob, durationSeconds: number): Promise<AudioAsset> {
    const ctx = getAudioContext();
    const buffer = await decodeAudioBlob(blob, ctx);
    validateAudioBuffer(buffer);
    return { buffer, blob, durationSeconds };
  }

  // Helper: build a reversed AudioAsset from an existing one
  async function buildReversedAsset(source: AudioAsset): Promise<AudioAsset> {
    const ctx = getAudioContext();
    const reversedBuffer = reverseAudioBuffer(source.buffer, ctx);
    // Create a placeholder blob (the reversed audio is stored as an AudioBuffer)
    return {
      buffer: reversedBuffer,
      blob: source.blob, // Keep source blob for reference; the reversed buffer is what matters
      durationSeconds: source.durationSeconds,
    };
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const onStartGame = useCallback(() => {
    stopPlayback();
    clearAllAssets();
    setAudioError(null);
    setGameState((s) => startGame(s));
  }, [stopPlayback, clearAllAssets]);

  const onStartRecordingP1 = useCallback(async () => {
    setAudioError(null);
    stopPlayback();
    try {
      const recorder = createRecorder();
      const stopFn = await recorder.start();
      stopRecordingRef.current = stopFn;
      setIsRecording(true);
    } catch (err) {
      setAudioError(err as AudioError);
    }
  }, [stopPlayback]);

  const onStopRecordingP1 = useCallback(async () => {
    if (!stopRecordingRef.current) return;
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const result = await stopRecordingRef.current();
      stopRecordingRef.current = null;
      const asset = await blobToAsset(result.blob, result.durationSeconds);
      setAudioAssets((prev) => ({ ...prev, originalRecording: asset }));
      // Pre-compute reversed original immediately
      const reversed = await buildReversedAsset(asset);
      setAudioAssets((prev) => ({ ...prev, reversedOriginal: reversed }));
      setGameState((s) => advanceToPhase2(s));
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onListenReversed = useCallback(async () => {
    const asset = audioAssets.reversedOriginal;
    if (!asset) return;
    stopPlayback();
    setGameState((s) => incrementListenCount(s));
    await playerRef.current?.play(asset.buffer);
  }, [audioAssets.reversedOriginal, stopPlayback]);

  const onStopListening = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const onReadyToImitate = useCallback(() => {
    stopPlayback();
    setGameState((s) => advanceToPhase3(s));
  }, [stopPlayback]);

  const onStartRecordingP2 = useCallback(async () => {
    setAudioError(null);
    stopPlayback();
    try {
      const recorder = createRecorder();
      const stopFn = await recorder.start();
      stopRecordingRef.current = stopFn;
      setIsRecording(true);
    } catch (err) {
      setAudioError(err as AudioError);
    }
  }, [stopPlayback]);

  const onStopRecordingP2 = useCallback(async () => {
    if (!stopRecordingRef.current) return;
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const result = await stopRecordingRef.current();
      stopRecordingRef.current = null;
      const asset = await blobToAsset(result.blob, result.durationSeconds);
      setAudioAssets((prev) => ({ ...prev, imitationRecording: asset }));
      // Pre-compute reversed imitation
      const reversed = await buildReversedAsset(asset);
      setAudioAssets((prev) => ({ ...prev, reversedImitation: reversed }));
      setGameState((s) => advanceToPhase4(s));
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onListenResult = useCallback(async () => {
    const asset = audioAssets.reversedImitation;
    if (!asset) return;
    stopPlayback();
    await playerRef.current?.play(asset.buffer);
  }, [audioAssets.reversedImitation, stopPlayback]);

  const onStopResult = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const onGoToResultScreen = useCallback(() => {
    stopPlayback();
    setGameState((s) => advanceToResult(s));
  }, [stopPlayback]);

  const onRevealSecret = useCallback(() => {
    setGameState((s) => revealSecret(s));
  }, []);

  const onListenOriginal = useCallback(async () => {
    const asset = audioAssets.originalRecording;
    if (!asset) return;
    stopPlayback();
    await playerRef.current?.play(asset.buffer);
  }, [audioAssets.originalRecording, stopPlayback]);

  const onNewGame = useCallback(() => {
    stopPlayback();
    clearAllAssets();
    setAudioError(null);
    setIsRecording(false);
    setIsProcessing(false);
    setGameState(resetGame());
  }, [stopPlayback, clearAllAssets]);

  const onClearError = useCallback(() => {
    setAudioError(null);
  }, []);

  return {
    gameState,
    audioAssets,
    isProcessing,
    audioError,
    isRecording,
    isPlaying,
    compatibilityError,
    onStartGame,
    onStartRecordingP1,
    onStopRecordingP1,
    onListenReversed,
    onStopListening,
    onReadyToImitate,
    onStartRecordingP2,
    onStopRecordingP2,
    onListenResult,
    onStopResult,
    onGoToResultScreen,
    onRevealSecret,
    onListenOriginal,
    onNewGame,
    onClearError,
  };
}
