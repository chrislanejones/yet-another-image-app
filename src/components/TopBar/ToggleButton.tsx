interface ToggleButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  shortcut?: string;
  showShortcut?: boolean;
  onClick: () => void;
}

export function ToggleButton({
  icon: Icon,
  label,
  active,
  shortcut,
  showShortcut,
  onClick,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-theme-primary text-theme-primary-foreground"
          : "text-theme-muted-foreground hover:text-theme-foreground hover:bg-accent"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {showShortcut && shortcut && (
        <kbd className="hidden sm:inline text-xs px-1.5 rounded bg-theme-primary text-black">
          Alt {shortcut}
        </kbd>
      )}
    </button>
  );
}
