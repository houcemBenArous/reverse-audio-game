/**
 * useGame.ts
 *
 * Central React hook that orchestrates the entire game session.
 * Connects game state transitions, audio recording, decoding, reversal and playback.
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
  /** True while an audio operation (decode/reverse) is in progress. */
  isProcessing: boolean;
  /** The current audio error, if any. */
  audioError: AudioError | null;
  /** True if microphone recording is currently active. */
  isRecording: boolean;
  /** True if audio is currently playing. */
  isPlaying: boolean;
  /** Browser compatibility issues detected on startup. */
  compatibilityError: string | null;

  /**
   * Phase 1 confirmation state.
   * After Player 1 stops recording, the recording is held here for preview
   * before being confirmed. Null means no pending recording.
   */
  pendingP1Asset: AudioAsset | null;
  /**
   * Phase 3 confirmation state — same pattern for Player 2's imitation.
   */
  pendingP2Asset: AudioAsset | null;

  // --- Actions ---
  onStartGame: () => void;

  /** Phase 1: record */
  onStartRecordingP1: () => Promise<void>;
  /** Phase 1: stop mic — moves recording into pendingP1Asset for preview */
  onStopRecordingP1: () => Promise<void>;
  /** Phase 1: listen to the pending recording before confirming */
  onListenPendingP1: () => Promise<void>;
  /** Phase 1: discard pending recording and re-record */
  onRetakeRecordingP1: () => void;
  /** Phase 1: accept pending recording, reverse it, advance to phase 2 */
  onConfirmRecordingP1: () => Promise<void>;

  /** Phase 2: listen reversed */
  onListenReversed: () => Promise<void>;
  onStopListening: () => void;
  onReadyToImitate: () => void;

  /** Phase 3: record imitation */
  onStartRecordingP2: () => Promise<void>;
  /** Phase 3: stop mic — moves imitation into pendingP2Asset for preview */
  onStopRecordingP2: () => Promise<void>;
  /** Phase 3: listen to the pending imitation before confirming */
  onListenPendingP2: () => Promise<void>;
  /** Phase 3: discard pending imitation and re-record */
  onRetakeRecordingP2: () => void;
  /** Phase 3: accept pending imitation, reverse it, advance to phase 4 */
  onConfirmRecordingP2: () => Promise<void>;

  /** Phase 4 */
  onListenResult: () => Promise<void>;
  onStopResult: () => void;
  onGoToResultScreen: () => void;

  /** Result screen */
  onRevealSecret: () => void;
  onListenOriginal: () => Promise<void>;
  onNewGame: () => void;
  onClearError: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
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

  // Pending recordings waiting for player confirmation before advancing
  const [pendingP1Asset, setPendingP1Asset] = useState<AudioAsset | null>(null);
  const [pendingP2Asset, setPendingP2Asset] = useState<AudioAsset | null>(null);

  const stopRecordingRef = useRef<(() => Promise<{ blob: Blob; durationSeconds: number }>) | null>(null);
  const playerRef = useRef<Player | null>(null);

  // Check browser compatibility on mount
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

  const clearAllAssets = useCallback(() => {
    setAudioAssets(emptyAssets);
    setPendingP1Asset(null);
    setPendingP2Asset(null);
  }, []);

  const stopPlayback = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);
  }, []);

  async function blobToAsset(blob: Blob, durationSeconds: number): Promise<AudioAsset> {
    const ctx = getAudioContext();
    const buffer = await decodeAudioBlob(blob, ctx);
    validateAudioBuffer(buffer);
    return { buffer, blob, durationSeconds };
  }

  async function buildReversedAsset(source: AudioAsset): Promise<AudioAsset> {
    const ctx = getAudioContext();
    const reversedBuffer = reverseAudioBuffer(source.buffer, ctx);
    return {
      buffer: reversedBuffer,
      blob: source.blob,
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

  // --- Phase 1 ---

  const onStartRecordingP1 = useCallback(async () => {
    setAudioError(null);
    stopPlayback();
    // Discard any previous pending recording when starting fresh
    setPendingP1Asset(null);
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
      // Decode the blob so the player can preview it — but do NOT advance yet
      const asset = await blobToAsset(result.blob, result.durationSeconds);
      setPendingP1Asset(asset);
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onListenPendingP1 = useCallback(async () => {
    if (!pendingP1Asset) return;
    stopPlayback();
    await playerRef.current?.play(pendingP1Asset.buffer);
  }, [pendingP1Asset, stopPlayback]);

  const onRetakeRecordingP1 = useCallback(() => {
    // Discard the pending recording — player goes back to the record button
    stopPlayback();
    setPendingP1Asset(null);
    setAudioError(null);
  }, [stopPlayback]);

  const onConfirmRecordingP1 = useCallback(async () => {
    if (!pendingP1Asset) return;
    stopPlayback();
    setIsProcessing(true);
    try {
      // Commit to the main asset slots and compute the reversal
      setAudioAssets((prev) => ({ ...prev, originalRecording: pendingP1Asset }));
      const reversed = await buildReversedAsset(pendingP1Asset);
      setAudioAssets((prev) => ({ ...prev, reversedOriginal: reversed }));
      setPendingP1Asset(null);
      setGameState((s) => advanceToPhase2(s));
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, [pendingP1Asset, stopPlayback]);

  // --- Phase 2 ---

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

  // --- Phase 3 ---

  const onStartRecordingP2 = useCallback(async () => {
    setAudioError(null);
    stopPlayback();
    setPendingP2Asset(null);
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
      // Hold in pending — do NOT advance yet
      setPendingP2Asset(asset);
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onListenPendingP2 = useCallback(async () => {
    if (!pendingP2Asset) return;
    stopPlayback();
    await playerRef.current?.play(pendingP2Asset.buffer);
  }, [pendingP2Asset, stopPlayback]);

  const onRetakeRecordingP2 = useCallback(() => {
    stopPlayback();
    setPendingP2Asset(null);
    setAudioError(null);
  }, [stopPlayback]);

  const onConfirmRecordingP2 = useCallback(async () => {
    if (!pendingP2Asset) return;
    stopPlayback();
    setIsProcessing(true);
    try {
      setAudioAssets((prev) => ({ ...prev, imitationRecording: pendingP2Asset }));
      const reversed = await buildReversedAsset(pendingP2Asset);
      setAudioAssets((prev) => ({ ...prev, reversedImitation: reversed }));
      setPendingP2Asset(null);
      setGameState((s) => advanceToPhase4(s));
    } catch (err) {
      setAudioError(err as AudioError);
    } finally {
      setIsProcessing(false);
    }
  }, [pendingP2Asset, stopPlayback]);

  // --- Phase 4 ---

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

  // --- Result ---

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
    pendingP1Asset,
    pendingP2Asset,
    onStartGame,
    onStartRecordingP1,
    onStopRecordingP1,
    onListenPendingP1,
    onRetakeRecordingP1,
    onConfirmRecordingP1,
    onListenReversed,
    onStopListening,
    onReadyToImitate,
    onStartRecordingP2,
    onStopRecordingP2,
    onListenPendingP2,
    onRetakeRecordingP2,
    onConfirmRecordingP2,
    onListenResult,
    onStopResult,
    onGoToResultScreen,
    onRevealSecret,
    onListenOriginal,
    onNewGame,
    onClearError,
  };
}
