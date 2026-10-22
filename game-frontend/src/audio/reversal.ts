/**
 * reversal.ts
 *
 * Pure audio-processing functions for time-reversing AudioBuffer data.
 *
 * Reversal means each sample at index i in the output equals the sample at
 * index (length - 1 - i) in the input. This is a pure temporal reversal with
 * no pitch shifting, filtering or other transformation.
 *
 * These functions are pure (no side effects) and testable without a browser.
 */

/**
 * Reverses an AudioBuffer in time.
 *
 * Creates a NEW AudioBuffer with the same sample rate, channel count and
 * length as the input. The input buffer is never modified.
 *
 * Invariant: reverseAudioBuffer(reverseAudioBuffer(buf)) ≈ buf
 * (identical sample values within floating-point precision)
 *
 * @param input - The source AudioBuffer to reverse
 * @param audioContext - The AudioContext used to create the output buffer
 * @returns A new AudioBuffer containing the time-reversed samples
 */
export function reverseAudioBuffer(
  input: AudioBuffer,
  audioContext: AudioContext,
): AudioBuffer {
  const { numberOfChannels, length, sampleRate } = input;

  const output = audioContext.createBuffer(numberOfChannels, length, sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = input.getChannelData(channel);
    const outputData = output.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      // Mirror-image index: sample at position i becomes sample at (length - 1 - i)
      outputData[i] = inputData[length - 1 - i];
    }
  }

  return output;
}

/**
 * Decodes a Blob of audio data into an AudioBuffer using the Web Audio API.
 *
 * @param blob - The audio Blob produced by MediaRecorder
 * @param audioContext - The AudioContext to use for decoding
 * @returns The decoded AudioBuffer
 * @throws {Error} with a user-friendly message if decoding fails
 */
export async function decodeAudioBlob(
  blob: Blob,
  audioContext: AudioContext,
): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();

  try {
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (cause) {
    throw new Error(
      `Failed to decode audio data. The recording may be empty or in an unsupported format. (${String(cause)})`,
    );
  }
}

/**
 * Validates that an AudioBuffer has a non-zero length and a positive sample rate.
 * Throws if the buffer is considered invalid.
 *
 * @param buffer - The buffer to validate
 * @param minDurationSeconds - Minimum accepted duration (default: 0.1 s)
 */
export function validateAudioBuffer(
  buffer: AudioBuffer,
  minDurationSeconds = 0.1,
): void {
  if (buffer.length === 0 || buffer.sampleRate <= 0) {
    throw new Error('Audio buffer is empty or has an invalid sample rate.');
  }

  const duration = buffer.length / buffer.sampleRate;
  if (duration < minDurationSeconds) {
    throw new Error(
      `Recording is too short (${duration.toFixed(2)}s). Please record at least ${minDurationSeconds}s.`,
    );
  }
}
