import { useEffect, useRef, useCallback, useState } from 'react';
import { noteOn, noteOff } from '../audio/engine';

function midiToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// Two octaves starting at C3 (MIDI 48)
const START_NOTE = 48;

// Computer keyboard mapping
// Bottom row = white keys, top row = black keys
const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
const BLACK_KEYS = ['w', 'e', '', 't', 'y', 'u', '', 'o', 'p', ''];
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
const BLACK_SEMITONES = [1, 3, -1, 6, 8, 10, -1, 13, 15, -1];

const keyToNote: Record<string, number> = {};
WHITE_KEYS.forEach((key, i) => {
  keyToNote[key] = START_NOTE + WHITE_SEMITONES[i];
});
BLACK_KEYS.forEach((key, i) => {
  if (key && BLACK_SEMITONES[i] >= 0) {
    keyToNote[key] = START_NOTE + BLACK_SEMITONES[i];
  }
});

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function Keyboard() {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const activeRef = useRef(new Set<number>());

  const handleNoteOn = useCallback((midiNote: number) => {
    if (activeRef.current.has(midiNote)) return;
    activeRef.current.add(midiNote);
    noteOn(midiNote % 8, midiToFreq(midiNote));
    setActiveKeys(new Set(activeRef.current));
  }, []);

  const handleNoteOff = useCallback((midiNote: number) => {
    if (!activeRef.current.has(midiNote)) return;
    activeRef.current.delete(midiNote);
    noteOff(midiNote % 8);
    setActiveKeys(new Set(activeRef.current));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyToNote[e.key];
      if (note !== undefined) {
        e.preventDefault();
        handleNoteOn(note);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const note = keyToNote[e.key];
      if (note !== undefined) {
        e.preventDefault();
        handleNoteOff(note);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  // Build visual keyboard
  const whiteKeys: React.ReactNode[] = [];
  const blackKeys: React.ReactNode[] = [];

  for (let i = 0; i < WHITE_SEMITONES.length; i++) {
    const whiteNote = START_NOTE + WHITE_SEMITONES[i];
    const noteName = NOTE_NAMES[whiteNote % 12];
    const octave = Math.floor(whiteNote / 12) - 1;
    const label = WHITE_KEYS[i]?.toUpperCase() || '';
    const isActive = activeKeys.has(whiteNote);

    whiteKeys.push(
      <div
        key={whiteNote}
        className={`key white ${isActive ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); handleNoteOn(whiteNote); }}
        onMouseUp={() => handleNoteOff(whiteNote)}
        onMouseLeave={() => handleNoteOff(whiteNote)}
      >
        <span className="key-note">{noteName}{octave}</span>
        <span className="key-bind">{label}</span>
      </div>
    );

    if (BLACK_SEMITONES[i] >= 0) {
      const blackNote = START_NOTE + BLACK_SEMITONES[i];
      const blackLabel = BLACK_KEYS[i]?.toUpperCase() || '';
      const blackActive = activeKeys.has(blackNote);

      blackKeys.push(
        <div
          key={blackNote}
          className={`key black ${blackActive ? 'active' : ''}`}
          style={{ left: i * 44 + 30 }}
          onMouseDown={(e) => { e.preventDefault(); handleNoteOn(blackNote); }}
          onMouseUp={() => handleNoteOff(blackNote)}
          onMouseLeave={() => handleNoteOff(blackNote)}
        >
          <span className="key-bind">{blackLabel}</span>
        </div>
      );
    }
  }

  return (
    <div className="keyboard-container">
      <div className="keyboard">
        <div className="white-keys">{whiteKeys}</div>
        <div className="black-keys">{blackKeys}</div>
      </div>
      <p className="keyboard-hint">
        Press A-L for white keys, W-P for black keys
      </p>
    </div>
  );
}
