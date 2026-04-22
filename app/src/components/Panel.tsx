import { panel } from '../tokens';

interface PanelProps {
  children: React.ReactNode;
  spread?: boolean;
  stretch?: boolean;
}

export function Panel({ children, spread, stretch }: PanelProps) {
  return (
    <div style={{
      width: '100%',
      height: stretch ? '100%' : undefined,
      display: 'flex',
      alignItems: stretch ? 'stretch' : 'flex-end',
      alignSelf: stretch ? 'stretch' : undefined,
      boxSizing: 'border-box',
      gap: panel.gap.control,
      justifyContent: spread ? 'space-between' : 'flex-start',
    }}>
      {children}
    </div>
  );
}
