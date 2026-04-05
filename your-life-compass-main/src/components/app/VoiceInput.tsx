import { useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useScribe, CommitStrategy } from "@elevenlabs/react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput = ({ onTranscript, disabled, className = "" }: VoiceInputProps) => {
  const [connecting, setConnecting] = useState(false);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => {
      // Partial updates shown live if needed
    },
    onCommittedTranscript: (data) => {
      if (data.text?.trim()) {
        onTranscript(data.text.trim());
      }
    },
  });

  const handleToggle = useCallback(async () => {
    if (scribe.isConnected) {
      scribe.disconnect();
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      if (error || !data?.token) {
        throw new Error("Failed to get transcription token");
      }

      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error("Voice input error:", err);
    } finally {
      setConnecting(false);
    }
  }, [scribe]);

  const isActive = scribe.isConnected;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={isActive ? "destructive" : "outline"}
        size="icon"
        onClick={handleToggle}
        disabled={disabled || connecting}
        className="shrink-0 relative"
        aria-label={isActive ? "Stop recording" : "Start voice input"}
      >
        {connecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <>
            <MicOff className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      {isActive && scribe.partialTranscript && (
        <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
          {scribe.partialTranscript}
        </span>
      )}
    </div>
  );
};

export default VoiceInput;
