import { useEffect, useRef, useCallback, useState } from 'react';
import { noteOn, noteOff } from '../audio/engine';
import { colors, primitive } from '../tokens';

function midiToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// ── Layout ──────────────────────────────────────────────────
const PAD      = 16;                      // container padding
const KEY_GAP  = 5;                       // uniform gap between all keys (cols and rows)
const SVG_W    = 1200 - PAD * 2;
const OCT_W    = 28;
const OCT_GAP  = 20;                      // larger gap after octave buttons
const LEFT     = OCT_W + OCT_GAP;         // start of keys
const PITCH    = Math.floor((SVG_W - LEFT) / 15); // per white key

// All keys same width → equal KEY_GAP between every adjacent key
const WHITE_W = PITCH - KEY_GAP;
const BLACK_W = WHITE_W;                  // equal width for equal spacing

// Two-zone split — perfect squares, row gap = col gap
const BK_Y  = 1;
const BK_H  = BLACK_W;
const GAP   = KEY_GAP;                    // equal row and column spacing
const WK_Y  = BK_Y + BK_H + GAP;
const WK_H  = WHITE_W;
const SVG_H = WK_Y + WK_H + 1;

const RX      = 4;
const STROKE  = '#2A2726';

// ── Note definitions ─────────────────────────────────────────
const BASE_NOTE = 48; // C3

// 15 white key semitones: C3 to C5
const WHITE_SEMI = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24];

// 10 black keys: wi = white key index they sit above (same-letter white key)
const BLACK_DEFS = [
  { wi: 0,  semi: 1  }, // C#
  { wi: 1,  semi: 3  }, // D#
  { wi: 3,  semi: 6  }, // F#
  { wi: 4,  semi: 8  }, // G#
  { wi: 5,  semi: 10 }, // A#
  { wi: 7,  semi: 13 }, // C#4
  { wi: 8,  semi: 15 }, // D#4
  { wi: 10, semi: 18 }, // F#4
  { wi: 11, semi: 20 }, // G#4
  { wi: 12, semi: 22 }, // A#4
];

// ── Computer keyboard bindings ────────────────────────────────
const KB_WHITE      = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
const KB_WHITE_SEMI = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];

// Keyboard char for each black key, keyed by white key index (wi)
const KB_BLACK_BY_WI: Record<number, string> = {
  0: 'w', 1: 'e', 3: 't', 4: 'y', 5: 'u', 7: 'o', 8: 'p',
};


