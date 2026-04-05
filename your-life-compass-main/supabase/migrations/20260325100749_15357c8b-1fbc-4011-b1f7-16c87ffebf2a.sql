CREATE TABLE public.vision_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  script text,
  image_url text,
  image_prompt text,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vision_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vision experiences"
  ON public.vision_experiences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);