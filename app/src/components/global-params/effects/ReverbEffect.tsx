import { usePatch } from '../../../fm-canvas/patch-context';

export function ReverbEffect() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ enabled: boolean; decay: number; damping: number; mix: number }>) =>
    dispatch({ 
      type: 'SET_REVERB', 
      enabled: patch.reverbEnabled, 
      decay: patch.reverbDecay, 
      damping: patch.reverbDamping, 
      mix: patch.reverbMix, 
      ...partial 
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid #222', paddingRight: '16px' }}>
      {/* Header with toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Reverb
        </span>
        <button 
          onClick={() => update({ enabled: !patch.reverbEnabled })} 
          style={{
            width: '32px', 
            height: '18px',
            background: patch.reverbEnabled ? '#4a9eff' : '#222',
            border: '1px solid', 
            borderColor: patch.reverbEnabled ? '#4a9eff' : '#333',
            borderRadius: '9px', 
            cursor: 'pointer', 
            position: 'relative',
          }}
        >
          <span style={{ 
            position: 'absolute', 
            top: '2px', 
            left: patch.reverbEnabled ? '15px' : '2px', 
            width: '12px', 
            height: '12px', 
            background: '#fff', 
            borderRadius: '50%', 
            transition: 'left 0.15s' 
          }} />
        </button>
      </div>

      {/* Decay slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Decay
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbDecay * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01} 
          value={patch.reverbDecay}
          onChange={e => update({ decay: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Damping slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Damping
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbDamping * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01} 
          value={patch.reverbDamping}
          onChange={e => update({ damping: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Mix slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Mix
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbMix * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01} 
          value={patch.reverbMix}
          onChange={e => update({ mix: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>
    </div>
  );
}
