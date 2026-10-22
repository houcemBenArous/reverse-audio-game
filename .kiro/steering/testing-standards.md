---
inclusion: fileMatch
fileMatchPattern: "tests/**"
---

# Testing Standards — Reverse Audio

## Framework

- **Unit and component tests:** Vitest + React Testing Library.
- **Browser / integration tests:** use a real browser environment when testing MediaRecorder or AudioContext behavior. Playwright or a Vitest browser mode configuration is appropriate.
- Do not claim a test passed unless it was actually executed and produced a green result.

## Test file organization

Mirror the `src/` structure under `tests/`:

```
tests/
├── audio/          # Unit tests for audio engine functions
├── game/           # Unit tests for game state logic
├── components/     # Component tests
└── hooks/          # Hook tests
```

Name test files `<subject>.test.ts` or `<subject>.test.tsx`.

## Audio engine tests (highest priority)

Audio processing is the critical path of this application. Every function in `src/audio/` must have unit tests.

**Required test cases for `reverseAudioBuffer`:**

1. **Identity test:** reversing a buffer twice produces the same samples as the original (within `Number.EPSILON` tolerance).
2. **Correctness test:** reversing a known synthetic buffer `[1, 2, 3, 4]` produces `[4, 3, 2, 1]`.
3. **Multi-channel test:** each channel is reversed independently; no channel data bleeds into another.
4. **Metadata preservation test:** the output `AudioBuffer` has the same `sampleRate`, `numberOfChannels` and `length` as the input.
5. **Immutability test:** the input buffer is not modified by the reversal function.
6. **Minimal input test:** a single-sample buffer reverses to itself.

Use synthetic `AudioBuffer` instances for these tests. Do not depend on microphone access or real audio files.

**Required test cases for recording state machine:**

- Transitions from `idle → requesting → recording → ready` follow the expected sequence.
- Attempting to start a recording while already recording is a no-op or produces a clear error.
- A recording shorter than the minimum duration is rejected with an appropriate error.
- A recording at or beyond the maximum duration is automatically stopped.

**Required test cases for playback:**

- Playing a buffer transitions state from `idle` to `playing`.
- Stopping playback transitions state to `idle`.
- Playing while already playing stops the previous source before starting a new one.

## Component tests

- Test that each phase renders the correct controls for that phase.
- Test that the "Next" or "Continue" button is disabled until the required audio for that phase is available.
- Test that the secret word is hidden during phases 1–3 and visible in phase 4.
- Test that error messages appear when audio operations fail.
- Test that a user can restart the game and that state resets correctly.

Use React Testing Library's `userEvent` for simulating interactions. Do not test implementation details or internal state directly.

## Edge cases to test

- Empty audio blob (zero bytes or very short duration).
- User denies microphone permission.
- User revokes microphone permission mid-session.
- Playback called before an audio buffer is available.
- Game reset while audio is playing.
- Multiple rapid clicks on record or play buttons.

## What not to test

- Visual styling or exact pixel positions.
- Third-party library internals.
- Trivial pass-through code with no logic.

## Running tests

Always run the test suite after completing an implementation task:

```bash
npm test
```

Fix all failures before committing or continuing to the next task. Do not suppress or skip failing tests to unblock progress; fix the underlying issue instead.

## Mocking browser APIs

- Mock `navigator.mediaDevices.getUserMedia` in unit tests to avoid requiring real hardware.
- Mock `AudioContext` and `MediaRecorder` at the boundary, not deep inside the audio engine. This keeps the mocks minimal and the engine testable.
- When a test genuinely needs a real browser environment (e.g., testing that MediaRecorder produces decodable output), use Playwright or Vitest browser mode rather than attempting to mock the full API surface.
