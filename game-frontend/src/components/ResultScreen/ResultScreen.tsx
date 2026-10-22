import type { UseGameReturn } from '@hooks/useGame';
import { Button } from '@components/Button/Button';
import { AudioPlayer } from '@components/AudioPlayer/AudioPlayer';
import styles from './ResultScreen.module.css';

type ResultScreenProps = Pick<
  UseGameReturn,
  | 'gameState'
  | 'audioAssets'
  | 'isPlaying'
  | 'onRevealSecret'
  | 'onListenOriginal'
  | 'onListenResult'
  | 'onStopResult'
  | 'onNewGame'
>;

export function ResultScreen({
  gameState,
  audioAssets,
  onRevealSecret,
  onListenOriginal,
  onListenResult,
  onStopResult,
  onNewGame,
}: ResultScreenProps): React.ReactElement {
  const { secretRevealed } = gameState;

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.trophy} aria-hidden="true">🎉</span>
        <h1 className={styles.title}>Résultat</h1>
        <p className={styles.subtitle}>Comparez les enregistrements et révélez le secret !</p>
      </div>

      <div className={styles.players}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Imitation inversée</h2>
          <p className={styles.cardDesc}>Ce que Joueur 2 a produit après inversion</p>
          <AudioPlayer
            label="Imitation inversée"
            playbackState="idle"
            hasAudio={!!audioAssets.reversedImitation}
            onPlay={onListenResult}
            onPause={onStopResult}
            onStop={onStopResult}
          />
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Enregistrement original</h2>
          <p className={styles.cardDesc}>Ce que Joueur 1 avait dit</p>
          {secretRevealed ? (
            <AudioPlayer
              label="Enregistrement original"
              playbackState="idle"
              hasAudio={!!audioAssets.originalRecording}
              onPlay={onListenOriginal}
              onPause={onStopResult}
              onStop={onStopResult}
            />
          ) : (
            <div className={styles.hidden} aria-label="Enregistrement original caché">
              🔒 Non révélé
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {!secretRevealed && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onRevealSecret}
            aria-label="Révéler le mot secret"
          >
            🔓 Révéler le mot secret
          </Button>
        )}

        {secretRevealed && (
          <div
            className={styles.revealBanner}
            role="status"
            aria-live="polite"
          >
            ✅ Le mot secret a été révélé — comparez les sons !
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onNewGame}
        >
          🎮 Nouvelle partie
        </Button>
      </div>
    </main>
  );
}
