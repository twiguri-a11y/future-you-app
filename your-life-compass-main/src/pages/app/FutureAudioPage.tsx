import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Sparkles, RotateCcw, Check, Compass, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STATEMENTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-statements`;

interface StatementEntry {
  id?: string;
  statement: string;
  recordingUrl?: string;
  recordingPath?: string;
  isRecording: boolean;
  isPlaying: boolean;
}

const FutureAudioPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statements, setStatements] = useState<StatementEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsVision, setNeedsVision] = useState(false);
  const [activeRecordingIdx, setActiveRecordingIdx] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingIdxRef = useRef<number>(-1);

  // Load saved statements on mount
  useEffect(() => {
    if (!user) return;
    loadSavedStatements();
  }, [user]);

  const loadSavedStatements = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("future_audio_statements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return;

    const entries: StatementEntry[] = await Promise.all(
      data.map(async (row: any) => {
        let recordingUrl: string | undefined;
        if (row.recording_path) {
          const { data: urlData } = await supabase.storage
            .from("audio-recordings")
            .createSignedUrl(row.recording_path, 3600);
          recordingUrl = urlData?.signedUrl;
        }
        return {
          id: row.id,
          statement: row.statement,
          recordingUrl,
          recordingPath: row.recording_path,
          isRecording: false,
          isPlaying: false,
        };
      })
    );

    setStatements(entries);
  };

  const generateStatements = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setNeedsVision(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(STATEMENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({}),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        if (resp.status === 400 && err.error?.includes("Vision Builder")) {
          setNeedsVision(true);
          setIsGenerating(false);
          return;
        }
        toast({ title: "Error", description: err.error, variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const data = await resp.json();
      const newStatements: StatementEntry[] = data.statements.map((s: string) => ({
        statement: s,
        isRecording: false,
        isPlaying: false,
      }));

      // Save to DB
      const inserts = newStatements.map((s) => ({
        user_id: user.id,
        statement: s.statement,
      }));

      const { data: saved, error } = await supabase
        .from("future_audio_statements")
        .insert(inserts)
        .select();

      if (error) throw error;

      setStatements(
        saved.map((row: any) => ({
          id: row.id,
          statement: row.statement,
          isRecording: false,
          isPlaying: false,
        }))
      );
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const startRecording = async (idx: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await saveRecording(idx, blob);
        setActiveRecordingIdx(null);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setActiveRecordingIdx(idx);
      setStatements((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, isRecording: true } : s))
      );
    } catch {
      toast({ title: "Microphone access required", description: "Please allow microphone access to record.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setStatements((prev) =>
      prev.map((s) => ({ ...s, isRecording: false }))
    );
  };

  const saveRecording = async (idx: number, blob: Blob) => {
    if (!user) return;
    const entry = statements[idx];
    if (!entry?.id) return;

    const filePath = `${user.id}/${entry.id}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(filePath, blob, { upsert: true, contentType: "audio/webm" });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    // Update DB with recording path
    await supabase
      .from("future_audio_statements")
      .update({ recording_path: filePath, recorded_at: new Date().toISOString() })
      .eq("id", entry.id);

    // Get signed URL for playback
    const { data: urlData } = await supabase.storage
      .from("audio-recordings")
      .createSignedUrl(filePath, 3600);

    setStatements((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, recordingUrl: urlData?.signedUrl, recordingPath: filePath } : s
      )
    );

    toast({ title: "Recording saved!" });
  };

  const togglePlayback = (idx: number) => {
    const entry = statements[idx];
    if (!entry.recordingUrl) return;

    if (entry.isPlaying) {
      audioRef.current?.pause();
      setStatements((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, isPlaying: false } : s))
      );
      return;
    }

    // Stop any other playback
    audioRef.current?.pause();
    setStatements((prev) => prev.map((s) => ({ ...s, isPlaying: false })));

    const audio = new Audio(entry.recordingUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setStatements((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, isPlaying: false } : s))
      );
    };

    audio.play();
    setStatements((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, isPlaying: true } : s))
    );
  };

  const playAllRecordings = async () => {
    const recorded = statements.filter((s) => s.recordingUrl);
    if (recorded.length === 0) {
      toast({ title: "No recordings yet", description: "Record your statements first." });
      return;
    }

    setPlayingAll(true);

    for (let i = 0; i < statements.length; i++) {
      const entry = statements[i];
      if (!entry.recordingUrl) continue;

      playingIdxRef.current = i;
      setStatements((prev) =>
        prev.map((s, j) => ({ ...s, isPlaying: j === i }))
      );

      await new Promise<void>((resolve) => {
        const audio = new Audio(entry.recordingUrl);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    }

    setStatements((prev) => prev.map((s) => ({ ...s, isPlaying: false })));
    setPlayingAll(false);
    playingIdxRef.current = -1;
  };

  const recordedCount = statements.filter((s) => s.recordingUrl).length;

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">

      {/* Needs Vision */}
      {needsVision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card p-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">Complete Your Vision First</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            We need your vision answers to generate personalized statements.
          </p>
          <Button variant="hero" className="w-full" size="lg" onClick={() => navigate("/onboarding")}>
            <Sparkles className="w-4 h-4" />
            Start Vision Builder
          </Button>
        </motion.div>
      )}

      {/* Empty state */}
      {statements.length === 0 && !isGenerating && !needsVision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card shadow-card p-6 text-center"
        >
          <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
            <Mic className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-2">Your Voice, Your Future</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            We'll generate personalized identity statements based on your vision.
            Then you'll record yourself reading them aloud — hearing your own voice
            speak your future into existence.
          </p>
          <Button variant="hero" className="w-full" size="lg" onClick={generateStatements}>
            <Sparkles className="w-4 h-4" />
            Generate My Statements
          </Button>
        </motion.div>
      )}

      {/* Generating */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-card shadow-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Crafting your identity statements...</p>
        </motion.div>
      )}

      {/* Statements list */}
      {statements.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {statements.map((entry, idx) => (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl bg-card shadow-card p-5"
              >
                <p className="text-sm text-foreground/90 leading-relaxed mb-4 italic">
                  "{entry.statement}"
                </p>

                <div className="flex items-center gap-2">
                  {/* Record / Re-record */}
                  {entry.isRecording ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={stopRecording}
                      className="gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      variant={entry.recordingUrl ? "outline" : "hero"}
                      size="sm"
                      onClick={() => startRecording(idx)}
                      disabled={activeRecordingIdx !== null && activeRecordingIdx !== idx}
                      className="gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {entry.recordingUrl ? "Re-record" : "Record"}
                    </Button>
                  )}

                  {/* Playback */}
                  {entry.recordingUrl && !entry.isRecording && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => togglePlayback(idx)}
                      className="gap-1.5"
                    >
                      {entry.isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Play
                        </>
                      )}
                    </Button>
                  )}

                  {/* Recorded indicator */}
                  {entry.recordingUrl && (
                    <div className="ml-auto flex items-center gap-1 text-xs text-primary">
                      <Check className="w-3.5 h-3.5" />
                      <span>Recorded</span>
                    </div>
                  )}
                </div>

                {/* Recording indicator */}
                {entry.isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xs text-destructive font-medium">Recording...</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Play All button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 space-y-3"
          >
            {recordedCount > 0 && (
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={playAllRecordings}
                disabled={playingAll}
              >
                <Volume2 className="w-4 h-4" />
                {playingAll ? "Playing..." : "Play My Future Voice"}
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={generateStatements}
            >
              <RotateCcw className="w-4 h-4" />
              Regenerate Statements
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FutureAudioPage;
