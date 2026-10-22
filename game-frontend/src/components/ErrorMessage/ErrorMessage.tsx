import type { AudioError } from '@types-app/audio';
import styles from './ErrorMessage.module.css';
import { Button } from '@components/Button/Button';

interface ErrorMessageProps {
  error: AudioError;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps): React.ReactElement {
  return (
    <div
      className={styles.container}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.icon} aria-hidden="true">⚠️</span>
      <p className={styles.message}>{error.userMessage}</p>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Fermer l'erreur">
          ✕
        </Button>
      )}
    </div>
  );
}
