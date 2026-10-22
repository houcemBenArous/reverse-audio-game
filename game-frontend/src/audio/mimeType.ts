/**
 * mimeType.ts
 *
 * Detects the best supported MediaRecorder MIME type at runtime.
 * Different browsers support different formats, so we probe in preference order.
 */

/** Ordered list of candidate MIME types, from most to least preferred. */
const CANDIDATE_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
] as const;

let cachedMimeType: string | null = null;

/**
 * Returns the first MediaRecorder MIME type that the current browser supports.
 * The result is cached after the first call.
 *
 * @throws {Error} if no supported type is found
 */
export function getSupportedMimeType(): string {
  if (cachedMimeType !== null) {
    return cachedMimeType;
  }

  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder API is not supported in this browser.');
  }

  for (const type of CANDIDATE_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      cachedMimeType = type;
      return type;
    }
  }

  throw new Error(
    'No supported audio recording format found. Please use a modern browser.',
  );
}

/**
 * Returns true if the MediaRecorder API is available and at least one
 * candidate MIME type is supported.
 */
export function isRecordingSupported(): boolean {
  try {
    getSupportedMimeType();
    return true;
  } catch {
    return false;
  }
}

/** Reset the cached MIME type (useful in tests). */
export function resetMimeTypeCache(): void {
  cachedMimeType = null;
}
