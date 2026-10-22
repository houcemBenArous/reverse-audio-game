---
inclusion: fileMatch
fileMatchPattern: "src/audio/**"
---

# Audio Engineering — Reverse Audio

This file applies to all code under `src/audio/`. It defines the correctness and safety requirements for recording, reversal and playback.

## Core requirement: genuine signal reversal

Audio reversal means reversing the temporal order of the raw audio samples in the decoded PCM buffer. It does not mean:

- Reversing the spelling of words.
- Using speech-to-text and re-synthesizing speech.
- Applying any filter, pitch shift, or transformation other than time reversal.

Every audio sample in the reversed output must originate from the input buffer, at its mirror-image position in time.

**Verification:** reversing a buffer twice must restore every sample to its original value, within normal floating-point precision.

## Four audio assets

Each game session uses four distinct audio assets. These are logical slots, not a combined buffer:

| Slot | TypeScript name | Created by |
|------|----------------|-----------|
| Player 1 recording | `originalRecording` | MediaRecorder (phase 1) |
| Reversed original | `reversedOriginal` | Computed from `originalRecording` (phase 2) |
| Player 2 imitation | `imitationRecording` | MediaRecorder (phase 3) |
| Reversed imitation | `reversedImitation` | Computed from `imitationRecording` (phase 4) |

Rules:
- `reversedImitation` must be computed from `imitationRecording` only. Never from `originalRecording`.
- `originalRecording` must remain unchanged for the entire session.
- Generating a reversed asset must never overwrite its source.
- Each slot holds an independent `AudioBuffer` or `Blob`. Do not share buffer references between slots.

## Recording

- Request microphone access only after an explicit user action (button press).
- Detect the supported MIME type at runtime using `MediaRecorder.isTypeSupported()`. Test `audio/webm;codecs=opus`, `audio/webm`, `audio/ogg;codecs=opus`, `audio/mp4` in that order and use the first supported type.
- Enforce a maximum recording duration (initial default: 15 seconds). Stop recording automatically when this limit is reached and inform the user.
- Reject recordings shorter than a minimum duration (suggested: 0.5 seconds) with a user-visible message.
- Do not start a new recording while one is already in progress.
- Emit clear state transitions: `idle → requesting → recording → processing → ready | error`.

## Decoding

- Use `AudioContext.decodeAudioData()` to decode the raw `Blob` or `ArrayBuffer` from MediaRecorder into a typed `AudioBuffer`.
- Handle `decodeAudioData` rejections explicitly and surface a user-friendly error.
- Preserve the original sample rate from the decoded buffer. Do not resample unless necessary.
- Preserve the channel count (mono or stereo) from the original recording.

## Reversal algorithm

```
function reverseAudioBuffer(input: AudioBuffer): AudioBuffer
```

1. Create a new `AudioBuffer` with the same `sampleRate`, `numberOfChannels` and `length` as `input`.
2. For each channel `c` from `0` to `numberOfChannels - 1`:
   a. Get the source channel data: `input.getChannelData(c)` → `Float32Array`.
   b. Copy the data reversed into the new buffer's channel: `newBuffer.getChannelData(c)[i] = source[length - 1 - i]` for each sample index `i`.
3. Return the new buffer. Do not modify `input`.

The function must be pure (no side effects) and testable without a browser environment where possible.

## Playback

- Use a single `AudioContext` instance per session. Create it only after a user gesture (required by Safari).
- Resume the `AudioContext` if its state is `suspended` before playing.
- To play a buffer: create an `AudioBufferSourceNode`, connect it to `destination`, call `start()`.
- Stop the current source node and disconnect it before starting a new one. Never allow two source nodes to play simultaneously.
- Expose playback states: `idle | playing | paused | ended | error`.
- Support: play, pause/resume, replay from start, stop.
- Pausing a Web Audio API source node is not natively supported. Implement pause by tracking elapsed time and recreating the source node from the correct offset on resume.

## Resource management

Every resource allocated must be released when it is no longer needed:

| Resource | Release method |
|----------|---------------|
| `AudioContext` | `audioContext.close()` |
| `AudioBufferSourceNode` | `.stop()` + `.disconnect()` |
| `MediaStream` tracks | `track.stop()` on each track |
| Object URLs (`URL.createObjectURL`) | `URL.revokeObjectURL(url)` |
| Temporary `AudioBuffer` objects | Let garbage collector collect; do not hold references |

Release rules:
- Release the `MediaStream` immediately after the `MediaRecorder` stops. Do not hold the microphone open.
- Close the `AudioContext` when the game session ends or the component unmounts.
- Revoke object URLs when the audio asset they represent is deleted or replaced.

## Error handling

All audio errors must result in a visible user-facing message and a safe application state. Handle at minimum:

| Condition | Expected behavior |
|-----------|-----------------|
| `getUserMedia` denied by user | Show message, offer retry button |
| `getUserMedia` hardware unavailable | Show message, explain limitation |
| `decodeAudioData` failure | Show message, allow re-recording |
| Recording too short | Show validation message, stay in recording state |
| Recording too long (auto-stopped) | Notify user, allow use or re-record |
| `AudioContext` suspended | Attempt `audioContext.resume()` on next user gesture |
| Browser does not support Web Audio API | Show a clear incompatibility message on load |

## Performance constraints

- Audio processing (decoding, reversal) must not block the UI thread. Use `async/await` with `decodeAudioData` and perform buffer operations as quickly as possible. For very large buffers, consider an off-screen `OfflineAudioContext`.
- Do not process audio on every render. Compute reversed buffers once and cache the result in the corresponding asset slot.
- The reversal of a 15-second recording at typical sample rates (~44100 Hz, mono) should complete in well under one second on a modern device.
