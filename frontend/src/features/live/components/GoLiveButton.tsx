import { useNavigate } from "react-router-dom";
import { useCreateLiveStream } from "../hooks";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";
import type { LiveStreamCreate } from "@/types";

export function GoLiveButton() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createStream = useCreateLiveStream();

  const handleGoLive = async () => {
    try {
      const data: LiveStreamCreate = { title: "Untitled Live Stream", privacy: "everyone" };
      const stream = await createStream.mutateAsync(data);
      navigate(`/live/${stream.id}`);
    } catch {
      toast({ title: "Error", description: "Failed to create live stream", variant: "destructive" });
    }
  };

  return (
    <Button onClick={handleGoLive} disabled={createStream.isPending} className="rounded-full bg-red-500 hover:bg-red-600">
      <Radio className="mr-2 h-4 w-4" />
      {createStream.isPending ? "Creating..." : "Go Live"}
    </Button>
  );
}
