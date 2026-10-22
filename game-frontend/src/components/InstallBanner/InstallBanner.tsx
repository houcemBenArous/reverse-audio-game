import type { UsePWAInstallReturn } from '@hooks/usePWAInstall';
import styles from './InstallBanner.module.css';

type InstallBannerProps = Pick<
  UsePWAInstallReturn,
  'installState' | 'install' | 'dismissIOSBanner'
>;

/**
 * Renders the appropriate install UI depending on browser/platform:
 *
 *   'ready'      → Android/Chrome button "Installer l'application"
 *   'ios-manual' → iOS Safari banner explaining how to use the Share sheet
 *   'installed'  → nothing (already installed)
 *   'unavailable'→ nothing
 */
export function InstallBanner({
  installState,
  install,
  dismissIOSBanner,
}: InstallBannerProps): React.ReactElement | null {
  if (installState === 'installed' || installState === 'unavailable') {
    return null;
  }

  // Android / Chrome / Edge — native install button
  if (installState === 'ready') {
    return (
      <div className={styles.banner} role="complementary" aria-label="Installer l'application">
        <span className={styles.icon} aria-hidden="true">📲</span>
        <div className={styles.text}>
          <strong>Installer l'application</strong>
          <span>Jouez hors-ligne, sans navigateur</span>
        </div>
        <button
          type="button"
          className={styles.installBtn}
          onClick={install}
          aria-label="Installer Reverse Audio sur cet appareil"
        >
          Installer
        </button>
      </div>
    );
  }

  // iOS Safari — manual instructions
  if (installState === 'ios-manual') {
    return (
      <div className={styles.banner} role="complementary" aria-label="Instructions d'installation iOS">
        <span className={styles.icon} aria-hidden="true">📱</span>
        <div className={styles.text}>
          <strong>Installer sur iPhone / iPad</strong>
          <span>
            Appuyez sur <strong>⎙ Partager</strong> puis{' '}
            <strong>Sur l'écran d'accueil</strong>
          </span>
        </div>
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={dismissIOSBanner}
          aria-label="Fermer la bannière d'installation"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}
