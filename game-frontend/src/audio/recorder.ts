/**
 * recorder.ts
 *
 * Encapsulates microphone recording using the MediaRecorder API.
 * Manages the MediaStream lifecycle: releases microphone tracks as soon
 * as recording stops.
 */

import type { RecordingResult, AudioError } from '@types-app/audio';
import { getSupportedMimeType } from './mimeType';

/** Maximum recording duration in seconds. */
export const MAX_RECORDING_SECONDS = 15;

/** Minimum recording duration in seconds. */
export const MIN_RECORDING_SECONDS = 0.5;

/**
 * Maps a DOMException or generic error from getUserMedia into a typed AudioError.
 */
function mapGetUserMediaError(err: unknown): AudioError {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return {
        code: 'PERMISSION_DENIED',
        message: err.message,
        userMessage:
          "L'accès au microphone a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.",
      };
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        code: 'DEVICE_NOT_FOUND',
        message: err.message,
        userMessage:
          'Aucun microphone détecté. Vérifiez que votre microphone est connecté et réessayez.',
      };
    }
  }
  return {
    code: 'UNKNOWN',
    message: String(err),
    userMessage: "Impossible d'accéder au microphone. Veuillez réessayer.",
  };
}

/**
 * Records audio from the microphone for up to MAX_RECORDING_SECONDS.
 *
 * The returned RecordingResult includes the audio Blob and its duration.
 * The MediaStream is stopped immediately after recording ends.
 *
 * Usage:
 *   const recorder = createRecorder();
 *   const stopFn = await recorder.start();
 *   // ...user clicks stop...
 *   const result = await stopFn();
 *
 * @throws {AudioError} for permission or device errors
 */
export interface RecorderHandle {
  /**
   * Requests microphone access and starts recording.
   * Returns a stop function that, when called, stops recording and resolves
   * with the RecordingResult.
   */
  start: () => Promise<() => Promise<RecordingResult>>;
}

/**
 * Creates a recorder handle.
 */
export function createRecorder(): RecorderHandle {
  return {
    start: async () => {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (err) {
        throw mapGetUserMediaError(err);
      }

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      const startTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Collect data every 100 ms for better chunk granularity
      mediaRecorder.start(100);

      // Auto-stop after max duration
      const autoStopTimer = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, MAX_RECORDING_SECONDS * 1000);

      /**
       * Stops the recording and resolves with the result.
       * Safe to call multiple times — subsequent calls are no-ops.
       */
      const stop = (): Promise<RecordingResult> =>
        new Promise((resolve, reject) => {
          if (mediaRecorder.state === 'inactive') {
            // Already stopped (e.g., by the auto-stop timer)
            clearTimeout(autoStopTimer);
            const blob = new Blob(chunks, { type: mimeType });
            const durationSeconds = (Date.now() - startTime) / 1000;
            stopStreamTracks(stream);
            resolve({ blob, durationSeconds });
            return;
          }

          mediaRecorder.onstop = () => {
            clearTimeout(autoStopTimer);
            stopStreamTracks(stream);

            const durationSeconds = (Date.now() - startTime) / 1000;
            const blob = new Blob(chunks, { type: mimeType });

            if (durationSeconds < MIN_RECORDING_SECONDS) {
              const err: AudioError = {
                code: 'RECORDING_TOO_SHORT',
                message: `Duration ${durationSeconds}s is below minimum ${MIN_RECORDING_SECONDS}s`,
                userMessage: `L'enregistrement est trop court. Veuillez enregistrer au moins ${MIN_RECORDING_SECONDS} seconde.`,
              };
              reject(err);
              return;
            }

            resolve({ blob, durationSeconds });
          };

          mediaRecorder.onerror = (event) => {
            clearTimeout(autoStopTimer);
            stopStreamTracks(stream);
            const err: AudioError = {
              code: 'UNKNOWN',
              message: String(event),
              userMessage: "L'enregistrement a échoué. Veuillez réessayer.",
            };
            reject(err);
          };

          mediaRecorder.stop();
        });

      return stop;
    },
  };
}

/** Stops all tracks on a MediaStream, releasing the microphone. */
function stopStreamTracks(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
