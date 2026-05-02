export type WardrobeItemRow = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  purchase_price: number | null;
  last_worn_at: string | null;
  wear_count: number;
  created_at?: string;
  /** Set after running migration 003_wardrobe_item_display_fields.sql */
  color?: string | null;
  style?: string | null;
  occasion?: string | null;
  tip?: string | null;
};

export type PlannerRow = {
  id: string;
  user_id: string;
  date: string;
  outfit_items: unknown;
  created_at: string;
};
