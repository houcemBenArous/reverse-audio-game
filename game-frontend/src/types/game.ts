/**
 * The four sequential phases of a game round.
 */
export type GamePhase =
  | 'home'          // Welcome screen
  | 'phase1'        // Player 1 records the secret word
  | 'phase2'        // Player 2 listens to the reversed audio
  | 'phase3'        // Player 2 records their imitation
  | 'phase4'        // Both players hear the reversed imitation
  | 'result';       // Final result screen with reveal

/**
 * Identifies the active player.
 */
export type ActivePlayer = 'player1' | 'player2';

/**
 * The full game session state.
 */
export interface GameState {
  readonly phase: GamePhase;
  readonly activePlayer: ActivePlayer;
  /** Whether the secret word has been revealed to both players. */
  readonly secretRevealed: boolean;
  /** Number of times Player 2 has listened to the reversed original in phase 2. */
  readonly listenCount: number;
}
