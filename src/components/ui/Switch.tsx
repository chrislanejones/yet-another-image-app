interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        checked ? "bg-theme-primary" : "bg-theme-input"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-200 ${
          checked ? "left-6 bg-theme-primary-foreground" : "left-1 bg-theme-foreground"
        }`}
      />
    </button>
  );
}
