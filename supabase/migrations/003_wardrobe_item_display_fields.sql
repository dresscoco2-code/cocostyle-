-- Optional metadata for wardrobe grid (color, style, occasion, styling tip)
ALTER TABLE public.wardrobe_items
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS occasion TEXT,
  ADD COLUMN IF NOT EXISTS tip TEXT;
