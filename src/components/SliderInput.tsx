interface SliderInputProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export function SliderInput({ label, leftLabel, rightLabel, value, onChange }: SliderInputProps) {
  const pct = ((value - 1) / 9) * 100;
  const trackStyle = {
    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="text-[11px] font-mono" style={{ color: 'var(--accent)' }}>{value}/10</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-20 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{leftLabel}</span>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
          style={trackStyle}
        />
        <span className="text-[11px] w-20 shrink-0" style={{ color: 'var(--text-muted)' }}>{rightLabel}</span>
      </div>
    </div>
  );
}
