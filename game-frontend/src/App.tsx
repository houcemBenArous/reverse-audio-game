import { useGame } from '@hooks/useGame';
import { HomeScreen } from '@components/HomeScreen/HomeScreen';
import { GameScreen } from '@components/GameScreen/GameScreen';
import { ResultScreen } from '@components/ResultScreen/ResultScreen';
import '@styles/global.css';

/**
 * Root component.
 * Instantiates the game hook and routes to the correct screen based on game phase.
 */
function App(): React.ReactElement {
  const game = useGame();
  const { gameState } = game;

  return (
    <div className="app-layout">
      <div className="page-container">
        {gameState.phase === 'home' && (
          <HomeScreen
            onStart={game.onStartGame}
            compatibilityError={game.compatibilityError}
          />
        )}

        {(gameState.phase === 'phase1' ||
          gameState.phase === 'phase2' ||
          gameState.phase === 'phase3' ||
          gameState.phase === 'phase4') && (
          <GameScreen
            gameState={game.gameState}
            audioAssets={game.audioAssets}
            isProcessing={game.isProcessing}
            audioError={game.audioError}
            isRecording={game.isRecording}
            isPlaying={game.isPlaying}
            onStartRecordingP1={game.onStartRecordingP1}
            onStopRecordingP1={game.onStopRecordingP1}
            onListenReversed={game.onListenReversed}
            onStopListening={game.onStopListening}
            onReadyToImitate={game.onReadyToImitate}
            onStartRecordingP2={game.onStartRecordingP2}
            onStopRecordingP2={game.onStopRecordingP2}
            onListenResult={game.onListenResult}
            onStopResult={game.onStopResult}
            onGoToResultScreen={game.onGoToResultScreen}
            onClearError={game.onClearError}
            onNewGame={game.onNewGame}
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
