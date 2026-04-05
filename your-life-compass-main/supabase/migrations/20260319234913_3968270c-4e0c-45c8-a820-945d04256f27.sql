
-- Table for storing generated statements and their recording references
CREATE TABLE public.future_audio_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  statement text NOT NULL,
  recording_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz
);

ALTER TABLE public.future_audio_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own audio statements"
  ON public.future_audio_statements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false);

-- Storage RLS policies
CREATE POLICY "Users upload own recordings"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own recordings"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'audio-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own recordings"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
