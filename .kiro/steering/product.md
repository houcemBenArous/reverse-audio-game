---
inclusion: always
---

# Product — Reverse Audio

## Purpose

Reverse Audio is a local multiplayer audio game for two players sharing one device. Players take turns recording and imitating reversed audio to discover how close the imitation comes to the original phrase when reversed back.

The game is a social entertainment tool. It requires no accounts, no server connection, and no installation.

## Target users

- Groups of friends, families or colleagues sharing a single device.
- Players of all ages who are comfortable using a smartphone or computer.
- No technical knowledge is required to play.

## Core gameplay sequence

The game proceeds in four phases. Each phase must complete before the next begins.

| Phase | Actor | Action |
|-------|-------|--------|
| 1 | Player 1 | Records a secret word, name, or phrase into the microphone. |
| 2 | Player 2 | Listens to the reversed version of that recording one or more times. |
| 3 | Player 2 | Records an imitation of the reversed sound they just heard. |
| 4 | Both | The app reverses the imitation. Players listen to the result and compare it to the original. |

At the end of Phase 4, the original recording and the secret phrase are revealed. Players may restart with a new word.

**The result is not guaranteed to match the original.** This is intentional and is part of what makes the game entertaining.

## Audio assets

Four distinct audio assets exist during a game session. They must never be mixed or overwritten:

| Asset | Source | Created in phase |
|-------|--------|-----------------|
| `originalRecording` | Player 1's microphone | 1 |
| `reversedOriginal` | Computed from `originalRecording` | 2 (on demand) |
| `imitationRecording` | Player 2's microphone | 3 |
| `reversedImitation` | Computed from `imitationRecording` | 4 |

The `reversedImitation` must always be derived from `imitationRecording`, never from `originalRecording`.

## MVP scope

The first version includes only these features:

- One device shared by two players.
- Record a secret word or phrase (Player 1).
- Play the reversed audio (Player 2 listens).
- Re-listen to the reversed audio before recording.
- Record an imitation (Player 2).
- Play the reversed imitation.
- Reveal the original recording.
- Restart the game with a new word.
- Responsive layout that works on phones, tablets and desktop browsers.
- Local audio processing only — no server communication.
- Clear error messages for microphone issues and invalid recordings.

## Out of scope for MVP

- Timer or scoring system.
- Predefined word categories.
- Audio export or social sharing.
- Online multiplayer.
- Progressive Web App (PWA) installation.
- User accounts or saved history.
- Backend, database, AI services or speech recognition.

## Acceptance criteria for v1

The first version is acceptable when all of the following pass:

1. A user can record their voice and replay the recording.
2. The reversed audio plays the signal in genuine reverse temporal order.
3. The reversed audio can be replayed multiple times.
4. Player 2 can record an imitation independently of the original.
5. Reversing the imitation produces a distinct audio track derived from that imitation only.
6. The original recording remains accessible until it is explicitly revealed.
7. Denied microphone permissions and invalid recordings are handled with actionable error messages.
8. The full game flow works on a desktop browser and on an Android smartphone.
9. Safari / iPhone compatibility is confirmed before claiming full iOS support.
10. No audio data is transmitted to any server.
