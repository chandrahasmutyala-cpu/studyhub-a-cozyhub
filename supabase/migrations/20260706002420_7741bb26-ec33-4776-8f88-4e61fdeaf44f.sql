
-- desk_layouts
CREATE TABLE public.desk_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme text NOT NULL DEFAULT 'sage',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.desk_layouts TO authenticated;
GRANT ALL ON public.desk_layouts TO service_role;
ALTER TABLE public.desk_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own desk_layouts" ON public.desk_layouts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_desk_layouts_updated BEFORE UPDATE ON public.desk_layouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- semester_plans
CREATE TABLE public.semester_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'My semester',
  start_date date NOT NULL,
  end_date date NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.semester_plans TO authenticated;
GRANT ALL ON public.semester_plans TO service_role;
ALTER TABLE public.semester_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own semester_plans" ON public.semester_plans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_semester_plans_updated BEFORE UPDATE ON public.semester_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- lesson_progress
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text NOT NULL,
  lesson_key text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, language, lesson_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson_progress" ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- word_bookmarks
CREATE TABLE public.word_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text NOT NULL,
  term text NOT NULL,
  kind text NOT NULL DEFAULT 'vocab',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, language, kind, term)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.word_bookmarks TO authenticated;
GRANT ALL ON public.word_bookmarks TO service_role;
ALTER TABLE public.word_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own word_bookmarks" ON public.word_bookmarks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
