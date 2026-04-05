import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useVisionBoard } from "@/hooks/useVisionBoard";
import VisionBoardDashboard from "@/components/app/VisionBoardDashboard";
import VisionCategoryDetail from "@/components/app/VisionCategoryDetail";
import { supabase } from "@/integrations/supabase/client";

const BlueprintPage = () => {
  const { items, isLoading, addItem, removeItem, handleUpload, hasPreset } = useVisionBoard();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleReorder = useCallback(async (categoryKey: string, orderedIds: string[]) => {
    // Persist new positions to database
    const updates = orderedIds.map((id, index) =>
      supabase.from("vision_board_items").update({ position: index }).eq("id", id)
    );
    await Promise.all(updates);
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedCategory ? (
            <VisionCategoryDetail
              key={selectedCategory}
              categoryKey={selectedCategory}
              items={items}
              addItem={addItem}
              removeItem={removeItem}
              handleUpload={handleUpload}
              hasPreset={hasPreset}
              onBack={() => setSelectedCategory(null)}
              onReorder={handleReorder}
            />
          ) : (
            <VisionBoardDashboard
              key="dashboard"
              items={items}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default BlueprintPage;
