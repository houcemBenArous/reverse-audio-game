import type { PlaybackState } from '@types-app/audio';
import styles from './AudioPlayer.module.css';
import { Button } from '@components/Button/Button';

interface AudioPlayerProps {
  label: string;
  playbackState: PlaybackState;
  hasAudio: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

/**
 * A compact audio player row showing play/pause/stop controls.
 * Only renders controls when audio is available.
 */
export function AudioPlayer({
  label,
  playbackState,
  hasAudio,
  onPlay,
  onPause,
  onStop,
}: AudioPlayerProps): React.ReactElement {
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';

  return (
    <div className={styles.player}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controls}>
        {!isPlaying && (
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasAudio}
            onClick={onPlay}
            aria-label={`Écouter : ${label}`}
          >
            ▶ Écouter
          </Button>
        )}
        {isPlaying && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onPause}
              aria-label="Pause"
            >
              ⏸ Pause
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              aria-label="Arrêter"
            >
              ⏹
            </Button>
          </>
        )}
        {isPaused && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onPlay}
              aria-label={`Reprendre : ${label}`}
            >
              ▶ Reprendre
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              aria-label="Arrêter"
            >
              ⏹
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
