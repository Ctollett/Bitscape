import { usePatch } from '../../../fm-canvas/patch-context';

export function DelayEffect() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ enabled: boolean; ms: number; feedback: number; mix: number }>) =>
    dispatch({ 
      type: 'SET_DELAY', 
      enabled: patch.delayEnabled, 
      ms: patch.delayMs, 
      feedback: patch.delayFeedback, 
      mix: patch.delayMix, 
      ...partial 
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid #222', paddingRight: '16px' }}>
      {/* Header with toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Delay
        </span>
        <button 
          onClick={() => update({ enabled: !patch.delayEnabled })} 
          style={{
            width: '32px', 
            height: '18px',
            background: patch.delayEnabled ? '#4a9eff' : '#222',
            border: '1px solid', 
            borderColor: patch.delayEnabled ? '#4a9eff' : '#333',
            borderRadius: '9px', 
            cursor: 'pointer', 
            position: 'relative',
          }}
        >
          <span style={{ 
            position: 'absolute', 
            top: '2px', 
            left: patch.delayEnabled ? '15px' : '2px', 
            width: '12px', 
            height: '12px', 
            background: '#fff', 
            borderRadius: '50%', 
            transition: 'left 0.15s' 
          }} />
        </button>
      </div>

      {/* Time slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Time
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.delayMs}ms</span>
        </div>
        <input 
          type="range" 
          min={10} 
          max={1000} 
          step={1} 
          value={patch.delayMs}
          onChange={e => update({ ms: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Feedback slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Feedback
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.delayFeedback * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={0.99} 
          step={0.01} 
          value={patch.delayFeedback}
          onChange={e => update({ feedback: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Mix slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Mix
          </span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{Math.round(patch.delayMix * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01} 
          value={patch.delayMix}
          onChange={e => update({ mix: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>
    </div>
  );
}
