---
inclusion: always
---

# Project Structure — Reverse Audio

## Root layout

```
reverse-audio-game/
├── .kiro/
│   └── steering/         # Kiro workspace rules
├── public/               # Static assets served as-is
├── src/
│   ├── audio/            # Audio engine (pure logic, no React)
│   ├── game/             # Game state and phase logic
│   ├── components/       # React UI components
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global CSS and design tokens
│   ├── types/            # Shared TypeScript types and interfaces
│   ├── utils/            # Pure utility functions (no side effects)
│   ├── App.tsx           # Root component and routing (if any)
│   └── main.tsx          # Application entry point
├── tests/                # Test files mirroring src/ structure
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Module boundaries

### `src/audio/`
Contains the audio engine: recording, reversal, decoding, playback and resource management.

- Must not import from `src/components/` or `src/hooks/`.
- Must not import React or use React lifecycle methods.
- Exports plain TypeScript functions and classes only.
- This is the most critical module — audio correctness lives here.

### `src/game/`
Contains game state, phase transitions and the four audio asset slots.

- May import from `src/audio/` and `src/types/`.
- Must not import React components.
- Manages phase progression: Recording → Listening → Imitating → Result → Reveal.
- Exposes state and actions that React hooks or components consume.

### `src/components/`
Contains React UI components.

- May import from `src/hooks/`, `src/types/` and `src/styles/`.
- Must not directly call audio engine functions. Audio operations go through hooks.
- Each component handles one focused concern.
- No component file should exceed ~150 lines. Split if larger.

### `src/hooks/`
Contains custom React hooks that bridge the game/audio logic and the UI.

- May import from `src/audio/`, `src/game/` and `src/types/`.
- Must not contain JSX.
- Hook names start with `use`.

### `src/types/`
Contains shared TypeScript interfaces and type aliases.

- Must not contain logic or side effects.
- Exported types are used across all other modules.

### `src/utils/`
Contains pure helper functions with no side effects.

- Must not import from React, audio modules or game modules.
- Examples: format duration, clamp a number, generate an ID.

## Naming conventions

| Kind | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `RecordButton.tsx` |
| Hook files | camelCase, `use` prefix | `useAudioRecorder.ts` |
| Audio/utility files | camelCase | `audioReversal.ts` |
| Type/interface files | camelCase | `gameTypes.ts` |
| CSS module files | PascalCase + `.module.css` | `RecordButton.module.css` |
| Constants | UPPER_SNAKE_CASE | `MAX_RECORDING_DURATION` |
| React components | PascalCase | `RecordButton` |
| Hooks | camelCase, `use` prefix | `useAudioRecorder` |
| Pure functions | camelCase | `reverseAudioBuffer` |

## Import conventions

- Use relative imports within the same module boundary.
- Use path aliases (e.g. `@audio/`, `@game/`, `@components/`) configured in `tsconfig.json` and `vite.config.ts` for cross-module imports.
- Do not use barrel `index.ts` files unless the module has more than five exports and the barrel meaningfully simplifies the public API.
- Import order: external packages → path-aliased modules → relative imports.

## File length guidelines

These are soft limits, not hard rules. Split a file when it becomes hard to reason about as a unit:

- React components: ~150 lines.
- Hooks: ~100 lines.
- Audio engine functions: ~200 lines per file.
- Type files: no limit (they are declarations only).
