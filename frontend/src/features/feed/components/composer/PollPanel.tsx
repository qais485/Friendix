import { Plus, X, BarChart3, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const POLL_DURATIONS = [
  { value: "off", label: "No end" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
] as const;

export type PollDuration = (typeof POLL_DURATIONS)[number]["value"];

interface PollPanelProps {
  question: string;
  options: string[];
  duration: PollDuration;
  anonymous: boolean;
  onChangeQuestion: (value: string) => void;
  onChangeOption: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onChangeDuration: (value: PollDuration) => void;
  onChangeAnonymous: (value: boolean) => void;
}

export function PollPanel({
  question,
  options,
  duration,
  anonymous,
  onChangeQuestion,
  onChangeOption,
  onAddOption,
  onRemoveOption,
  onChangeDuration,
  onChangeAnonymous,
}: PollPanelProps) {
  const canAdd = options.length < 6;

  return (
    <div className="space-y-3">
      <input
        value={question}
        onChange={(e) => onChangeQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground"
      />

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <input
              value={option}
              onChange={(e) => onChangeOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(index)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type="button"
          onClick={onAddOption}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add option
        </button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Voting ends</label>
          <select
            value={duration}
            onChange={(e) => onChangeDuration(e.target.value as PollDuration)}
            className="h-8 rounded-lg border bg-transparent px-2 text-xs text-foreground outline-none"
          >
            {POLL_DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={anonymous} onCheckedChange={onChangeAnonymous} />
          <Label className="text-xs font-normal text-muted-foreground">Anonymous</Label>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </div>
        <div className="rounded-2xl glass-card p-3">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
            <span className="break-words">{question.trim() || "Your question"}</span>
          </div>
          <div className="mt-2.5 space-y-1.5">
            {options
              .filter((o) => o.trim() !== "")
              .map((option, index) => (
                <div
                  key={index}
                  className="rounded-lg border px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="break-words">{option}</span>
                </div>
              ))}
            {options.every((o) => o.trim() === "") && (
              <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                Add options to see your poll take shape
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
