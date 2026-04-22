interface EffectCardFrontProps {
  design: React.ReactNode;
  enabled: boolean;
}

export function EffectCardFront({ design, enabled }: EffectCardFrontProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120, opacity: enabled ? 1 : 0.25 }}>
      {design}
    </div>
  );
}
