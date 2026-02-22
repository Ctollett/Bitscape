import { usePatch } from '../../fm-canvas/patch-context';

export function ReverbPanel() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ enabled: boolean; decay: number; damping: number; mix: number }>) =>
    dispatch({
      type: 'SET_REVERB',
      enabled: patch.reverbEnabled,
      decay: patch.reverbDecay,
      damping: patch.reverbDamping,
      mix: patch.reverbMix,
      ...partial,
    });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: '32px', padding: '12px 24px' }}>

      {/* Enable toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>On</span>
        <button
          onClick={() => update({ enabled: !patch.reverbEnabled })}
          style={{
            width: '36px', height: '20px',
            background: patch.reverbEnabled ? '#4a9eff' : '#222',
            border: '1px solid', borderColor: patch.reverbEnabled ? '#4a9eff' : '#333',
            borderRadius: '10px', cursor: 'pointer',
            position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute', top: '2px',
            left: patch.reverbEnabled ? '18px' : '2px',
            width: '14px', height: '14px',
            background: '#fff', borderRadius: '50%',
            transition: 'left 0.15s',
          }} />
        </button>
      </div>

      {/* Decay */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Decay</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbDecay * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01}
          value={patch.reverbDecay}
          onChange={e => update({ decay: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Damping */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Damping</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbDamping * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01}
          value={patch.reverbDamping}
          onChange={e => update({ damping: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Mix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Mix</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.reverbMix * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01}
          value={patch.reverbMix}
          onChange={e => update({ mix: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

    </div>
  );
}
