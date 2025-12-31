import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Phone, PhoneOff, Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceCallWidgetProps {
  agentId?: string;
  className?: string;
}

export function VoiceCallWidget({ agentId, className }: VoiceCallWidgetProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      toast({
        title: "Connected",
        description: "Voice call started. Speak now!",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      toast({
        title: "Call Ended",
        description: "Voice call has ended.",
      });
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to voice agent. Please try again.",
      });
    },
  });

  const startConversation = useCallback(async () => {
    if (!agentId) {
      toast({
        variant: "destructive",
        title: "Configuration Required",
        description: "Please configure an ElevenLabs Agent ID to use voice calls.",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        {
          body: { agent_id: agentId }
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to get conversation token");
      }

      if (!data?.token) {
        throw new Error("No token received from server");
      }

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });

    } catch (error) {
      console.error("Failed to start conversation:", error);
      
      let errorMessage = "Failed to start voice call.";
      if (error instanceof Error) {
        if (error.message.includes("Permission denied") || error.message.includes("NotAllowedError")) {
          errorMessage = "Microphone access denied. Please allow microphone access to use voice calls.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, agentId, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isConnected ? (
          <>
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
            <span className="text-muted-foreground">
              {isSpeaking ? "AI is speaking..." : "Listening..."}
            </span>
            {isSpeaking && <Volume2 className="h-4 w-4 text-green-500 animate-pulse" />}
          </>
        ) : (
          <>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Ready to call</span>
          </>
        )}
      </div>

      {/* Audio visualization ring when connected */}
      {isConnected && (
        <div className="relative">
          <div className={`absolute inset-0 rounded-full ${isSpeaking ? 'bg-green-500/20' : 'bg-blue-500/20'} animate-ping`} style={{ animationDuration: '1.5s' }} />
          <div className={`absolute inset-0 rounded-full ${isSpeaking ? 'bg-green-500/10' : 'bg-blue-500/10'} animate-ping`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isSpeaking ? (
              <Volume2 className="h-10 w-10 text-green-600 animate-pulse" />
            ) : (
              <Mic className="h-10 w-10 text-blue-600 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Call button */}
      {!isConnected ? (
        <Button
          onClick={startConversation}
          disabled={isConnecting || !agentId}
          size="lg"
          className="gap-2 rounded-full px-8 py-6 text-lg bg-green-600 hover:bg-green-700 animate-pulse hover:animate-none"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Phone className="h-5 w-5" />
              Start Voice Call
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={stopConversation}
          size="lg"
          variant="destructive"
          className="gap-2 rounded-full px-8 py-6 text-lg"
        >
          <PhoneOff className="h-5 w-5" />
          End Call
        </Button>
      )}

      {/* Microphone indicator when connected */}
      {isConnected && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Call in progress</span>
        </div>
      )}

      {!agentId && (
        <p className="text-xs text-muted-foreground text-center max-w-[250px]">
          Configure an ElevenLabs Agent ID to enable voice calls
        </p>
      )}
    </div>
  );
}

export default VoiceCallWidget;
