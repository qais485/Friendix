import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupList, useMyGroups } from "./hooks";
import { GroupCard } from "./components/GroupCard";
import { CreateGroupModal } from "./components/CreateGroupModal";

export function GroupListPage() {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data: publicGroups, isPending } = useGroupList(query || undefined);
  const { data: myGroups } = useMyGroups();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pt-12 md:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gradient">Groups</h1>
                <p className="text-sm text-muted-foreground">Find and join communities</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="gap-1.5 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full rounded-full glass-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
            />
          </div>

          {/* My Groups */}
          {myGroups && myGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold px-1 text-gradient">Your Groups</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {myGroups.map((group, i) => (
                  <GroupCard key={group.id} group={group} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Public Groups */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold px-1 text-gradient">
              {query ? "Search Results" : "Public Groups"}
            </h3>
            {isPending ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !publicGroups || publicGroups.length === 0 ? (
              <div className="rounded-3xl glass-card p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Users className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="mt-5 text-base font-medium text-foreground">
                  {query ? `No groups found for "${query}"` : "No public groups yet"}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {query ? "Try a different search term" : "Be the first to create a group"}
                </p>
              </div>
            ) : (
              publicGroups.map((group, i) => (
                <GroupCard key={group.id} group={group} index={i} />
              ))
            )}
          </div>
        </motion.div>
      </div>

      <CreateGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(slug) => window.location.href = `/groups/${slug}`}
      />
    </div>
  );
}
