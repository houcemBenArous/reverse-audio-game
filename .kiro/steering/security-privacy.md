---
inclusion: always
---

# Security and Privacy — Reverse Audio

## Data handling principles

Reverse Audio is a local, privacy-first application. In the MVP, no user data leaves the device.

- **No server uploads.** Audio recordings must not be transmitted to any server, API or cloud storage service.
- **No analytics.** Do not include analytics libraries, tracking pixels or third-party scripts.
- **No accounts.** Do not implement authentication, user profiles or session storage of personal data.
- **Minimal data retention.** Audio data lives only in memory during a game session. It must be cleared when the game is reset or when the application unloads.

## Microphone access

- **Never request microphone access on page load.** The browser's `getUserMedia` call must be triggered only by a direct user action (a button press).
- Explain to the user why microphone access is needed before the browser prompt appears.
- If the user denies permission, display a clear, friendly explanation and provide a retry path.
- Release the `MediaStream` immediately after recording stops. Do not hold the microphone active between recording sessions.
- Do not cache or reuse a `MediaStream` across game sessions.

## Audio data lifecycle

| Event | Required action |
|-------|----------------|
| Game session ends (user clicks "New game") | Revoke all object URLs; release all `AudioBuffer` references |
| Component unmounts | Close `AudioContext`; stop all active `MediaStream` tracks; revoke object URLs |
| Recording replaced (user re-records) | Revoke old object URL before creating a new one |
| Application unload (`beforeunload`) | Release microphone tracks if still active |

Never store audio data in `localStorage`, `sessionStorage`, `IndexedDB` or any other persistent browser storage in the MVP.

## Secure context

Microphone access via `getUserMedia` requires a secure context. This means:

- During development, serve on `http://localhost` (browsers treat localhost as a secure context).
- In production, serve exclusively over **HTTPS**. Document this requirement in deployment instructions.
- Do not deploy to an HTTP-only host and claim full functionality.

## Credentials and secrets

- Do not commit API keys, tokens, credentials or secrets to the repository.
- There are no external services in the MVP, so there should be no credentials to manage. If a future version introduces a service, use environment variables and document them in `.env.example` (never `.env` itself).

## Input validation

- Validate recording duration before processing. Reject empty or too-short recordings with a user-visible message.
- Do not process `null`, `undefined` or zero-length `ArrayBuffer` values through the audio pipeline. Guard at the entry point.
- Do not eval or execute any content derived from audio recordings.

## Dependency security

- Pin dependency versions in `package.json` (use exact versions, not open ranges).
- Audit dependencies with `npm audit` periodically and before releases.
- Do not add obfuscated, unverifiable or abandoned packages.

## Documented browser limitations

Be honest with users about platform limitations:

- Safari on iOS may restrict `AudioContext` creation until a user gesture occurs. The application must handle a suspended `AudioContext` gracefully and prompt the user if a gesture is needed.
- Some older browsers do not support MediaRecorder or Web Audio API. Detect these cases on load and display a clear incompatibility message rather than failing silently.
