import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/features/profile/hooks";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

interface UserSearchProps {
  onSelect: (userId: string) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function UserSearch({
  onSelect,
  excludeIds = [],
  placeholder = "Search users...",
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const searchUsers = useSearchUsers();

  const handleSearch = async () => {
    if (!query.trim()) return;
    await searchUsers.mutateAsync(query);
  };

  const filteredResults = (searchUsers.data || []).filter(
    (user) => !excludeIds.includes(user.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={!query.trim() || searchUsers.isPending} className="shrink-0">
          {searchUsers.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {filteredResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-h-60 overflow-y-auto rounded-lg border"
        >
          {filteredResults.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelect(user.id);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted"
            >
              {user.avatar_url ? (
                <img
                  src={getCloudinaryTransformedUrl(user.avatar_url, "avatar")}
                  alt={user.full_name || "User"}
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-medium text-muted-foreground">
                    {(user.full_name || user.username || "U")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.full_name || "User"}</p>
                {user.username && (
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                )}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
