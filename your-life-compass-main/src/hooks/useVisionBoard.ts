import { useRef, useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import careerImg from "@/assets/vision/career.jpg";
import relationshipsImg from "@/assets/vision/relationships.jpg";
import healthImg from "@/assets/vision/health.jpg";
import wealthImg from "@/assets/vision/wealth.jpg";
import lifestyleImg from "@/assets/vision/lifestyle.jpg";
import growthImg from "@/assets/vision/growth.jpg";
import experiencesImg from "@/assets/vision/experiences.jpg";
import spiritualityImg from "@/assets/vision/spirituality.jpg";
import {
  Briefcase, Heart, Dumbbell, Wallet, Palmtree, BookOpen, Globe, Sparkles,
} from "lucide-react";

export const categories = [
  { key: "career", icon: Briefcase, label: "Career", color: "bg-primary/10 text-primary", presets: [careerImg] },
  { key: "relationships", icon: Heart, label: "Relationships", color: "bg-destructive/10 text-destructive", presets: [relationshipsImg] },
  { key: "health", icon: Dumbbell, label: "Health", color: "bg-accent/10 text-accent", presets: [healthImg] },
  { key: "wealth", icon: Wallet, label: "Wealth", color: "bg-secondary/10 text-secondary", presets: [wealthImg] },
  { key: "lifestyle", icon: Palmtree, label: "Lifestyle", color: "bg-primary/10 text-primary", presets: [lifestyleImg] },
  { key: "growth", icon: BookOpen, label: "Growth", color: "bg-accent/10 text-accent", presets: [growthImg] },
  { key: "experiences", icon: Globe, label: "Experiences", color: "bg-secondary/10 text-secondary", presets: [experiencesImg] },
  { key: "spirituality", icon: Sparkles, label: "Spirituality", color: "bg-primary/10 text-primary", presets: [spiritualityImg] },
];

export type BoardItem = {
  id: string;
  category: string;
  item_type: string;
  content: string | null;
  image_path: string | null;
  position: number;
};

export const getImageUrl = (item: BoardItem) => {
  if (item.item_type === "preset") return item.content || "";
  if (item.image_path) {
    const { data } = supabase.storage.from("vision-board-images").getPublicUrl(item.image_path);
    return data.publicUrl;
  }
  return "";
};

export function useVisionBoard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vision-board", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vision_board_items")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as BoardItem[];
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (item: { category: string; item_type: string; content?: string; image_path?: string }) => {
      const { error } = await supabase.from("vision_board_items").insert({
        user_id: user!.id,
        category: item.category,
        item_type: item.item_type,
        content: item.content || null,
        image_path: item.image_path || null,
        position: items.filter((i) => i.category === item.category).length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] });
      toast.success("Added to your vision board");
    },
    onError: () => toast.error("Failed to add item"),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item?.image_path) {
        await supabase.storage.from("vision-board-images").remove([item.image_path]);
      }
      const { error } = await supabase.from("vision_board_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] });
      toast.success("Removed from vision board");
    },
  });

  const handleUpload = useCallback(async (file: File, category: string) => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${category}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("vision-board-images")
      .upload(path, file);
    if (uploadError) {
      toast.error("Upload failed");
      return;
    }
    await addItem.mutateAsync({ category, item_type: "image", image_path: path });
  }, [user, addItem]);

  const catItems = (cat: string) => items.filter((i) => i.category === cat);
  const hasPreset = (cat: string, url: string) => items.some((i) => i.category === cat && i.item_type === "preset" && i.content === url);

  return { items, isLoading, addItem, removeItem, handleUpload, catItems, hasPreset };
}