// ── Component ─────────────────────────────────────────────────
export default function Keyboard() {
  const [activeKeys, setActiveKeys]   = useState<Set<number>>(new Set());
  const [octaveShift, setOctaveShift] = useState(0);
  const activeRef = useRef(new Set<number>());
  const keyMapRef = useRef<Record<string, number>>({});

  const startNote = BASE_NOTE + octaveShift * 12;

  // Rebuild keyboard→note map whenever octave shifts
  useEffect(() => {
    const map: Record<string, number> = {};
    KB_WHITE.forEach((k, i) => { map[k] = startNote + KB_WHITE_SEMI[i]; });
    BLACK_DEFS.forEach(({ wi, semi }) => {
      const k = KB_BLACK_BY_WI[wi];
      if (k) map[k] = startNote + semi;
    });
    keyMapRef.current = map;
  }, [startNote]);

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

  const shiftOctave = useCallback((delta: number) => {
    // Release all active notes before shifting
    activeRef.current.forEach(note => noteOff(note % 8));
    activeRef.current.clear();
    setActiveKeys(new Set());
    setOctaveShift(o => Math.max(-3, Math.min(3, o + delta)));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMapRef.current[e.key];
      if (note !== undefined) { e.preventDefault(); handleNoteOn(note); }
    };
    const up = (e: KeyboardEvent) => {
      const note = keyMapRef.current[e.key];
      if (note !== undefined) { e.preventDefault(); handleNoteOff(note); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [handleNoteOn, handleNoteOff]);

  // Note → keyboard label lookup
  const noteLabel: Record<number, string> = {};
  KB_WHITE.forEach((k, i) => { noteLabel[startNote + KB_WHITE_SEMI[i]] = k.toUpperCase(); });
  BLACK_DEFS.forEach(({ wi, semi }) => {
    const k = KB_BLACK_BY_WI[wi];
    if (k) noteLabel[startNote + semi] = k.toUpperCase();
  });

  const OCT_CX = OCT_W / 2 + 1;

  return (
    <div style={{
      marginTop: 12,
      padding: PAD,
      background: colors.bg.panel,
      borderRadius: 12,
      userSelect: 'none',
      display: 'inline-block',
    }}>
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ display: 'block' }}
      >
        {/* Octave up (top button — black zone) */}
        <rect
          x={1} y={BK_Y} width={OCT_W} height={BK_H}
          rx={RX} fill={colors.bg.panel} stroke={STROKE} strokeWidth={1}
          style={{ cursor: 'pointer' }}
          onPointerDown={e => { e.preventDefault(); shiftOctave(1); }}
        />
        <text
          x={OCT_CX} y={BK_Y + BK_H / 2 + 4}
          textAnchor="middle" fontSize={12} fontWeight="700"
          fill={STROKE} opacity={0.55}
          style={{ pointerEvents: 'none' }}
        >^</text>

        {/* Octave down (bottom button — white zone) */}
        <rect
          x={1} y={WK_Y} width={OCT_W} height={WK_H}
          rx={RX} fill={colors.bg.panel} stroke={STROKE} strokeWidth={1}
          style={{ cursor: 'pointer' }}
          onPointerDown={e => { e.preventDefault(); shiftOctave(-1); }}
        />
        <text
          x={OCT_CX} y={WK_Y + WK_H / 2 + 4}
          textAnchor="middle" fontSize={12} fontWeight="700"
          fill={STROKE} opacity={0.55}
          style={{ pointerEvents: 'none' }}
        >v</text>

        {/* White keys — bottom zone */}
        {WHITE_SEMI.map((semi, i) => {
          const note   = startNote + semi;
          const active = activeKeys.has(note);
          const label  = noteLabel[note];
          const x      = LEFT + i * PITCH;
          return (
            <g key={note}>
              <rect
                x={x} y={WK_Y} width={WHITE_W} height={WK_H}
                rx={RX}
                fill={active ? primitive.red[400] : colors.bg.panel}
                stroke={STROKE} strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={e => { e.preventDefault(); handleNoteOn(note); }}
                onPointerUp={() => handleNoteOff(note)}
                onPointerLeave={() => handleNoteOff(note)}
              />
              {label && (
                <text
                  x={x + WHITE_W / 2} y={WK_Y + WK_H - 7}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="PP Fraktion Mono, monospace"
                  fontWeight="700"
                  fill={active ? primitive.red[700] : STROKE}
                  opacity={0.45}
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Black keys — top zone, centered above same-letter white key */}
        {BLACK_DEFS.map(({ wi, semi }) => {
          const note   = startNote + semi;
          const active = activeKeys.has(note);
          const label  = noteLabel[note];
          const x      = LEFT + wi * PITCH + Math.round((WHITE_W - BLACK_W) / 2);
          return (
            <g key={note}>
              <rect
                x={x} y={BK_Y} width={BLACK_W} height={BK_H}
                rx={RX - 1}
                fill={active ? primitive.red[500] : colors.bg.canvas}
                stroke={STROKE} strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onPointerDown={e => { e.preventDefault(); handleNoteOn(note); }}
                onPointerUp={() => handleNoteOff(note)}
                onPointerLeave={() => handleNoteOff(note)}
              />
              {label && (
                <text
                  x={x + BLACK_W / 2} y={BK_Y + BK_H - 7}
                  textAnchor="middle"
                  fontSize={7}
                  fontFamily="PP Fraktion Mono, monospace"
                  fontWeight="700"
                  fill={colors.bg.panel}
                  opacity={0.6}
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
