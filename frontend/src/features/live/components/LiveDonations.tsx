import { useState } from "react";
import { useSendDonation, useDonations } from "../hooks";
import { useToast } from "@/hooks/useToast";
import type { LiveDonation } from "@/types";

interface LiveDonationsProps {
  streamId: string;
  allowDonations: boolean;
}

export function LiveDonations({ streamId, allowDonations }: LiveDonationsProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();
  const sendDonation = useSendDonation();
  const { data: donationsData } = useDonations(streamId);

  const donations = donationsData?.pages.flatMap((page) => page.donations) ?? [];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || sendDonation.isPending) return;

    try {
      await sendDonation.mutateAsync({
        streamId,
        data: {
          amount: parseFloat(amount),
          currency: "USD",
          message: message.trim() || undefined,
          is_anonymous: isAnonymous,
        },
      });
      setAmount("");
      setMessage("");
      setIsAnonymous(false);
      toast({
        title: "Success",
        description: "Donation sent successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send donation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-bold text-white">Donations</h3>
      </div>

      {allowDonations ? (
        <form onSubmit={handleDonate} className="p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`flex-1 py-1 text-sm rounded ${
                  amount === preset.toString()
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Custom amount ($)"
            min="0.01"
            step="0.01"
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-500"
            />
            Donate anonymously
          </label>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || sendDonation.isPending}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            {sendDonation.isPending ? "Sending..." : "Donate"}
          </button>
        </form>
      ) : (
        <div className="p-3 text-center text-gray-400 text-sm">
          Donations are disabled
        </div>
      )}

      {donations.length > 0 && (
        <div className="border-t border-gray-700 p-3 space-y-2 max-h-48 overflow-y-auto">
          {donations.map((donation: LiveDonation) => (
            <div key={donation.id} className="flex items-center gap-2 text-sm">
              <span className="shrink-0 text-green-400 font-medium">${donation.amount}</span>
              <span className="shrink-0 text-gray-300">
                {donation.is_anonymous ? "Anonymous" : donation.user?.username || "User"}
              </span>
              {donation.message && (
                <span className="min-w-0 truncate text-gray-500">- {donation.message}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
