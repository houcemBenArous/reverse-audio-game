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
  | 'pendingP1Asset'
  | 'pendingP2Asset'
  | 'onStartRecordingP1'
  | 'onStopRecordingP1'
  | 'onListenPendingP1'
  | 'onRetakeRecordingP1'
  | 'onConfirmRecordingP1'
  | 'onListenReversed'
  | 'onStopListening'
  | 'onReadyToImitate'
  | 'onStartRecordingP2'
  | 'onStopRecordingP2'
  | 'onListenPendingP2'
  | 'onRetakeRecordingP2'
  | 'onConfirmRecordingP2'
  | 'onListenResult'
  | 'onStopResult'
  | 'onGoToResultScreen'
  | 'onClearError'
  | 'onNewGame'
  | 'onGoBack'
>;

export function GameScreen(props: GameScreenProps): React.ReactElement {
  const {
    gameState,
    audioAssets,
    isProcessing,
    audioError,
    isRecording,
    isPlaying,
    pendingP1Asset,
    pendingP2Asset,
    onStartRecordingP1,
    onStopRecordingP1,
    onListenPendingP1,
    onRetakeRecordingP1,
    onConfirmRecordingP1,
    onListenReversed,
    onStopListening,
    onReadyToImitate,
    onStartRecordingP2,
    onStopRecordingP2,
    onListenPendingP2,
    onRetakeRecordingP2,
    onConfirmRecordingP2,
    onListenResult,
    onStopResult,
    onGoToResultScreen,
    onClearError,
    onNewGame,
    onGoBack,
  } = props;

  const { phase } = gameState;

  // Back button is available from phase2 onward (can't go back from phase1)
  const canGoBack = phase === 'phase2' || phase === 'phase3' || phase === 'phase4';

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        {/* Back navigation */}
        <div className={styles.headerNav}>
          {canGoBack && (
            <button
              type="button"
              className={styles.backButton}
              onClick={onGoBack}
              aria-label="Retourner à l'étape précédente"
              disabled={isRecording || isProcessing}
            >
              ← Retour
            </button>
          )}
          {!canGoBack && <div className={styles.headerNavSpacer} />}
          <Button variant="ghost" size="sm" onClick={onNewGame} aria-label="Nouvelle partie">
            ✕ Quitter
          </Button>
        </div>

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

        {/* ── Phase 1: Player 1 records ── */}
        {phase === 'phase1' && (
          <section className={styles.phase} aria-labelledby="phase1-title">
            <h2 id="phase1-title" className={styles.phaseTitle}>
              🎙️ Enregistrez votre mot secret
            </h2>
            <p className={styles.phaseDesc}>
              Joueur 1 : prononcez clairement un mot, un nom ou une phrase.
            </p>

            {/* Sub-state A: no recording yet → show record button */}
            {!pendingP1Asset && (
              <div className={styles.recordingArea}>
                <RecordButton
                  isRecording={isRecording}
                  isDisabled={isProcessing}
                  onStart={onStartRecordingP1}
                  onStop={onStopRecordingP1}
                />
                {isProcessing && (
                  <p className={styles.hint} aria-live="polite">⏳ Traitement…</p>
                )}
              </div>
            )}

            {/* Sub-state B: recording ready — confirm or replace
                This state is shown both after a fresh stop AND after going
                back from phase 2, so the player can keep their recording. */}
            {pendingP1Asset && !isProcessing && (
              <div className={styles.confirmBox} role="region" aria-label="Confirmer l'enregistrement">
                <p className={styles.confirmTitle}>🎵 Enregistrement prêt</p>
                <p className={styles.confirmDesc}>
                  Durée : <strong>{pendingP1Asset.durationSeconds.toFixed(1)}s</strong>
                  {' '}— Écoutez-le, puis confirmez ou recommencez.
                </p>

                <AudioPlayer
                  label="Votre enregistrement"
                  playbackState={isPlaying ? 'playing' : 'idle'}
                  hasAudio={true}
                  onPlay={onListenPendingP1}
                  onPause={onStopListening}
                  onStop={onStopListening}
                />

                <div className={styles.confirmActions}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onRetakeRecordingP1}
                    aria-label="Enregistrer un nouveau vocal"
                  >
                    🔄 Remplacer
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onConfirmRecordingP1}
                    aria-label="Confirmer et continuer"
                  >
                    Confirmer →
                  </Button>
                </div>
              </div>
            )}

            {pendingP1Asset && isProcessing && (
              <p className={styles.hint} aria-live="polite">⏳ Inversion en cours…</p>
            )}
          </section>
        )}

        {/* ── Phase 2: Player 2 listens ── */}
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
                playbackState={isPlaying ? 'playing' : 'idle'}
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

        {/* ── Phase 3: Player 2 imitates ── */}
        {phase === 'phase3' && (
          <section className={styles.phase} aria-labelledby="phase3-title">
            <h2 id="phase3-title" className={styles.phaseTitle}>
              🗣️ Imitez le son
            </h2>
            <p className={styles.phaseDesc}>
              Joueur 2 : reproduisez le son que vous avez entendu.
            </p>

            {/* Sub-state A: no pending imitation yet */}
            {!pendingP2Asset && (
              <div className={styles.recordingArea}>
                <RecordButton
                  isRecording={isRecording}
                  isDisabled={isProcessing}
                  onStart={onStartRecordingP2}
                  onStop={onStopRecordingP2}
                />
                {isProcessing && (
                  <p className={styles.hint} aria-live="polite">⏳ Traitement…</p>
                )}
              </div>
            )}

            {/* Sub-state B: confirm or retake imitation
                Also shown when returning from phase 4 with an existing imitation. */}
            {pendingP2Asset && !isProcessing && (
              <div className={styles.confirmBox} role="region" aria-label="Confirmer l'imitation">
                <p className={styles.confirmTitle}>🎵 Imitation prête</p>
                <p className={styles.confirmDesc}>
                  Durée : <strong>{pendingP2Asset.durationSeconds.toFixed(1)}s</strong>
                  {' '}— Écoutez-la, puis confirmez ou recommencez.
                </p>

                <AudioPlayer
                  label="Votre imitation"
                  playbackState={isPlaying ? 'playing' : 'idle'}
                  hasAudio={true}
                  onPlay={onListenPendingP2}
                  onPause={onStopListening}
                  onStop={onStopListening}
                />

                <div className={styles.confirmActions}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onRetakeRecordingP2}
                    aria-label="Enregistrer une nouvelle imitation"
                  >
                    🔄 Remplacer
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onConfirmRecordingP2}
                    aria-label="Confirmer et continuer"
                  >
                    Confirmer →
                  </Button>
                </div>
              </div>
            )}

            {pendingP2Asset && isProcessing && (
              <p className={styles.hint} aria-live="polite">⏳ Inversion en cours…</p>
            )}
          </section>
        )}

        {/* ── Phase 4: Listen to result ── */}
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
                playbackState={isPlaying ? 'playing' : 'idle'}
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
    </main>
  );
}
