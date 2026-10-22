import { useGame } from '@hooks/useGame';
import { usePWAInstall } from '@hooks/usePWAInstall';
import { HomeScreen } from '@components/HomeScreen/HomeScreen';
import { GameScreen } from '@components/GameScreen/GameScreen';
import { ResultScreen } from '@components/ResultScreen/ResultScreen';
import { InstallBanner } from '@components/InstallBanner/InstallBanner';
import '@styles/global.css';

function App(): React.ReactElement {
  const game = useGame();
  const pwa = usePWAInstall();
  const { gameState } = game;

  const isGamePhase =
    gameState.phase === 'phase1' ||
    gameState.phase === 'phase2' ||
    gameState.phase === 'phase3' ||
    gameState.phase === 'phase4';

  return (
    <div className="app-layout">
      <div className="page-container">

        {/* PWA install banner — shown on all screens until dismissed/installed */}
        <InstallBanner
          installState={pwa.installState}
          install={pwa.install}
          dismissIOSBanner={pwa.dismissIOSBanner}
        />

        {gameState.phase === 'home' && (
          <HomeScreen
            onStart={game.onStartGame}
            compatibilityError={game.compatibilityError}
          />
        )}

        {isGamePhase && (
          <GameScreen
            gameState={game.gameState}
            audioAssets={game.audioAssets}
            isProcessing={game.isProcessing}
            audioError={game.audioError}
            isRecording={game.isRecording}
            isPlaying={game.isPlaying}
            pendingP1Asset={game.pendingP1Asset}
            pendingP2Asset={game.pendingP2Asset}
            onStartRecordingP1={game.onStartRecordingP1}
            onStopRecordingP1={game.onStopRecordingP1}
            onListenPendingP1={game.onListenPendingP1}
            onRetakeRecordingP1={game.onRetakeRecordingP1}
            onConfirmRecordingP1={game.onConfirmRecordingP1}
            onListenReversed={game.onListenReversed}
            onStopListening={game.onStopListening}
            onReadyToImitate={game.onReadyToImitate}
            onStartRecordingP2={game.onStartRecordingP2}
            onStopRecordingP2={game.onStopRecordingP2}
            onListenPendingP2={game.onListenPendingP2}
            onRetakeRecordingP2={game.onRetakeRecordingP2}
            onConfirmRecordingP2={game.onConfirmRecordingP2}
            onListenResult={game.onListenResult}
            onStopResult={game.onStopResult}
            onGoToResultScreen={game.onGoToResultScreen}
            onClearError={game.onClearError}
            onNewGame={game.onNewGame}
            onGoBack={game.onGoBack}
          />
        )}

        {gameState.phase === 'result' && (
          <ResultScreen
            gameState={game.gameState}
            audioAssets={game.audioAssets}
            isPlaying={game.isPlaying}
            onRevealSecret={game.onRevealSecret}
            onListenOriginal={game.onListenOriginal}
            onListenResult={game.onListenResult}
            onStopResult={game.onStopResult}
            onNewGame={game.onNewGame}
          />
        )}

      </div>
    </div>
  );
}

export default App;
