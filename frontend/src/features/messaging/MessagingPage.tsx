import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessagingStore } from "@/store/messagingStore";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";

export function MessagingPage() {
  const { connectWebSocket, disconnectWebSocket, isConnected } = useMessagingStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !isConnected) {
      connectWebSocket(token);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, isConnected]);

  useEffect(() => {
    const handleOnline = () => {
      const store = useMessagingStore.getState();
      store.sendWsMessage({ type: "online_status", is_online: true });
    };
    const handleOffline = () => {
      const store = useMessagingStore.getState();
      store.sendWsMessage({ type: "online_status", is_online: false });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <AnimatePresence mode="wait">
        {isMobile ? (
          <motion.div
            key={selectedConversationId ? "chat" : "list"}
            initial={{ x: selectedConversationId ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: selectedConversationId ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <ChatList
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
              />
            )}
          </motion.div>
        ) : (
          <>
            <div className="w-full max-w-[350px] flex-shrink-0 h-full border-r bg-card">
              <ChatList
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
              />
            </div>
            <div className="flex-1 h-full">
              <ChatWindow
                conversationId={selectedConversationId || ""}
                onBack={() => setSelectedConversationId(null)}
              />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
