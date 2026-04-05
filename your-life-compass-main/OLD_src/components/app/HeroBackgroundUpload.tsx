import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface HeroBackgroundUploadProps {
  onUpload?: () => void;
}

const HeroBackgroundUpload = ({ onUpload }: HeroBackgroundUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [userImages, setUserImages] = useState<{ name: string; url: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    if (!user || loaded) return;
    const { data } = await supabase.storage
      .from("hero-backgrounds")
      .list(user.id, { limit: 20, sortBy: { column: "created_at", order: "desc" } });

    if (data) {
      const imgs = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from("hero-backgrounds").getPublicUrl(`${user.id}/${f.name}`).data.publicUrl,
        }));
      setUserImages(imgs);
    }
    setLoaded(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from("hero-backgrounds")
      .upload(path, file, { upsert: false });

    if (error) {
      toast.error("Upload failed");
      console.error(error);
    } else {
      toast.success("Background uploaded!");
      const url = supabase.storage.from("hero-backgrounds").getPublicUrl(path).data.publicUrl;
      setUserImages((prev) => [{ name: fileName, url }, ...prev]);
      onUpload?.();
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (name: string) => {
    if (!user) return;
    const { error } = await supabase.storage
      .from("hero-backgrounds")
      .remove([`${user.id}/${name}`]);

    if (error) {
      toast.error("Delete failed");
    } else {
      setUserImages((prev) => prev.filter((img) => img.name !== name));
      toast.success("Removed");
    }
  };

  // Load on mount
  if (!loaded) loadImages();

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card shadow-card hover:bg-muted/50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Upload Background</p>
          <p className="text-xs text-muted-foreground">Add your own hero image (max 5MB)</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Uploaded images grid */}
      <AnimatePresence>
        {userImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-3 gap-2"
          >
            {userImages.map((img) => (
              <motion.div
                key={img.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-video rounded-xl overflow-hidden group"
              >
                <img
                  src={img.url}
                  alt="Custom background"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(img.name)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroBackgroundUpload;
