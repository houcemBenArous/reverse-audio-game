import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  startGame,
  advanceToPhase2,
  advanceToPhase3,
  advanceToPhase4,
  advanceToResult,
  revealSecret,
  resetGame,
  incrementListenCount,
  getPhaseNumber,
  getPlayerLabel,
} from '../../src/game/gameState';

describe('createInitialGameState', () => {
  it('starts at home screen with player1 active', () => {
    const state = createInitialGameState();
    expect(state.phase).toBe('home');
    expect(state.activePlayer).toBe('player1');
    expect(state.secretRevealed).toBe(false);
    expect(state.listenCount).toBe(0);
  });
});

describe('startGame', () => {
  it('transitions from home to phase1', () => {
    const state = startGame(createInitialGameState());
    expect(state.phase).toBe('phase1');
    expect(state.activePlayer).toBe('player1');
  });

  it('is a no-op if not on home or result screen', () => {
    const phase2 = advanceToPhase2({ ...createInitialGameState(), phase: 'phase1' });
    const same = startGame(phase2);
    expect(same.phase).toBe('phase2');
  });
});

describe('phase transitions', () => {
  it('phase1 → phase2: switches to player2', () => {
    const s1 = { ...createInitialGameState(), phase: 'phase1' as const };
    const s2 = advanceToPhase2(s1);
    expect(s2.phase).toBe('phase2');
    expect(s2.activePlayer).toBe('player2');
  });

  it('phase2 → phase3 requires at least one listen', () => {
    const s2 = { ...createInitialGameState(), phase: 'phase2' as const, listenCount: 0 };
    const unchanged = advanceToPhase3(s2);
    expect(unchanged.phase).toBe('phase2'); // blocked

    const s2listened = incrementListenCount(s2);
    const s3 = advanceToPhase3(s2listened);
    expect(s3.phase).toBe('phase3');
  });

  it('phase3 → phase4', () => {
    const s3 = { ...createInitialGameState(), phase: 'phase3' as const };
    const s4 = advanceToPhase4(s3);
    expect(s4.phase).toBe('phase4');
  });

  it('phase4 → result', () => {
    const s4 = { ...createInitialGameState(), phase: 'phase4' as const };
    const result = advanceToResult(s4);
    expect(result.phase).toBe('result');
  });

  it('no transition happens if precondition is not met', () => {
    const home = createInitialGameState();
    expect(advanceToPhase2(home).phase).toBe('home');
    expect(advanceToPhase3(home).phase).toBe('home');
    expect(advanceToPhase4(home).phase).toBe('home');
    expect(advanceToResult(home).phase).toBe('home');
  });
});

describe('revealSecret', () => {
  it('only works on the result screen', () => {
    const atResult = { ...createInitialGameState(), phase: 'result' as const };
    expect(revealSecret(atResult).secretRevealed).toBe(true);
    expect(revealSecret(createInitialGameState()).secretRevealed).toBe(false);
  });
});

describe('resetGame', () => {
  it('returns a clean initial state', () => {
    const reset = resetGame();
    expect(reset).toEqual(createInitialGameState());
  });
});

describe('incrementListenCount', () => {
  it('increments only in phase2', () => {
    const s2 = { ...createInitialGameState(), phase: 'phase2' as const, listenCount: 1 };
    expect(incrementListenCount(s2).listenCount).toBe(2);
    expect(incrementListenCount(createInitialGameState()).listenCount).toBe(0);
  });
});

describe('getPhaseNumber', () => {
  it('returns correct phase numbers', () => {
    expect(getPhaseNumber('phase1')).toBe(1);
    expect(getPhaseNumber('phase2')).toBe(2);
    expect(getPhaseNumber('phase3')).toBe(3);
    expect(getPhaseNumber('phase4')).toBe(4);
    expect(getPhaseNumber('home')).toBeNull();
    expect(getPhaseNumber('result')).toBeNull();
  });
});

describe('getPlayerLabel', () => {
  it('returns French labels', () => {
    expect(getPlayerLabel('player1')).toBe('Joueur 1');
    expect(getPlayerLabel('player2')).toBe('Joueur 2');
  });
});
