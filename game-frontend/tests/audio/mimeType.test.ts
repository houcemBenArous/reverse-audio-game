import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSupportedMimeType, isRecordingSupported, resetMimeTypeCache } from '../../src/audio/mimeType';

describe('getSupportedMimeType', () => {
  beforeEach(() => {
    resetMimeTypeCache();
  });

  it('returns a supported MIME type when MediaRecorder.isTypeSupported returns true', () => {
    // The mock in setup.ts returns true for all types
    const type = getSupportedMimeType();
    expect(typeof type).toBe('string');
    expect(type.length).toBeGreaterThan(0);
  });

  it('caches the result on subsequent calls', () => {
    const spy = vi.spyOn(MediaRecorder, 'isTypeSupported');
    getSupportedMimeType();
    const callCount = spy.mock.calls.length;
    getSupportedMimeType(); // second call should use cache
    expect(spy.mock.calls.length).toBe(callCount); // no new calls
    spy.mockRestore();
  });

  it('isRecordingSupported returns true when a type is found', () => {
    expect(isRecordingSupported()).toBe(true);
  });
});
