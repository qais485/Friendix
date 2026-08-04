import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupPolls, useCreatePoll, useVotePoll } from "../hooks";
import { formatDistanceToNow } from "@/lib/utils";
import type { Group } from "@/types";

interface GroupPollsProps {
  group: Group;
}

export function GroupPolls({ group }: GroupPollsProps) {
  const { data: polls, isPending } = useGroupPolls(group.slug);
  const createMutation = useCreatePoll();
  const voteMutation = useVotePoll();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const canCreate = group.is_member;

  const handleCreate = () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    createMutation.mutate(
      { slug: group.slug, question: question.trim(), options: validOptions },
      { onSuccess: () => { setQuestion(""); setOptions(["", ""]); setShowForm(false); } }
    );
  };

  const addOption = () => setOptions([...options, ""]);

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canCreate && (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Create Poll"}
          </Button>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl glass-card p-4 space-y-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              {options.map((opt, idx) => (
                <input key={idx} value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }} placeholder={`Option ${idx + 1}`} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              ))}
              <Button variant="ghost" size="sm" onClick={addOption}>+ Add Option</Button>
              <Button size="sm" onClick={handleCreate} disabled={!question.trim() || options.filter((o) => o.trim()).length < 2 || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <BarChart3 className="h-4 w-4 mr-1" />}
                Create
              </Button>
            </motion.div>
          )}
        </>
      )}

      {!polls || polls.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No polls yet</p>
        </div>
      ) : (
        polls.map((poll, i) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl glass-card p-4"
          >
            <p className="font-semibold text-sm">{poll.question}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {poll.total_votes} votes · by {poll.username || "Unknown"}
              {poll.expires_at && ` · ends ${formatDistanceToNow(new Date(poll.expires_at))}`}
            </p>
            <div className="mt-3 space-y-2">
              {poll.options.map((opt, idx) => {
                const count = poll.option_votes[idx] || 0;
                const pct = poll.total_votes > 0 ? Math.round((count / poll.total_votes) * 100) : 0;
                const isSelected = poll.user_vote === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (poll.user_vote === null) {
                        voteMutation.mutate({ slug: group.slug, pollId: poll.id, optionIndex: idx });
                      }
                    }}
                    className={`relative w-full rounded-lg border p-2.5 text-left text-sm transition-all overflow-hidden ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    disabled={poll.user_vote !== null}
                  >
                    <div
                      className="absolute inset-0 bg-primary/10 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative flex items-center justify-between">
                      <span>{opt}</span>
                      <span className="text-xs text-muted-foreground font-medium">{pct}%</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
