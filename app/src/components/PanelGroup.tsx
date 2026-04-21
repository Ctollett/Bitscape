import { spacing } from '../tokens';

interface PanelGroupProps {
  children: React.ReactNode;
  gap?: number;
}

export function PanelGroup({ children, gap = spacing.sm }: PanelGroupProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap,
      alignSelf: 'flex-end',
    }}>
      {children}
    </div>
  );
}
