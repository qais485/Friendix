import { useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./EmojiPicker";

interface TextPanelProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MAX_CONTENT_LENGTH = 500;

const TOKEN_PATTERN = /(^|\s)(#[\w]+|@[\w.]+)/g;

function renderHighlight(content: string) {
  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(TOKEN_PATTERN.source, "g");

  while ((match = re.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index), highlighted: false });
    }
    const prefix = match[1];
    const token = match[2];
    parts.push({ text: prefix, highlighted: false });
    parts.push({ text: token, highlighted: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex), highlighted: false });
  }
  return parts;
}

export function TextPanel({ content, onChange, placeholder = "What's on your mind?" }: TextPanelProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const remaining = MAX_CONTENT_LENGTH - content.length;
  const hasTokens = TOKEN_PATTERN.test(content);

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
        placeholder={placeholder}
        className="min-h-[72px] w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
      />

      {hasTokens && (
        <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm leading-relaxed">
          {renderHighlight(content).map((part, index) =>
            part.highlighted ? (
              <span key={index} className="font-medium text-primary">
                {part.text}
              </span>
            ) : (
              <span key={index} className="text-muted-foreground">
                {part.text}
              </span>
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              showEmoji && "bg-muted text-foreground"
            )}
          >
            <Smile className="h-4 w-4" />
            Emoji
          </button>
          {showEmoji && (
            <EmojiPicker
              onSelect={(emoji) => {
                onChange(content + emoji);
                setShowEmoji(false);
              }}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        <span
          className={cn(
            "text-xs tabular-nums",
            remaining < 0
              ? "font-medium text-destructive"
              : remaining <= 50
              ? "text-amber-500"
              : "text-muted-foreground"
          )}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
