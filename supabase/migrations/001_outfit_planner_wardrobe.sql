-- Outfit planner (per user spec)
CREATE TABLE IF NOT EXISTS public.outfit_planner (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outfit_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.outfit_planner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outfit_planner_select_own"
  ON public.outfit_planner FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "outfit_planner_insert_own"
  ON public.outfit_planner FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfit_planner_update_own"
  ON public.outfit_planner FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfit_planner_delete_own"
  ON public.outfit_planner FOR DELETE
  USING (auth.uid() = user_id);

-- Wardrobe items (for tools: shopping list, rewear, weather outfit, planner)
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  purchase_price NUMERIC(10, 2),
  last_worn_at DATE,
  wear_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wardrobe_items_user_id_idx ON public.wardrobe_items (user_id);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wardrobe_items_select_own"
  ON public.wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "wardrobe_items_insert_own"
  ON public.wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wardrobe_items_update_own"
  ON public.wardrobe_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wardrobe_items_delete_own"
  ON public.wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);
