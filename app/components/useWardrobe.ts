'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WardrobeItemRow } from '@/lib/wardrobe-types';

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noConfig, setNoConfig] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNoConfig(true);
      setLoading(false);
      setItems([]);
      return;
    }
    setNoConfig(false);
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error: qErr } = await supabase
      .from('wardrobe_items')
      .select(
        'id,user_id,name,category,image_url,color,style,occasion,tip,purchase_price,last_worn_at,wear_count,created_at',
      )
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (qErr) {
      setError(qErr.message);
      setItems([]);
    } else {
      setItems((data ?? []) as WardrobeItemRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, userId, error, noConfig, refresh };
}
