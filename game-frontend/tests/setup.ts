import '@testing-library/jest-dom';

// Mock AudioContext for jsdom environment
class MockAudioContext {
  sampleRate = 44100;
  state: AudioContextState = 'running';
  destination = {};

  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    // Use the real AudioBuffer-like structure
    const buffers: Float32Array[] = Array.from({ length: channels }, () => new Float32Array(length));
    return {
      sampleRate,
      length,
      numberOfChannels: channels,
      duration: length / sampleRate,
      getChannelData: (channel: number) => buffers[channel],
      copyFromChannel: () => {},
      copyToChannel: () => {},
    } as unknown as AudioBuffer;
  }

  decodeAudioData(buffer: ArrayBuffer): Promise<AudioBuffer> {
    // Return a minimal mock decoded buffer (mono, 100 samples)
    return Promise.resolve(this.createBuffer(1, 100, this.sampleRate));
  }

  createBufferSource(): AudioBufferSourceNode {
    return {
      buffer: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      onended: null,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      playbackRate: { value: 1 },
    } as unknown as AudioBufferSourceNode;
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported(_type: string): boolean {
    return true;
  }
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  start(_timeslice?: number): void {
    this.state = 'recording';
  }
  stop(): void {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob([], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
  pause(): void {
    this.state = 'paused';
  }
  resume(): void {
    this.state = 'recording';
  }
}

Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: MockMediaRecorder,
});

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
});

// Mock URL.createObjectURL / revokeObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url'),
});
Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});
