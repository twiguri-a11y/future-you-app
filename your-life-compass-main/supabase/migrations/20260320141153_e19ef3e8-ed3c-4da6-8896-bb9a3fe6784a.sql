
-- Vision board items table
CREATE TABLE public.vision_board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  item_type text NOT NULL DEFAULT 'image', -- 'image', 'text', 'preset'
  content text, -- text content for text cards, or preset image key
  image_path text, -- storage path for uploaded images
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vision board items"
  ON public.vision_board_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for vision board images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vision-board-images', 'vision-board-images', true);

-- Storage RLS policies
CREATE POLICY "Users can upload vision board images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vision-board-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view vision board images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'vision-board-images');

CREATE POLICY "Users can delete own vision board images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vision-board-images' AND (storage.foldername(name))[1] = auth.uid()::text);
