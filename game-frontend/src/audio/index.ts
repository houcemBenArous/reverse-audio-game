/**
 * Public API of the audio module.
 * Import audio engine functions from here, not from individual files.
 */

export { reverseAudioBuffer, decodeAudioBlob, validateAudioBuffer } from './reversal';
export { createRecorder, MAX_RECORDING_SECONDS, MIN_RECORDING_SECONDS } from './recorder';
export { createPlayer } from './player';
export type { Player, PlaybackStateChangeCallback } from './player';
export {
  getAudioContext,
  ensureAudioContextRunning,
  closeAudioContext,
  isWebAudioSupported,
} from './audioContext';
export { getSupportedMimeType, isRecordingSupported, resetMimeTypeCache } from './mimeType';
