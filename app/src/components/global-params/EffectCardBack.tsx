interface EffectCardBackProps {
  children: React.ReactNode;
}

export function EffectCardBack({ children }: EffectCardBackProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 148 }}>
      {children}
    </div>
  );
}
