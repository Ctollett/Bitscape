import { useState } from 'react';
import { initAudio } from './audio/engine';
import Keyboard from './components/Keyboard';
import { PatchProvider } from './fm-canvas/PatchProvider';
import { FMCanvas } from './fm-canvas/FMCanvas';
import './App.css';
import { GlobalControlPanel } from './fm-canvas/GlobalControlPanel';
import { colors, borderRadius, spacing } from './tokens';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './fm-canvas/constants';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      await initAudio();
      setStarted(true);
    } catch (err) {
      console.error('Failed to start audio:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      {!started ? (
        <button className="start-btn" onClick={handleStart} disabled={loading}>
          {loading ? 'Loading...' : 'Start Audio'}
        </button>
      ) : (
        <PatchProvider>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: spacing.md, width: '100%', boxSizing: 'border-box' }}>
            {/* Canvas zone */}
            <div style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, borderRadius: `${borderRadius.lg}px ${borderRadius.lg}px 0 0`, background: colors.bg.canvas, overflow: 'hidden' }}>
              <FMCanvas />
            </div>
            {/* Bottom panel */}
            <div style={{ borderRadius: `0 0 ${borderRadius.lg}px ${borderRadius.lg}px`, background: colors.bg.panel, overflow: 'hidden' }}>
              <GlobalControlPanel />
            </div>
            <Keyboard />
          </div>
        </PatchProvider>
      )}
    </div>
  );
}

export default App;
