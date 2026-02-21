export function LFO2Panel() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>
          LFO 2
        </div>
        <div style={{ color: '#666', fontSize: '11px' }}>
          Rate, depth, waveform, destination
        </div>
      </div>
    </div>
  );
}
