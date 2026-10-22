/**
 * gameState.ts
 *
 * Pure game-state transitions for the Reverse Audio game.
 * No React, no side effects. All transitions return new state objects.
 */

import type { GamePhase, ActivePlayer, GameState } from '@types-app/game';

/** Returns the initial game state (at the home screen). */
export function createInitialGameState(): GameState {
  return {
    phase: 'home',
    activePlayer: 'player1',
    secretRevealed: false,
    listenCount: 0,
  };
}

/** Returns the player name label for display. */
export function getPlayerLabel(player: ActivePlayer): string {
  return player === 'player1' ? 'Joueur 1' : 'Joueur 2';
}

/** Returns a human-readable title for the current phase. */
export function getPhaseTitle(phase: GamePhase): string {
  switch (phase) {
    case 'home':
      return 'Accueil';
    case 'phase1':
      return 'Enregistrement du mot secret';
    case 'phase2':
      return "Écoute de l'audio inversé";
    case 'phase3':
      return "Imitation du son";
    case 'phase4':
      return 'Inversion de l\'imitation';
    case 'result':
      return 'Résultat';
  }
}

/** Returns a 1-based phase number (1–4) for progress display. Null on home/result. */
export function getPhaseNumber(phase: GamePhase): number | null {
  switch (phase) {
    case 'phase1': return 1;
    case 'phase2': return 2;
    case 'phase3': return 3;
    case 'phase4': return 4;
    default: return null;
  }
}

/**
 * Transitions from home to the start of a game (phase1).
 */
export function startGame(state: GameState): GameState {
  if (state.phase !== 'home' && state.phase !== 'result') {
    return state; // No-op if already in progress
  }
  return {
    phase: 'phase1',
    activePlayer: 'player1',
    secretRevealed: false,
    listenCount: 0,
  };
}

/**
 * Advances from phase1 to phase2 after Player 1 has recorded.
 * Requires: state.phase === 'phase1'
 */
export function advanceToPhase2(state: GameState): GameState {
  if (state.phase !== 'phase1') return state;
  return { ...state, phase: 'phase2', activePlayer: 'player2' };
}

/**
 * Increments the listen count in phase2.
 */
export function incrementListenCount(state: GameState): GameState {
  if (state.phase !== 'phase2') return state;
  return { ...state, listenCount: state.listenCount + 1 };
}

/**
 * Advances from phase2 to phase3 when Player 2 is ready to record.
 * Requires: state.phase === 'phase2' && listenCount >= 1
 */
export function advanceToPhase3(state: GameState): GameState {
  if (state.phase !== 'phase2' || state.listenCount < 1) return state;
  return { ...state, phase: 'phase3', activePlayer: 'player2' };
}

/**
 * Advances from phase3 to phase4 after Player 2 has recorded their imitation.
 * Requires: state.phase === 'phase3'
 */
export function advanceToPhase4(state: GameState): GameState {
  if (state.phase !== 'phase3') return state;
  return { ...state, phase: 'phase4' };
}

/**
 * Advances from phase4 to the result screen.
 * Requires: state.phase === 'phase4'
 */
export function advanceToResult(state: GameState): GameState {
  if (state.phase !== 'phase4') return state;
  return { ...state, phase: 'result' };
}

/**
 * Reveals the secret word on the result screen.
 */
export function revealSecret(state: GameState): GameState {
  if (state.phase !== 'result') return state;
  return { ...state, secretRevealed: true };
}

/**
 * Goes back one phase.
 *
 * Allowed transitions:
 *   phase2 → phase1  (Player 1 active again, listen count reset)
 *   phase3 → phase2  (Player 2 listens again)
 *   phase4 → phase3  (Player 2 re-records imitation)
 *   phase4 → phase2  (Player 2 re-listens — handled by calling goBack twice)
 *   phase4 → phase1  (Player 1 re-records — handled by calling goBack three times)
 *
 * The audio assets that become stale after going back are cleared by useGame,
 * not here (this function is pure and has no knowledge of audio state).
 */
export function goBackOnePhase(state: GameState): GameState {
  switch (state.phase) {
    case 'phase2':
      return {
        ...state,
        phase: 'phase1',
        activePlayer: 'player1',
        listenCount: 0,
      };
    case 'phase3':
      return {
        ...state,
        phase: 'phase2',
        activePlayer: 'player2',
        // Keep listenCount so Player 2 can re-listen without the "must listen once" gate
      };
    case 'phase4':
      return {
        ...state,
        phase: 'phase3',
        activePlayer: 'player2',
      };
    default:
      // phase1 / home / result — no further back
      return state;
  }
}

/**
 * Resets the entire game back to home.
 */
export function resetGame(): GameState {
  return createInitialGameState();
}
