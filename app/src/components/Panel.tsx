import { panel } from '../tokens';

interface PanelProps {
  children: React.ReactNode;
  spread?: boolean;
  top?: boolean;
}

export function Panel({ children, spread }: PanelProps) {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      boxSizing: 'border-box',
      gap: panel.gap.control,
      justifyContent: spread ? 'space-between' : 'flex-start',
    }}>
      {children}
    </div>
  );
}
