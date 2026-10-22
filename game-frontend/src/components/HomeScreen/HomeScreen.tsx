import styles from './HomeScreen.module.css';
import { Button } from '@components/Button/Button';

interface HomeScreenProps {
  onStart: () => void;
  compatibilityError: string | null;
}

export function HomeScreen({ onStart, compatibilityError }: HomeScreenProps): React.ReactElement {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.logo} aria-hidden="true">🔊</div>
        <h1 className={styles.title}>Reverse Audio</h1>
        <p className={styles.tagline}>Le jeu où les sons se retournent</p>
      </div>

      {compatibilityError ? (
        <div role="alert" className={styles.compatError}>
          <p>{compatibilityError}</p>
        </div>
      ) : (
        <>
          <section className={styles.rules} aria-labelledby="rules-title">
            <h2 id="rules-title" className={styles.rulesTitle}>Comment jouer</h2>
            <ol className={styles.rulesList}>
              <li>
                <span className={styles.ruleStep}>1</span>
                <span><strong>Joueur 1</strong> enregistre un mot secret.</span>
              </li>
              <li>
                <span className={styles.ruleStep}>2</span>
                <span><strong>Joueur 2</strong> écoute l'enregistrement à l'envers.</span>
              </li>
              <li>
                <span className={styles.ruleStep}>3</span>
                <span><strong>Joueur 2</strong> imite le son entendu.</span>
              </li>
              <li>
                <span className={styles.ruleStep}>4</span>
                <span>L'application inverse l'imitation — et découvrez le résultat !</span>
              </li>
            </ol>
          </section>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onStart}
          >
            🎮 Nouvelle partie
          </Button>
        </>
      )}
    </main>
  );
}
