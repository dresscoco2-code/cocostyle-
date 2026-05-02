-- Outfit history (morning screen "I'm wearing this today")
CREATE TABLE IF NOT EXISTS public.outfit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outfit_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  occasion TEXT,
  weather TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outfit_history_user_date_idx ON public.outfit_history (user_id, date DESC);

ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outfit_history_select_own"
  ON public.outfit_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "outfit_history_insert_own"
  ON public.outfit_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfit_history_update_own"
  ON public.outfit_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfit_history_delete_own"
  ON public.outfit_history FOR DELETE
  USING (auth.uid() = user_id);

-- Profile row for morning greeting + AI context (extend as needed)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name TEXT,
  skin_tone TEXT,
  undertone TEXT,
  gender TEXT,
  age_group TEXT,
  body_type TEXT,
  style_personality TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);
