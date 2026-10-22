/**
 * Represents the processing state of a single audio operation.
 */
export type AudioProcessingState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'processing'
  | 'ready'
  | 'error';

/**
 * Represents the playback state of an audio player.
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended' | 'error';

/**
 * A decoded audio asset ready for playback or processing.
 */
export interface AudioAsset {
  /** The decoded PCM buffer. */
  readonly buffer: AudioBuffer;
  /** The source blob used to create this asset (kept for re-decoding if needed). */
  readonly blob: Blob;
  /** Human-readable duration in seconds. */
  readonly durationSeconds: number;
}

/**
 * The four distinct audio slots maintained during a game session.
 * Each slot is independent and must never overwrite another.
 */
export interface GameAudioAssets {
  /** Player 1's original recording. Immutable once set. */
  originalRecording: AudioAsset | null;
  /** Time-reversed version of originalRecording. */
  reversedOriginal: AudioAsset | null;
  /** Player 2's imitation recording. */
  imitationRecording: AudioAsset | null;
  /** Time-reversed version of imitationRecording. */
  reversedImitation: AudioAsset | null;
}

/**
 * Result of a recording operation.
 */
export interface RecordingResult {
  readonly blob: Blob;
  readonly durationSeconds: number;
}

/**
 * Structured error from an audio operation.
 */
export interface AudioError {
  readonly code:
    | 'PERMISSION_DENIED'
    | 'DEVICE_NOT_FOUND'
    | 'RECORDING_TOO_SHORT'
    | 'RECORDING_TOO_LONG'
    | 'DECODE_FAILED'
    | 'PLAYBACK_FAILED'
    | 'NOT_SUPPORTED'
    | 'UNKNOWN';
  readonly message: string;
  readonly userMessage: string;
}
