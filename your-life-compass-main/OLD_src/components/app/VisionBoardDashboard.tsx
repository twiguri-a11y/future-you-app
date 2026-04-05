import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ImageIcon, Search, X } from "lucide-react";
import { categories, BoardItem, getImageUrl } from "@/hooks/useVisionBoard";

interface Props {
  items: BoardItem[];
  onSelectCategory: (key: string) => void;
}

const VisionBoardDashboard = ({ items, onSelectCategory }: Props) => {
  const catItems = (cat: string) => items.filter((i) => i.category === cat);
  const hasAnyItems = items.length > 0;
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => new Set(prev).add(id));
  };

  const query = search.trim().toLowerCase();

  // Filter categories and items by search
  const filteredCategories = query
    ? categories.filter((cat) => {
        if (cat.label.toLowerCase().includes(query) || cat.key.toLowerCase().includes(query)) return true;
        return catItems(cat.key).some(
          (i) => i.content?.toLowerCase().includes(query)
        );
      })
    : categories;

  // Recent items for the overview grid (images/presets only), excluding broken ones
  const recentVisuals = items
    .filter((i) => i.item_type !== "text" && !brokenImages.has(i.id))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search your vision board…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recent items overview (hidden during search) */}
      {!query && hasAnyItems && recentVisuals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-3 gap-2">
            {recentVisuals.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="cursor-pointer group"
                onClick={() => onSelectCategory(item.category)}
              >
                <div className="aspect-square rounded-xl overflow-hidden relative">
                  <img
                    src={getImageUrl(item)}
                    alt="Vision"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={() => handleImageError(item.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-medium bg-background/70 backdrop-blur-sm text-foreground px-1.5 py-0.5 rounded-full capitalize">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!hasAnyItems && !query && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10"
        >
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/25 mb-2" />
          <p className="text-muted-foreground text-sm">Your vision board is empty</p>
          <p className="text-muted-foreground/50 text-xs mt-1">Tap a category below to start</p>
        </motion.div>
      )}

      {/* No search results */}
      {query && filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 mx-auto text-muted-foreground/25 mb-2" />
          <p className="text-muted-foreground text-sm">No results for "{search}"</p>
        </div>
      )}

      {/* Category grid */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">
          {query ? `Results` : "Categories"}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {filteredCategories.map((cat, idx) => {
            const myItems = catItems(cat.key);
            const previewItem = myItems.find((i) => i.item_type !== "text" && !brokenImages.has(i.id));
            const previewSrc = previewItem
              ? getImageUrl(previewItem)
              : cat.presets?.[0] || null;

            return (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + idx * 0.03 }}
                onClick={() => onSelectCategory(cat.key)}
                className="relative rounded-xl overflow-hidden bg-card text-left group active:scale-[0.98] transition-transform"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                      onError={() => previewItem && handleImageError(previewItem.id)}
                    />
                  ) : (
                    <div className={`w-full h-full ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-8 h-8 opacity-15" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-white">{cat.label}</h3>
                    <p className="text-[10px] text-white/60">
                      {myItems.length === 0 ? "Add items" : `${myItems.length} item${myItems.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisionBoardDashboard;
