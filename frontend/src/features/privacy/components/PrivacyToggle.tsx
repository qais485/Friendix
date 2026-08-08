import { Switch } from "@/components/ui/switch";

interface PrivacyToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function PrivacyToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: PrivacyToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium break-words">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground break-words">{description}</p>
        )}
      </div>
      <span className="shrink-0">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </span>
    </div>
  );
}
