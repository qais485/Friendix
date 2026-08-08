import { Button } from "@/components/ui/button";
import { FEED_TABS } from "@/types";
import type { FeedType } from "@/types";
import { cn } from "@/lib/utils";

interface FeedTabsProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {FEED_TABS.map((tab) => (
        <Button
          key={tab.key}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange(tab.key as FeedType)}
          className={cn(
            "rounded-full px-4 text-sm font-semibold transition-all duration-200",
            activeTab === tab.key
              ? "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:bg-muted/60 hover:backdrop-blur-sm"
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
