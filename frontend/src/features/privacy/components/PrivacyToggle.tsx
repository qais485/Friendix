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
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
