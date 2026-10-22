import { describe, it, expect, beforeEach } from 'vitest';
import { reverseAudioBuffer, validateAudioBuffer } from '../../src/audio/reversal';

// Helper: create a real-structured mock AudioBuffer using the global mock
function makeMockBuffer(channels: number, length: number, sampleRate = 44100): AudioBuffer {
  const ctx = new AudioContext();
  const buf = ctx.createBuffer(channels, length, sampleRate);
  return buf;
}

// Helper: fill channel data with known values
function fillChannel(buf: AudioBuffer, channel: number, values: number[]): void {
  const data = buf.getChannelData(channel);
  values.forEach((v, i) => { data[i] = v; });
}

// Helper: extract channel data as plain array
function readChannel(buf: AudioBuffer, channel: number): number[] {
  return Array.from(buf.getChannelData(channel));
}

describe('reverseAudioBuffer', () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = new AudioContext();
  });

  it('reverses a simple mono buffer correctly', () => {
    const input = makeMockBuffer(1, 4);
    fillChannel(input, 0, [1, 2, 3, 4]);

    const result = reverseAudioBuffer(input, ctx);

    expect(readChannel(result, 0)).toEqual([4, 3, 2, 1]);
  });

  it('double reversal restores original samples (identity property)', () => {
    const input = makeMockBuffer(1, 6);
    const original = [0.1, -0.5, 0.3, 0.8, -0.2, 0.6];
    fillChannel(input, 0, original);

    const once = reverseAudioBuffer(input, ctx);
    const twice = reverseAudioBuffer(once, ctx);

    const restored = readChannel(twice, 0);
    restored.forEach((v, i) => {
      expect(v).toBeCloseTo(original[i], 5);
    });
  });

  it('does not modify the input buffer', () => {
    const input = makeMockBuffer(1, 4);
    fillChannel(input, 0, [1, 2, 3, 4]);

    reverseAudioBuffer(input, ctx);

    expect(readChannel(input, 0)).toEqual([1, 2, 3, 4]);
  });

  it('preserves sampleRate and numberOfChannels in output', () => {
    const input = makeMockBuffer(2, 8, 48000);
    const result = reverseAudioBuffer(input, ctx);

    expect(result.sampleRate).toBe(input.sampleRate);
    expect(result.numberOfChannels).toBe(input.numberOfChannels);
    expect(result.length).toBe(input.length);
  });

  it('reverses each channel independently', () => {
    const input = makeMockBuffer(2, 4);
    fillChannel(input, 0, [1, 2, 3, 4]);
    fillChannel(input, 1, [10, 20, 30, 40]);

    const result = reverseAudioBuffer(input, ctx);

    expect(readChannel(result, 0)).toEqual([4, 3, 2, 1]);
    expect(readChannel(result, 1)).toEqual([40, 30, 20, 10]);
  });

  it('handles a single-sample buffer (reversing to itself)', () => {
    const input = makeMockBuffer(1, 1);
    fillChannel(input, 0, [0.42]);

    const result = reverseAudioBuffer(input, ctx);

    // Float32Array stores 32-bit floats, so use toBeCloseTo for precision
    expect(readChannel(result, 0)[0]).toBeCloseTo(0.42, 5);
  });
});

describe('validateAudioBuffer', () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = new AudioContext();
  });

  it('does not throw for a valid buffer with sufficient duration', () => {
    // Mock createBuffer returns sampleRate=44100 and length=100 → duration ≈ 0.0023s
    // We need at least 0.1s by default, so let's use a custom min
    const buf = ctx.createBuffer(1, 100, 44100);
    // With length=100 and sampleRate=44100, duration = 0.00227s < 0.1s default
    // Use a smaller minDuration for this test
    expect(() => validateAudioBuffer(buf, 0.001)).not.toThrow();
  });

  it('throws if buffer duration is below the minimum', () => {
    const buf = ctx.createBuffer(1, 100, 44100); // ~0.002s
    expect(() => validateAudioBuffer(buf, 1.0)).toThrow(/too short|trop court/i);
  });
});
