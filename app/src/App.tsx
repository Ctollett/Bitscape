import { useState } from 'react';
import { initAudio } from './audio/engine';
import Keyboard from './components/Keyboard';
import { PatchProvider } from './fm-canvas/PatchProvider';
import { FMCanvas } from './fm-canvas/FMCanvas';
import './App.css';
import { GlobalControlPanel } from './fm-canvas/GlobalControlPanel';
import { PatchBrowser } from './components/PatchBrowser';

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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <PatchBrowser />
              <FMCanvas />
            </div>
            <GlobalControlPanel />
            <Keyboard />
          </div>
        </PatchProvider>
      )}
    </div>
  );
}

export default App;
