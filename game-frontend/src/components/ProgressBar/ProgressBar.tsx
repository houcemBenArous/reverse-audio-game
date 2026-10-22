import type { GamePhase } from '@types-app/game';
import { getPhaseNumber } from '@game/gameState';
import styles from './ProgressBar.module.css';

const TOTAL_PHASES = 4;

interface ProgressBarProps {
  phase: GamePhase;
}

export function ProgressBar({ phase }: ProgressBarProps): React.ReactElement | null {
  const current = getPhaseNumber(phase);

  if (current === null) return null;

  return (
    <div className={styles.wrapper} role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={TOTAL_PHASES} aria-label={`Étape ${current} sur ${TOTAL_PHASES}`}>
      <div className={styles.steps}>
        {Array.from({ length: TOTAL_PHASES }, (_, i) => {
          const step = i + 1;
          const isDone = step < current;
          const isActive = step === current;
          return (
            <div
              key={step}
              className={[
                styles.step,
                isDone ? styles.done : '',
                isActive ? styles.active : '',
              ].filter(Boolean).join(' ')}
              aria-hidden="true"
            >
              <span className={styles.dot}>
                {isDone ? '✓' : step}
              </span>
            </div>
          );
        })}
      </div>
      <p className={styles.label}>Étape {current} / {TOTAL_PHASES}</p>
    </div>
  );
}
