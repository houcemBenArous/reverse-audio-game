import styles from './RecordButton.module.css';

interface RecordButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

/**
 * A large circular button that starts/stops audio recording.
 * Shows a pulsing animation while recording is active.
 */
export function RecordButton({
  isRecording,
  isDisabled = false,
  onStart,
  onStop,
}: RecordButtonProps): React.ReactElement {
  const handleClick = (): void => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className={styles.wrapper}>
      {isRecording && (
        <span className={styles.pulseRing} aria-hidden="true" />
      )}
      <button
        type="button"
        className={[styles.recordButton, isRecording ? styles.recording : ''].join(' ')}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
        aria-pressed={isRecording}
      >
        <span className={styles.icon} aria-hidden="true">
          {isRecording ? '⏹' : '🎙️'}
        </span>
        <span className={styles.label}>
          {isRecording ? 'Arrêter' : 'Enregistrer'}
        </span>
      </button>
      <p className={styles.status} aria-live="polite" aria-atomic="true">
        {isRecording ? 'Enregistrement en cours…' : ''}
      </p>
    </div>
  );
}
