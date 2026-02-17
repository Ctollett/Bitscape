import { useState } from 'react';
import { initAudio } from './audio/engine';
import Keyboard from './components/Keyboard';
import TestPanel from './components/TestPanel';
import './App.css';

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
      <h1>Bitscape</h1>
      {!started ? (
        <button className="start-btn" onClick={handleStart} disabled={loading}>
          {loading ? 'Loading...' : 'Start Audio'}
        </button>
      ) : (
        <>
          <Keyboard />
          <TestPanel />
        </>
      )}
    </div>
  );
}

export default App;
