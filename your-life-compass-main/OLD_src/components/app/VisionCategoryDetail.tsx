import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft, Upload, Type, X, Check, Image as ImageIcon, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categories, BoardItem, getImageUrl } from "@/hooks/useVisionBoard";
import type { UseMutationResult } from "@tanstack/react-query";

interface Props {
  categoryKey: string;
  items: BoardItem[];
  addItem: UseMutationResult<void, Error, { category: string; item_type: string; content?: string; image_path?: string }>;
  removeItem: UseMutationResult<void, Error, string>;
  handleUpload: (file: File, category: string) => Promise<void>;
  hasPreset: (cat: string, url: string) => boolean;
  onBack: () => void;
  onReorder?: (categoryKey: string, orderedIds: string[]) => void;
}

const VisionCategoryDetail = ({ categoryKey, items, addItem, removeItem, handleUpload, hasPreset, onBack, onReorder }: Props) => {
  const cat = categories.find((c) => c.key === categoryKey)!;
  const myItems = items.filter((i) => i.category === categoryKey);
  const [orderedItems, setOrderedItems] = useState(myItems);
  const [mode, setMode] = useState<"image" | "text" | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync orderedItems when items change (add/remove)
  const prevIds = orderedItems.map((i) => i.id).join(",");
  const currentIds = myItems.map((i) => i.id).join(",");
  if (prevIds !== currentIds && !isReordering) {
    setOrderedItems(myItems);
  }

  const handleAddText = () => {
    if (!textDraft.trim()) return;
    addItem.mutate({ category: categoryKey, item_type: "text", content: textDraft.trim() });
    setTextDraft("");
    setMode(null);
  };

  const handleAddPreset = (presetUrl: string) => {
    addItem.mutate({ category: categoryKey, item_type: "preset", content: presetUrl });
  };

  const onFileChange = async (file: File) => {
    setUploading(true);
    await handleUpload(file, categoryKey);
    setUploading(false);
    setMode(null);
  };

  const handleReorder = useCallback((newOrder: BoardItem[]) => {
    setIsReordering(true);
    setOrderedItems(newOrder);
  }, []);

  const handleReorderEnd = useCallback(() => {
    setIsReordering(false);
    if (onReorder) {
      onReorder(categoryKey, orderedItems.map((i) => i.id));
    }
  }, [onReorder, categoryKey, orderedItems]);

  const displayItems = isReordering ? orderedItems : myItems;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 active:scale-[0.97]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to board
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
          <cat.icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{cat.label}</h2>
          <p className="text-xs text-muted-foreground">
            {myItems.length === 0 ? "Start adding your vision" : `${myItems.length} item${myItems.length > 1 ? "s" : ""} · drag to reorder`}
          </p>
        </div>
      </div>

      {/* Items — reorderable list */}
      {displayItems.length > 0 && (
        <Reorder.Group
          axis="y"
          values={orderedItems}
          onReorder={handleReorder}
          className="space-y-3 mb-6"
        >
          {orderedItems.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              onDragEnd={handleReorderEnd}
              className="relative group cursor-grab active:cursor-grabbing"
              whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
            >
              <div className="flex items-start gap-2">
                {/* Drag handle */}
                <div className="mt-2 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors touch-none">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {item.item_type === "text" ? (
                    <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm leading-relaxed italic text-foreground/80">"{item.content}"</p>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden shadow-sm">
                      <img src={getImageUrl(item)} alt="Vision" className="w-full object-cover max-h-48" loading="lazy" />
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeItem.mutate(item.id); }}
                  className="mt-2 shrink-0 w-6 h-6 rounded-full bg-foreground/10 hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Preset inspiration */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-2">Inspiration</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cat.presets.map((url, i) => {
            const added = hasPreset(categoryKey, url);
            return (
              <button
                key={i}
                onClick={() => !added && handleAddPreset(url)}
                disabled={added}
                className="relative shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary/30 transition-colors disabled:opacity-60"
              >
                <img src={url} alt="Preset" className="w-full h-full object-cover" />
                {added && (
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-background" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-2"
          >
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => setMode("image")}>
              <Upload className="w-3.5 h-3.5" /> Upload
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => setMode("text")}>
              <Type className="w-3.5 h-3.5" /> Add Quote
            </Button>
          </motion.div>
        )}

        {mode === "image" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileChange(file);
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              {uploading ? (
                <p className="text-sm text-muted-foreground">Uploading…</p>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to choose an image</p>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="text-xs">Cancel</Button>
          </motion.div>
        )}

        {mode === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <Textarea
              placeholder="Write a quote, affirmation, or goal…"
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              className="rounded-xl resize-none text-sm"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="rounded-xl text-xs" onClick={handleAddText} disabled={!textDraft.trim()}>Add</Button>
              <Button variant="ghost" size="sm" onClick={() => { setMode(null); setTextDraft(""); }} className="text-xs">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VisionCategoryDetail;
