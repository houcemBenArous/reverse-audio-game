# Reverse Audio

A local two-player audio game where players take turns recording, listening to reversed audio, and imitating what they hear.

## How the game works

1. **Player 1** records a secret word or phrase.
2. The app reverses the audio signal and **Player 2** listens to the result.
3. **Player 2** tries to imitate the reversed sound.
4. The app reverses the imitation — and everyone discovers how close it came to the original.

The result is unpredictable and that is the point.

## Current status

**v0.1 — Complete MVP implemented and tested.**

- ✅ Full 4-phase game flow
- ✅ Genuine audio signal reversal (Web Audio API)
- ✅ Microphone recording (MediaRecorder API)
- ✅ Responsive UI (mobile + desktop)
- ✅ Error handling (microphone denied, short recording, etc.)
- ✅ 24 unit tests passing
- ✅ Production build verified (163 kB gzip: 53 kB)

## Technology

- React 18 + TypeScript (strict mode)
- Vite 6
- Web Audio API (audio reversal and playback)
- MediaRecorder API (voice recording)
- Vitest + React Testing Library
- No backend — all processing happens locally in the browser

## Development setup

```bash
cd game-frontend
npm install
npm run dev       # Start development server → http://localhost:5173
npm test          # Run the test suite (24 tests)
npm run build     # Production build → dist/
npm run typecheck # TypeScript type check only
```

Microphone access requires a secure context. `localhost` qualifies during development. Use HTTPS in production.

## Project structure

```
reverse-audio-game/
├── .kiro/steering/       # Architecture rules and coding standards
├── game-frontend/
│   ├── src/
│   │   ├── audio/        # Audio engine (recording, reversal, playback)
│   │   ├── game/         # Game state machine (pure functions)
│   │   ├── components/   # React UI components + screens
│   │   ├── hooks/        # React hooks (useGame, useRecorder, usePlayer)
│   │   ├── styles/       # CSS variables + global styles
│   │   └── types/        # Shared TypeScript types
│   └── tests/            # Unit tests mirroring src/ structure
└── cahierdecharge.md     # Original product specification
```

## Architecture notes

- The audio engine (`src/audio/`) is completely decoupled from React — pure TypeScript, no JSX.
- Game state transitions are pure functions in `src/game/` — easy to test, no side effects.
- `useGame` is the single hook that wires everything together and is consumed by `App.tsx`.
- All four audio assets (original, reversed original, imitation, reversed imitation) are kept in separate slots and never overwrite each other.

## Project rules

Architecture, coding standards and constraints are documented in `.kiro/steering/`:

| File | Contents |
|------|---------|
| `product.md` | Gameplay rules, MVP scope, acceptance criteria |
| `tech.md` | Approved stack, dependency policy, browser targets |
| `structure.md` | Directory layout, module boundaries, naming conventions |
| `coding-standards.md` | TypeScript, React, code quality rules |
| `audio-engineering.md` | Recording, reversal algorithm, playback, resource cleanup |
| `testing-standards.md` | Test requirements and coverage expectations |
| `security-privacy.md` | Microphone permissions, data retention, privacy requirements |
| `workflow.md` | Implementation process, Git practices, completion criteria |
