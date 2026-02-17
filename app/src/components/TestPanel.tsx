import { useState } from 'react';
import { setParam } from '../audio/engine';

// ─── tiny slider helper ─────────────────────────────────────────────────────
function Slider({
  label, min, max, step, value, onChange,
}: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-value">{value.toFixed(step < 1 ? 2 : 0)}</span>
    </label>
  );
}

function Toggle({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Select({
  label, options, value, onChange,
}: { label: string; options: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))}>
        {options.map((o, i) => <option key={i} value={i}>{o}</option>)}
      </select>
    </label>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <span>{open ? '▾' : '▸'} {title}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

// Wave type IDs matching oscillator.rs WaveType enum
const WAVE_TYPES = ['Sine', 'Triangle', 'Saw', 'Square', 'Noise'];
const FILTER_TYPES = ['LowPass', 'HighPass', 'BandPass'];
const ALGORITHMS = ['1→2→3→4', '1+2→3→4', '1→2+3→4', '(1+2)→(3+4)', '1→2→3+4', '1→(2+3+4)', '(1+2+3)→4', '1+2+3+4'];

export default function TestPanel() {
  // Amp ADSR
  const [attack, setAttack] = useState(0);
  const [decay, setDecay] = useState(0);
  const [sustain, setSustain] = useState(127);
  const [release, setRelease] = useState(10);

  // Oscillator
  const [algorithm, setAlgorithm] = useState(0);
  const [carrierMix, setCarrierMix] = useState(0.5);
  const [detune, setDetune] = useState(0);
  const [harm, setHarm] = useState(0);
  const [feedback, setFeedback] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [pan, setPan] = useState(0.5);

  // Operator waveforms
  const [wave0, setWave0] = useState(0);
  const [wave1, setWave1] = useState(0);
  const [wave2, setWave2] = useState(0);
  const [wave3, setWave3] = useState(0);

  // Ratios
  const [ratioC, setRatioC] = useState(1.0);
  const [ratioA, setRatioA] = useState(1.0);
  const [ratioB1, setRatioB1] = useState(1.0);
  const [ratioB2, setRatioB2] = useState(1.0);

  // Mod depth
  const [modDepthA, setModDepthA] = useState(0);
  const [modDepthB, setModDepthB] = useState(0);

  // Mod envelopes
  const [modEnvAAttack, setModEnvAAttack] = useState(0);
  const [modEnvADecay, setModEnvADecay] = useState(0);
  const [modEnvAEnd, setModEnvAEnd] = useState(127);
  const [modEnvBAttack, setModEnvBAttack] = useState(0);
  const [modEnvBDecay, setModEnvBDecay] = useState(0);
  const [modEnvBEnd, setModEnvBEnd] = useState(127);

  // Filter
  const [filterType, setFilterType] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(20000);
  const [filterRes, setFilterRes] = useState(0.707);
  const [filterAttack, setFilterAttack] = useState(0);
  const [filterDecay, setFilterDecay] = useState(0);
  const [filterSustain, setFilterSustain] = useState(127);
  const [filterRelease, setFilterRelease] = useState(10);
  const [filterEnvAmt, setFilterEnvAmt] = useState(0);

  // Effects toggles
  const [delayOn, setDelayOn] = useState(false);
  const [reverbOn, setReverbOn] = useState(false);
  const [chorusOn, setChorusOn] = useState(false);

  // Delay
  const [delayMs, setDelayMs] = useState(500);
  const [delayFeedback, setDelayFeedback] = useState(0.5);
  const [delayMix, setDelayMix] = useState(0.5);

  // Reverb
  const [reverbDecay, setReverbDecay] = useState(0.84);
  const [reverbDamping, setReverbDamping] = useState(0.5);
  const [reverbMix, setReverbMix] = useState(0.3);

  // Chorus
  const [chorusDepth, setChorusDepth] = useState(0.5);
  const [chorusSpeed, setChorusSpeed] = useState(1.0);
  const [chorusWidth, setChorusWidth] = useState(0.5);
  const [chorusDelayMs, setChorusDelayMs] = useState(30);

  // Overdrive
  const [overdrive, setOverdrive] = useState(0);

  return (
    <div className="test-panel">
      <Section title="Amp Envelope">
        <Slider label="Attack" min={0} max={127} step={1} value={attack}
          onChange={(v) => { setAttack(v); setParam('set_amp_env', v, decay, sustain, release); }} />
        <Slider label="Decay" min={0} max={127} step={1} value={decay}
          onChange={(v) => { setDecay(v); setParam('set_amp_env', attack, v, sustain, release); }} />
        <Slider label="Sustain" min={0} max={127} step={1} value={sustain}
          onChange={(v) => { setSustain(v); setParam('set_amp_env', attack, decay, v, release); }} />
        <Slider label="Release" min={0} max={127} step={1} value={release}
          onChange={(v) => { setRelease(v); setParam('set_amp_env', attack, decay, sustain, v); }} />
      </Section>

      <Section title="Algorithm & Mix">
        <Select label="Algorithm" options={ALGORITHMS} value={algorithm}
          onChange={(v) => { setAlgorithm(v); setParam('set_algorithm', v); }} />
        <Slider label="Carrier Mix" min={0} max={1} step={0.01} value={carrierMix}
          onChange={(v) => { setCarrierMix(v); setParam('set_carrier_mix', v); }} />
        <Slider label="Feedback" min={0} max={127} step={1} value={feedback}
          onChange={(v) => { setFeedback(v); setParam('set_feedback', v); }} />
      </Section>

      <Section title="Oscillators">
        <Select label="Op 1 Wave" options={WAVE_TYPES} value={wave0}
          onChange={(v) => { setWave0(v); setParam('set_operator_waveform', 0, v); }} />
        <Select label="Op 2 Wave" options={WAVE_TYPES} value={wave1}
          onChange={(v) => { setWave1(v); setParam('set_operator_waveform', 1, v); }} />
        <Select label="Op 3 Wave" options={WAVE_TYPES} value={wave2}
          onChange={(v) => { setWave2(v); setParam('set_operator_waveform', 2, v); }} />
        <Select label="Op 4 Wave" options={WAVE_TYPES} value={wave3}
          onChange={(v) => { setWave3(v); setParam('set_operator_waveform', 3, v); }} />
        <Slider label="Ratio C" min={0.25} max={16} step={0.25} value={ratioC}
          onChange={(v) => { setRatioC(v); setParam('set_ratio_c', v); }} />
        <Slider label="Ratio A" min={0.25} max={16} step={0.25} value={ratioA}
          onChange={(v) => { setRatioA(v); setParam('set_ratio_a', v); }} />
        <Slider label="Ratio B1" min={0.25} max={16} step={0.25} value={ratioB1}
          onChange={(v) => { setRatioB1(v); setParam('set_ratio_b', v, ratioB2); }} />
        <Slider label="Ratio B2" min={0.25} max={16} step={0.25} value={ratioB2}
          onChange={(v) => { setRatioB2(v); setParam('set_ratio_b', ratioB1, v); }} />
        <Slider label="Detune" min={-1} max={1} step={0.01} value={detune}
          onChange={(v) => { setDetune(v); setParam('set_detune', v); }} />
        <Slider label="Harm" min={-26} max={26} step={0.5} value={harm}
          onChange={(v) => { setHarm(v); setParam('set_harm', v); }} />
      </Section>

      <Section title="Modulation">
        <Slider label="Mod Depth A" min={0} max={127} step={1} value={modDepthA}
          onChange={(v) => { setModDepthA(v); setParam('set_mod_depth_a', v); }} />
        <Slider label="Mod Depth B" min={0} max={127} step={1} value={modDepthB}
          onChange={(v) => { setModDepthB(v); setParam('set_mod_depth_b', v); }} />
        <Slider label="Mod Env A Atk" min={0} max={127} step={1} value={modEnvAAttack}
          onChange={(v) => { setModEnvAAttack(v); setParam('set_mod_env_a', v, modEnvADecay, modEnvAEnd); }} />
        <Slider label="Mod Env A Dec" min={0} max={127} step={1} value={modEnvADecay}
          onChange={(v) => { setModEnvADecay(v); setParam('set_mod_env_a', modEnvAAttack, v, modEnvAEnd); }} />
        <Slider label="Mod Env A End" min={0} max={127} step={1} value={modEnvAEnd}
          onChange={(v) => { setModEnvAEnd(v); setParam('set_mod_env_a', modEnvAAttack, modEnvADecay, v); }} />
        <Slider label="Mod Env B Atk" min={0} max={127} step={1} value={modEnvBAttack}
          onChange={(v) => { setModEnvBAttack(v); setParam('set_mod_env_b', v, modEnvBDecay, modEnvBEnd); }} />
        <Slider label="Mod Env B Dec" min={0} max={127} step={1} value={modEnvBDecay}
          onChange={(v) => { setModEnvBDecay(v); setParam('set_mod_env_b', modEnvBAttack, v, modEnvBEnd); }} />
        <Slider label="Mod Env B End" min={0} max={127} step={1} value={modEnvBEnd}
          onChange={(v) => { setModEnvBEnd(v); setParam('set_mod_env_b', modEnvBAttack, modEnvBDecay, v); }} />
      </Section>

      <Section title="Filter">
        <Select label="Type" options={FILTER_TYPES} value={filterType}
          onChange={(v) => { setFilterType(v); setParam('set_filter_type', v); }} />
        <Slider label="Cutoff" min={20} max={20000} step={1} value={filterCutoff}
          onChange={(v) => { setFilterCutoff(v); setParam('set_filter_cutoff', v); }} />
        <Slider label="Resonance" min={0.1} max={20} step={0.1} value={filterRes}
          onChange={(v) => { setFilterRes(v); setParam('set_filter_resonance', v); }} />
        <Slider label="Env Amount" min={-1} max={1} step={0.01} value={filterEnvAmt}
          onChange={(v) => { setFilterEnvAmt(v); setParam('set_filter_env_amount', v); }} />
        <Slider label="Attack" min={0} max={127} step={1} value={filterAttack}
          onChange={(v) => { setFilterAttack(v); setParam('set_filter_attack', v); }} />
        <Slider label="Decay" min={0} max={127} step={1} value={filterDecay}
          onChange={(v) => { setFilterDecay(v); setParam('set_filter_decay', v); }} />
        <Slider label="Sustain" min={0} max={127} step={1} value={filterSustain}
          onChange={(v) => { setFilterSustain(v); setParam('set_filter_sustain', v); }} />
        <Slider label="Release" min={0} max={127} step={1} value={filterRelease}
          onChange={(v) => { setFilterRelease(v); setParam('set_filter_release', v); }} />
      </Section>

      <Section title="Output">
        <Slider label="Volume" min={0} max={1} step={0.01} value={volume}
          onChange={(v) => { setVolume(v); setParam('set_volume', v); }} />
        <Slider label="Pan" min={0} max={1} step={0.01} value={pan}
          onChange={(v) => { setPan(v); setParam('set_pan', v); }} />
        <Slider label="Overdrive" min={0} max={1} step={0.01} value={overdrive}
          onChange={(v) => { setOverdrive(v); setParam('set_overdrive', v); }} />
      </Section>

      <Section title="Delay">
        <Toggle label="Enabled" value={delayOn}
          onChange={(v) => { setDelayOn(v); setParam('set_delay_enabled', v); }} />
        <Slider label="Time (ms)" min={1} max={2000} step={1} value={delayMs}
          onChange={(v) => { setDelayMs(v); setParam('set_delay_ms', v); }} />
        <Slider label="Feedback" min={0} max={0.99} step={0.01} value={delayFeedback}
          onChange={(v) => { setDelayFeedback(v); setParam('set_delay_feedback', v); }} />
        <Slider label="Mix" min={0} max={1} step={0.01} value={delayMix}
          onChange={(v) => { setDelayMix(v); setParam('set_delay_mix', v); }} />
      </Section>

      <Section title="Reverb">
        <Toggle label="Enabled" value={reverbOn}
          onChange={(v) => { setReverbOn(v); setParam('set_reverb_enabled', v); }} />
        <Slider label="Decay" min={0} max={0.99} step={0.01} value={reverbDecay}
          onChange={(v) => { setReverbDecay(v); setParam('set_reverb_decay', v); }} />
        <Slider label="Damping" min={0} max={0.9} step={0.01} value={reverbDamping}
          onChange={(v) => { setReverbDamping(v); setParam('set_reverb_damping', v); }} />
        <Slider label="Mix" min={0} max={1} step={0.01} value={reverbMix}
          onChange={(v) => { setReverbMix(v); setParam('set_reverb_mix', v); }} />
      </Section>

      <Section title="Chorus">
        <Toggle label="Enabled" value={chorusOn}
          onChange={(v) => { setChorusOn(v); setParam('set_chorus_enabled', v); }} />
        <Slider label="Depth" min={0} max={1} step={0.01} value={chorusDepth}
          onChange={(v) => { setChorusDepth(v); setParam('set_chorus_depth', v); }} />
        <Slider label="Speed (Hz)" min={0.1} max={10} step={0.1} value={chorusSpeed}
          onChange={(v) => { setChorusSpeed(v); setParam('set_chorus_speed', v); }} />
        <Slider label="Width" min={0} max={1} step={0.01} value={chorusWidth}
          onChange={(v) => { setChorusWidth(v); setParam('set_chorus_width', v); }} />
        <Slider label="Delay (ms)" min={1} max={100} step={1} value={chorusDelayMs}
          onChange={(v) => { setChorusDelayMs(v); setParam('set_chorus_delay_ms', v); }} />
      </Section>
    </div>
  );
}
