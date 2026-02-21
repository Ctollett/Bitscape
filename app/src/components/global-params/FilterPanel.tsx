export function FilterPanel() {
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
          Filter Controls
        </div>
        <div style={{ color: '#666', fontSize: '11px' }}>
          Cutoff, resonance, filter type
        </div>
      </div>
    </div>
  );
}
