
CREATE TABLE public.onboarding_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reflection_answer text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own onboarding answers"
  ON public.onboarding_answers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own onboarding answers"
  ON public.onboarding_answers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding answers"
  ON public.onboarding_answers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
