import { useState } from 'react';
import { usePatch } from '../../fm-canvas/patch-context';
import { LFOSliders } from './LFOSliders';
import { LFOWave } from './LFOWave';
import { TabSelect } from '../TabSelect';
import { Panel } from '../Panel';
import { PanelKnob } from '../PanelKnob';
import { PanelGroup } from '../PanelGroup';
import { colors } from '../../tokens';

// Ordered to match LfoDestination enum in lfo.rs
const DESTINATIONS: { value: number; label: string; group: string }[] = [
  // FM Synth
  { value: 0,  label: 'Mod A',      group: 'FM Synth' },
  { value: 1,  label: 'Mod B',      group: 'FM Synth' },
  { value: 2,  label: 'Ratio C',    group: 'FM Synth' },
  { value: 3,  label: 'Ratio A',    group: 'FM Synth' },
  { value: 4,  label: 'Ratio B',    group: 'FM Synth' },
  { value: 5,  label: 'Feedback',   group: 'FM Synth' },
  { value: 6,  label: 'Harm',       group: 'FM Synth' },
  { value: 7,  label: 'Carrier Mix',group: 'FM Synth' },
  // Amp
  { value: 8,  label: 'Amp Atk',    group: 'Amp' },
  { value: 9,  label: 'Amp Dec',    group: 'Amp' },
  { value: 10, label: 'Amp Sus',    group: 'Amp' },
  { value: 11, label: 'Amp Rel',    group: 'Amp' },
  { value: 12, label: 'Overdrive',  group: 'Amp' },
  { value: 13, label: 'Pan',        group: 'Amp' },
  { value: 14, label: 'Volume',     group: 'Amp' },
  // Filter
  { value: 15, label: 'Flt Atk',    group: 'Filter' },
  { value: 16, label: 'Flt Dec',    group: 'Filter' },
  { value: 17, label: 'Flt Sus',    group: 'Filter' },
  { value: 18, label: 'Flt Rel',    group: 'Filter' },
  { value: 19, label: 'Cutoff',     group: 'Filter' },
  { value: 20, label: 'Resonance',  group: 'Filter' },
  { value: 21, label: 'Env Amt',    group: 'Filter' },
];

const DEST_GROUPS = ['FM Synth', 'Amp', 'Filter'] as const;

const WAVEFORMS = [
  { value: 0, label: '△', title: 'Triangle' },
  { value: 1, label: '∿', title: 'Sine' },
  { value: 2, label: '⊓', title: 'Square' },
  { value: 3, label: '⊿', title: 'Sawtooth' },
  { value: 4, label: '⌒', title: 'Exponential' },
  { value: 5, label: '⟋', title: 'Ramp' },
  { value: 6, label: '?', title: 'Random' },
];

const MODES = [
  { value: 0, label: 'Free' },
  { value: 1, label: 'Trig' },
  { value: 2, label: 'Hold' },
  { value: 3, label: 'One' },
  { value: 4, label: 'Half' },
];

interface LFOPanelProps {
  lfoIndex: 1 | 2;
}

export function LFOPanel({ lfoIndex }: LFOPanelProps) {
  const { patch, dispatch } = usePatch();
  const [assigning, setAssigning] = useState(false);

  const speed = lfoIndex === 1 ? patch.lfo1Speed : patch.lfo2Speed;
  const depth = lfoIndex === 1 ? patch.lfo1Depth : patch.lfo2Depth;
  const waveform = lfoIndex === 1 ? patch.lfo1Waveform : patch.lfo2Waveform;
  const mode = lfoIndex === 1 ? patch.lfo1Mode : patch.lfo2Mode;
  const destination = lfoIndex === 1 ? patch.lfo1Destination : patch.lfo2Destination;
  const multiplier = lfoIndex === 1 ? patch.lfo1Multiplier : patch.lfo2Multiplier;
  const fade = lfoIndex === 1 ? patch.lfo1Fade : patch.lfo2Fade;

  const update = (partial: Partial<{ speed: number; depth: number; waveform: number; mode: number; destination: number; multiplier: number; fade: number }>) => {
    const next = { speed, depth, waveform, mode, destination, multiplier, fade, ...partial };
    dispatch({ type: lfoIndex === 1 ? 'SET_LFO1' : 'SET_LFO2', ...next });
  };

  const activeDest = DESTINATIONS.find(d => d.value === destination);

  // ── Assignment panel ──────────────────────────────────────────────────────
  if (assigning) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '10px 20px', gap: '10px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setAssigning(false)}
            style={{ background: 'transparent', border: '1px solid #333', borderRadius: '4px', color: '#888', fontSize: '11px', cursor: 'pointer', padding: '3px 8px' }}
          >
            ← Back
          </button>
          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            LFO {lfoIndex} Destination
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {DEST_GROUPS.map(group => (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                {group}
              </span>
              {DESTINATIONS.filter(d => d.group === group).map(d => (
                <button
                  key={d.value}
                  onClick={() => { update({ destination: d.value }); setAssigning(false); }}
                  style={{
                    padding: '5px 10px',
                    background: destination === d.value ? '#4a9eff' : 'transparent',
                    border: '1px solid',
                    borderColor: destination === d.value ? '#4a9eff' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: destination === d.value ? '#fff' : '#666',
                    fontSize: '10px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Normal panel ──────────────────────────────────────────────────────────
  return (
    <Panel spread>

      {/* Mode tabs + Wave */}
      <PanelGroup gap={20}>
        <TabSelect options={MODES} value={mode} onChange={(v) => update({ mode: v })} />
        <LFOWave speed={speed} depth={depth} waveform={waveform} color={lfoIndex === 1 ? colors.section.lfo1 : colors.section.lfo2} onWaveformChange={(v) => update({ waveform: v })} />
      </PanelGroup>

      {/* Speed + Depth sliders */}
      <LFOSliders
        speed={speed}
        depth={depth}
        lfoIndex={lfoIndex}
        onSpeedChange={(v) => update({ speed: v })}
        onDepthChange={(v) => update({ depth: v })}
      />

      {/* Destination */}
      <PanelGroup>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Destination</span>
        <button
          onClick={() => setAssigning(true)}
          style={{
            padding: '5px 10px',
            background: activeDest ? 'rgba(74,158,255,0.12)' : 'transparent',
            border: '1px solid',
            borderColor: activeDest ? '#4a9eff' : '#333',
            borderRadius: '4px',
            color: activeDest ? '#4a9eff' : '#555',
            fontSize: '10px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {activeDest ? activeDest.label : 'None'} ›
        </button>
      </PanelGroup>

      {/* Mult + Fade knobs */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <PanelKnob color={lfoIndex === 1 ? colors.section.lfo1 : colors.section.lfo2} label="Mult" value={(multiplier - 1) / 7} onChange={(v) => update({ multiplier: Math.round(v * 7) + 1 })} />
        <PanelKnob color={lfoIndex === 1 ? colors.section.lfo1 : colors.section.lfo2} label="Fade" value={(fade + 64) / 127} onChange={(v) => update({ fade: Math.round(v * 127) - 64 })} />
      </div>


    </Panel>
  );
}
