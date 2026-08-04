CREATE TABLE public.shop_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  price integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
GRANT SELECT, INSERT ON public.shop_purchases TO authenticated;
GRANT ALL ON public.shop_purchases TO service_role;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchases select" ON public.shop_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own purchases insert" ON public.shop_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_wallpaper text;