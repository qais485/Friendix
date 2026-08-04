import { useState } from "react";
import { Search } from "lucide-react";
import { useSearchMessages } from "../hooks";
import type { Message } from "@/types";

interface ConversationSearchProps {
  conversationId?: string;
  onSelectMessage: (message: Message) => void;
  onClose: () => void;
}

export function ConversationSearch({ conversationId, onSelectMessage, onClose }: ConversationSearchProps) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearchMessages(query, conversationId);

  return (
    <div className="border-b bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search in conversation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          &times;
        </button>
      </div>

      {query.length > 0 && (
        <div className="max-h-60 overflow-y-auto border-t">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : results && results.messages.length > 0 ? (
            <div className="divide-y">
              {results.messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => onSelectMessage(msg)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {msg.sender_name}
                    </p>
                    <p className="truncate text-sm">{msg.content}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
