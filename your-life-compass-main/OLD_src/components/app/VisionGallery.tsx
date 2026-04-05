import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface VisionEntry {
  id: string;
  image_url: string | null;
  script: string | null;
  created_at: string;
}

const VisionGallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visions, setVisions] = useState<VisionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("vision_experiences")
        .select("id, image_url, script, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      setVisions(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading || visions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
            Your Visions
          </h2>
        </div>
        <button
          onClick={() => navigate("/app/path/experience")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Create new <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visions.map((v, i) => (
          <motion.button
            key={v.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => navigate("/app/path/experience")}
            className="rounded-2xl overflow-hidden bg-card shadow-card group relative aspect-[4/3]"
          >
            {v.image_url ? (
              <img
                src={v.image_url}
                alt="Vision"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  target.parentElement?.querySelector(".vision-fallback")?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`vision-fallback w-full h-full flex items-center justify-center bg-muted ${v.image_url ? "hidden absolute inset-0" : ""}`}>
              <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 line-clamp-2 text-left leading-tight">
              {v.script?.slice(0, 80)}…
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default VisionGallery;
