/**
 * useRecorder.ts
 *
 * React hook that wraps the audio recorder.
 * Exposes start/stop controls and recording state to components.
 */

import { useState, useRef, useCallback } from 'react';
import type { AudioProcessingState, AudioError, RecordingResult } from '@types-app/audio';
import { createRecorder } from '@audio/recorder';

export interface UseRecorderReturn {
  state: AudioProcessingState;
  error: AudioError | null;
  /** Duration of the most recently completed recording in seconds. */
  lastDuration: number | null;
  /** Start recording. Resolves once the recorder is active. */
  startRecording: () => Promise<void>;
  /** Stop recording. Resolves with the result once the Blob is ready. */
  stopRecording: () => Promise<RecordingResult | null>;
  /** Clear the current error and go back to idle. */
  clearError: () => void;
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<AudioProcessingState>('idle');
  const [error, setError] = useState<AudioError | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  // Holds the stop function returned by recorder.start()
  const stopFnRef = useRef<(() => Promise<RecordingResult>) | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    if (state === 'recording') return;

    setState('requesting');
    setError(null);

    try {
      const recorder = createRecorder();
      const stopFn = await recorder.start();
      stopFnRef.current = stopFn;
      setState('recording');
    } catch (err) {
      setError(err as AudioError);
      setState('error');
    }
  }, [state]);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (state !== 'recording' || !stopFnRef.current) return null;

    setState('processing');

    try {
      const result = await stopFnRef.current();
      stopFnRef.current = null;
      setLastDuration(result.durationSeconds);
      setState('ready');
      return result;
    } catch (err) {
      setError(err as AudioError);
      setState('error');
      stopFnRef.current = null;
      return null;
    }
  }, [state]);

  const clearError = useCallback((): void => {
    setError(null);
    setState('idle');
  }, []);

  return { state, error, lastDuration, startRecording, stopRecording, clearError };
}
