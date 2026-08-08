import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Smile,
  Link as LinkIcon,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./EmojiPicker";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  backgroundMode?: boolean;
}

export const MAX_CONTENT_LENGTH = 5000;

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
  variant = "default",
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "glass";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "glass"
          ? cn(
              "text-white/70 hover:bg-white/20 hover:text-white",
              isActive && "bg-white/25 text-white"
            )
          : cn(
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              isActive && "bg-primary/10 text-primary hover:bg-primary/15"
            )
      )}
    >
      {children}
    </button>
  );
}

function LinkDialog({
  isOpen,
  onClose,
  onApply,
  initialUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (url: string) => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute bottom-full right-0 z-30 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl glass-card p-3 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Insert Link</span>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        ref={inputRef}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (url.trim()) onApply(url.trim());
          }
        }}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (url.trim()) onApply(url.trim());
          }}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </button>
      </div>
    </motion.div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "What's on your mind?",
  backgroundMode = false,
}: RichTextEditorProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline",
        },
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none w-full break-words px-0 py-0 leading-relaxed focus:outline-none",
          backgroundMode
            ? "min-h-[120px] text-center text-2xl font-bold text-white drop-shadow-lg [&_.is-editor-empty:first-child::before]:text-white/50"
            : "min-h-[72px] text-sm [&_.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = editor.getText();
      if (plainText.length <= MAX_CONTENT_LENGTH) {
        onChange(html === "<p></p>" ? "" : html);
      }
    },
  });

  const plainTextLength = editor?.getText().length || 0;
  const remaining = MAX_CONTENT_LENGTH - plainTextLength;

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      editor?.chain().focus().insertContent(emoji).run();
      setShowEmoji(false);
    },
    [editor]
  );

  const handleLinkApply = useCallback(
    (url: string) => {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      editor?.chain().focus().extendMarkRange("link").setLink({ href: fullUrl }).run();
      setShowLinkDialog(false);
    },
    [editor]
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, []);

  if (!editor) return null;

  if (backgroundMode) {
    return (
      <div className="space-y-0">
        <EditorContent editor={editor} />
        {editor.getText().length > 0 && (
          <div className="flex items-center justify-center">
            <span className="text-xs tabular-nums text-white/50">
              {remaining}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="group/toolbar rounded-t-xl border border-b-0 bg-muted/30 px-2 py-1.5 transition-all focus-within:border-primary/30 focus-within:bg-muted/50">
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <div className="relative">
            <ToolbarButton
              onClick={() => {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkDialog(true);
                }
              }}
              isActive={editor.isActive("link")}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <AnimatePresence>
              <LinkDialog
                isOpen={showLinkDialog}
                onClose={() => setShowLinkDialog(false)}
                onApply={handleLinkApply}
                initialUrl={editor.getAttributes("link")?.href}
              />
            </AnimatePresence>
          </div>

          <div className="relative">
            <ToolbarButton
              onClick={() => setShowEmoji(!showEmoji)}
              isActive={showEmoji}
              title="Emoji"
            >
              <Smile className="h-4 w-4" />
            </ToolbarButton>
            <AnimatePresence>
              {showEmoji && (
                <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="min-h-[72px] rounded-b-xl border border-t-0 px-3 py-2 focus-within:border-primary/30">
        <EditorContent editor={editor} />
      </div>

      {editor.getText().length > 0 && (
        <div className="flex items-center justify-end">
          <span
            className={cn(
              "text-xs tabular-nums",
              remaining < 0
                ? "font-medium text-destructive"
                : remaining <= 100
                ? "text-amber-500"
                : "text-muted-foreground"
            )}
          >
            {remaining}
          </span>
        </div>
      )}
    </div>
  );
}
