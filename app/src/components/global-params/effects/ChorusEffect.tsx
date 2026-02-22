import { usePatch } from '../../../fm-canvas/patch-context';

export function ChorusEffect() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ enabled: boolean; depth: number; speed: number; width: number; hpfCutoff: number; delayMs: number; reverbSend: number }>) =>
    dispatch({ 
      type: 'SET_CHORUS', 
      enabled: patch.chorusEnabled, 
      depth: patch.chorusDepth, 
      speed: patch.chorusSpeed, 
      width: patch.chorusWidth,
      hpfCutoff: patch.chorusHpfCutoff,
      delayMs: patch.chorusDelayMs,
      reverbSend: patch.chorusReverbSend,
      ...partial 
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header with toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Chorus
        </span>
        <button 
          onClick={() => update({ enabled: !patch.chorusEnabled })} 
          style={{
            width: '32px', 
            height: '18px',
            background: patch.chorusEnabled ? '#4a9eff' : '#222',
            border: '1px solid', 
            borderColor: patch.chorusEnabled ? '#4a9eff' : '#333',
            borderRadius: '9px', 
            cursor: 'pointer', 
            position: 'relative',
          }}
        >
          <span style={{ 
            position: 'absolute', 
            top: '2px', 
            left: patch.chorusEnabled ? '15px' : '2px', 
            width: '12px', 
            height: '12px', 
            background: '#fff', 
            borderRadius: '50%', 
            transition: 'left 0.15s' 
          }} />
        </button>
      </div>

      {/* Depth */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Depth</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.chorusDepth * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={patch.chorusDepth}
          onChange={e => update({ depth: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Speed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Speed</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.chorusSpeed.toFixed(1)}Hz</span>
        </div>
        <input type="range" min={0.1} max={10} step={0.1} value={patch.chorusSpeed}
          onChange={e => update({ speed: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Width</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.chorusWidth * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={patch.chorusWidth}
          onChange={e => update({ width: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* HPF Cutoff */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>HPF</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.chorusHpfCutoff}Hz</span>
        </div>
        <input type="range" min={20} max={2000} step={1} value={patch.chorusHpfCutoff}
          onChange={e => update({ hpfCutoff: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Delay Ms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Delay</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.chorusDelayMs.toFixed(1)}ms</span>
        </div>
        <input type="range" min={1} max={30} step={0.1} value={patch.chorusDelayMs}
          onChange={e => update({ delayMs: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Reverb Send */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Verb Send</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.chorusReverbSend * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={patch.chorusReverbSend}
          onChange={e => update({ reverbSend: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>
    </div>
  );
}
