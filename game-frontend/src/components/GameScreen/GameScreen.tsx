import type { UseGameReturn } from '@hooks/useGame';
import { ProgressBar } from '@components/ProgressBar/ProgressBar';
import { RecordButton } from '@components/RecordButton/RecordButton';
import { AudioPlayer } from '@components/AudioPlayer/AudioPlayer';
import { ErrorMessage } from '@components/ErrorMessage/ErrorMessage';
import { Button } from '@components/Button/Button';
import { getPlayerLabel } from '@game/gameState';
import styles from './GameScreen.module.css';

type GameScreenProps = Pick<
  UseGameReturn,
  | 'gameState'
  | 'audioAssets'
  | 'isProcessing'
  | 'audioError'
  | 'isRecording'
  | 'isPlaying'
  | 'onStartRecordingP1'
  | 'onStopRecordingP1'
  | 'onListenReversed'
  | 'onStopListening'
  | 'onReadyToImitate'
  | 'onStartRecordingP2'
  | 'onStopRecordingP2'
  | 'onListenResult'
  | 'onStopResult'
  | 'onGoToResultScreen'
  | 'onClearError'
  | 'onNewGame'
>;

export function GameScreen(props: GameScreenProps): React.ReactElement {
  const {
    gameState,
    audioAssets,
    isProcessing,
    audioError,
    isRecording,
    onStartRecordingP1,
    onStopRecordingP1,
    onListenReversed,
    onStopListening,
    onReadyToImitate,
    onStartRecordingP2,
    onStopRecordingP2,
    onListenResult,
    onStopResult,
    onGoToResultScreen,
    onClearError,
    onNewGame,
  } = props;

  const { phase } = gameState;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <ProgressBar phase={phase} />
        <p className={styles.playerBadge}>
          <span className={styles.playerDot} aria-hidden="true" />
          {getPlayerLabel(gameState.activePlayer)}
        </p>
      </header>

      {audioError && (
        <ErrorMessage error={audioError} onDismiss={onClearError} />
      )}

      <div className={styles.content}>
        {/* Phase 1: Player 1 records */}
        {phase === 'phase1' && (
          <section className={styles.phase} aria-labelledby="phase1-title">
            <h2 id="phase1-title" className={styles.phaseTitle}>
              🎙️ Enregistrez votre mot secret
            </h2>
            <p className={styles.phaseDesc}>
              Joueur 1 : prononcez clairement un mot, un nom ou une phrase.
            </p>
            <div className={styles.recordingArea}>
              <RecordButton
                isRecording={isRecording}
                isDisabled={isProcessing}
                onStart={onStartRecordingP1}
                onStop={onStopRecordingP1}
              />
            </div>
            {audioAssets.originalRecording && !isRecording && (
              <p className={styles.hint}>✅ Enregistrement prêt — traitement en cours…</p>
            )}
            {isProcessing && (
              <p className={styles.hint} aria-live="polite">⏳ Inversion en cours…</p>
            )}
          </section>
        )}

        {/* Phase 2: Player 2 listens */}
        {phase === 'phase2' && (
          <section className={styles.phase} aria-labelledby="phase2-title">
            <h2 id="phase2-title" className={styles.phaseTitle}>
              👂 Écoutez le son inversé
            </h2>
            <p className={styles.phaseDesc}>
              Joueur 2 : écoutez attentivement. Vous pouvez réécouter autant de fois que vous voulez.
            </p>

            <div className={styles.playerCard}>
              <AudioPlayer
                label="Son inversé"
                playbackState={audioAssets.reversedOriginal ? 'idle' : 'idle'}
                hasAudio={!!audioAssets.reversedOriginal}
                onPlay={onListenReversed}
                onPause={onStopListening}
                onStop={onStopListening}
              />
            </div>

            {gameState.listenCount > 0 && (
              <p className={styles.listenCount} aria-live="polite">
                Écoutes : {gameState.listenCount}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={gameState.listenCount < 1}
              onClick={onReadyToImitate}
            >
              Je suis prêt à imiter →
            </Button>
          </section>
        )}

        {/* Phase 3: Player 2 imitates */}
        {phase === 'phase3' && (
          <section className={styles.phase} aria-labelledby="phase3-title">
            <h2 id="phase3-title" className={styles.phaseTitle}>
              🗣️ Imitez le son
            </h2>
            <p className={styles.phaseDesc}>
              Joueur 2 : reproduisez le son que vous avez entendu.
            </p>
            <div className={styles.recordingArea}>
              <RecordButton
                isRecording={isRecording}
                isDisabled={isProcessing}
                onStart={onStartRecordingP2}
                onStop={onStopRecordingP2}
              />
            </div>
            {isProcessing && (
              <p className={styles.hint} aria-live="polite">⏳ Inversion en cours…</p>
            )}
          </section>
        )}

        {/* Phase 4: Reveal result */}
        {phase === 'phase4' && (
          <section className={styles.phase} aria-labelledby="phase4-title">
            <h2 id="phase4-title" className={styles.phaseTitle}>
              🔄 Découvrez le résultat
            </h2>
            <p className={styles.phaseDesc}>
              Votre imitation a été inversée. Écoutez le résultat !
            </p>

            <div className={styles.playerCard}>
              <AudioPlayer
                label="Votre imitation inversée"
                playbackState="idle"
                hasAudio={!!audioAssets.reversedImitation}
                onPlay={onListenResult}
                onPause={onStopResult}
                onStop={onStopResult}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onGoToResultScreen}
            >
              Voir le résultat complet →
            </Button>
          </section>
        )}
      </div>

      <footer className={styles.footer}>
        <Button variant="ghost" size="sm" onClick={onNewGame}>
          Nouvelle partie
        </Button>
      </footer>
    </main>
  );
}
