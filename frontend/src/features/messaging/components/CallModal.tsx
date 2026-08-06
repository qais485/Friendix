import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  X,
  User,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  callType: "audio" | "video";
}

type CallState = "ringing" | "connecting" | "active" | "ended";

export function CallModal({
  isOpen,
  onClose,
  conversationId: _conversationId,
  recipientName,
  recipientAvatar,
  callType: initialCallType,
}: CallModalProps) {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [callType, setCallType] = useState(initialCallType);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCallState("ringing");
      setCallDuration(0);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
      cleanupStreams();
      return;
    }

    setCallState("ringing");
    const ringTimer = setTimeout(() => {
      setCallState("connecting");
      setTimeout(() => setCallState("active"), 1500);
    }, 3000);

    return () => clearTimeout(ringTimer);
  }, [isOpen]);

  useEffect(() => {
    if (callState !== "active") return;
    const interval = setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (callState === "active" && callType === "video") {
      startLocalVideo();
    }
    return () => cleanupStreams();
  }, [callState, callType]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      setIsVideoOff(true);
    }
  };

  const cleanupStreams = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
  };

  const handleEndCall = useCallback(() => {
    setCallState("ended");
    cleanupStreams();
    setTimeout(onClose, 1000);
  }, [onClose]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setIsScreenSharing(false);
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        setIsScreenSharing(true);
      } catch {
        // user cancelled
      }
    }
  };

  const toggleCallType = () => {
    if (callType === "audio") {
      setCallType("video");
    } else {
      setIsVideoOff(true);
      setCallType("audio");
      cleanupStreams();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative flex w-full max-w-md flex-col items-center rounded-2xl bg-background p-8 shadow-2xl"
        >
          <button
            onClick={handleEndCall}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          {callType === "video" && callState === "active" && (
            <div className="mb-4 w-full overflow-hidden rounded-xl bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                preload="auto"
                className="h-64 w-full object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                preload="auto"
                className="absolute bottom-20 right-6 h-24 w-32 rounded-lg border-2 border-white object-cover"
              />
            </div>
          )}

          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              {recipientAvatar ? (
                <OptimizedImage
                  src={recipientAvatar}
                  alt={recipientName}
                  preset="avatar"
                  eager
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-semibold">{recipientName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {callState === "ringing" && "Ringing..."}
              {callState === "connecting" && "Connecting..."}
              {callState === "active" && formatDuration(callDuration)}
              {callState === "ended" && "Call ended"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`rounded-full p-3 transition-colors ${
                isMuted ? "bg-destructive text-destructive-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {callType === "video" && (
              <>
                <button
                  onClick={toggleVideo}
                  className={`rounded-full p-3 transition-colors ${
                    isVideoOff ? "bg-destructive text-destructive-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleScreenShare}
                  className={`rounded-full p-3 transition-colors ${
                    isScreenSharing ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Monitor className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              onClick={toggleCallType}
              className="rounded-full bg-muted p-3 hover:bg-muted/80"
            >
              {callType === "audio" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            </button>

            <button
              onClick={handleEndCall}
              className="rounded-full bg-destructive p-3 text-destructive-foreground hover:bg-destructive/90"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
