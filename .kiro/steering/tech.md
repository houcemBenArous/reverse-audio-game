---
inclusion: always
---

# Technology Stack — Reverse Audio

## Approved stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Language | TypeScript (strict mode) | Type safety, maintainability |
| Framework | React 18 | Component model, ecosystem |
| Build tool | Vite | Fast dev server, modern output |
| Styling | Plain responsive CSS, component-scoped | No extra dependency needed |
| Audio recording | MediaRecorder API (browser built-in) | No library required |
| Audio processing | Web Audio API (browser built-in) | Sufficient for sample-level reversal |
| Testing | Vitest + React Testing Library | Standard for Vite/React projects |
| Package manager | npm | Consistent lockfile |
| Version control | Git | — |

## TypeScript configuration

- Enable `strict: true` in `tsconfig.json`.
- Do not use `any`. Use `unknown` for truly unknown values and narrow with type guards.
- Prefer explicit return types on functions that return non-trivial values.
- Use `const` by default; use `let` only when reassignment is necessary.

## Dependency policy

Before adding any npm package, verify that the requirement cannot be met by:

1. A browser built-in API (Web Audio API, MediaRecorder, Blob, URL, etc.).
2. An existing project dependency.

A new dependency is justified only when it:

- Solves a cross-browser compatibility problem that browser APIs cannot handle.
- Provides a significant, verified reduction in complexity.
- Is actively maintained, well-documented and has a small footprint.

Each new dependency requires a brief written justification in the PR or commit message.

Do not add UI component libraries, state management libraries, audio libraries, or animation frameworks without concrete justification tied to a specific technical problem.

## Browser compatibility targets

The application must work correctly on:

- Chrome (latest stable)
- Edge (latest stable)
- Firefox (latest stable)
- Safari (latest stable, desktop and iOS)

Known Safari constraints to handle:

- `AudioContext` may require a user-gesture to resume.
- Supported MediaRecorder MIME types differ from Chrome. Always detect at runtime using `MediaRecorder.isTypeSupported()` rather than hardcoding a format.
- Some AudioContext methods may behave differently. Test explicitly on Safari.

## Secure context requirement

Microphone access via `getUserMedia` requires a secure context (HTTPS). During development, `localhost` qualifies. In production, the application must be served over HTTPS. Document this requirement in the deployment instructions.

## No backend in MVP

Do not introduce:

- A server-side API or backend service.
- A database or persistent storage beyond browser session memory.
- Authentication or user accounts.
- Cloud storage for audio files.
- Analytics services or third-party tracking scripts.
- AI or speech recognition services.

All audio processing happens locally in the browser. If a future version requires a backend, that decision must be documented as an architecture decision record before implementation begins.

## Build and quality scripts

The project must include the following npm scripts:

| Script | Purpose |
|--------|---------|
| `dev` | Start the Vite development server |
| `build` | Compile TypeScript and produce a production bundle |
| `preview` | Preview the production build locally |
| `test` | Run the Vitest test suite once (not in watch mode) |
| `lint` | Run the TypeScript and ESLint checks |

After any implementation change, run `build` and `test` before marking the task complete.
