interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative h-2 w-full rounded-full bg-theme-muted">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-theme-primary to-theme-chart4"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
      />
    </div>
  );
}
