CREATE TABLE public.weekly_reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  alignment_answer text NOT NULL,
  progress_answer text NOT NULL,
  challenges_answer text NOT NULL,
  focus_answer text NOT NULL,
  ai_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own weekly reflections"
  ON public.weekly_reflections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);