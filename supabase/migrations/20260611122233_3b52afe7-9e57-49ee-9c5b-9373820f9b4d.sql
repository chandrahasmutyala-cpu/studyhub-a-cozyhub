
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_group TEXT,
  ADD COLUMN IF NOT EXISTS avatar_config JSONB,
  ADD COLUMN IF NOT EXISTS teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS teacher_personality TEXT,
  ADD COLUMN IF NOT EXISTS teacher_voice TEXT,
  ADD COLUMN IF NOT EXISTS teacher_style TEXT,
  ADD COLUMN IF NOT EXISTS dream_career TEXT,
  ADD COLUMN IF NOT EXISTS dream_country TEXT,
  ADD COLUMN IF NOT EXISTS dream_university TEXT,
  ADD COLUMN IF NOT EXISTS current_grade TEXT;

-- Career plans (AI Future Planner output)
CREATE TABLE IF NOT EXISTS public.career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  career_goal TEXT,
  dream_country TEXT,
  dream_university TEXT,
  current_grade TEXT,
  plan JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_plans TO authenticated;
GRANT ALL ON public.career_plans TO service_role;
ALTER TABLE public.career_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own career_plans" ON public.career_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_career_plans_updated BEFORE UPDATE ON public.career_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Applications tracker
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('university','scholarship','other')),
  name TEXT NOT NULL,
  country TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested','preparing','applied','accepted','rejected')),
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Deadline countdowns
CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deadlines TO authenticated;
GRANT ALL ON public.deadlines TO service_role;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deadlines" ON public.deadlines
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_deadlines_updated BEFORE UPDATE ON public.deadlines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verified university directory
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  languages TEXT[],
  degrees TEXT[],
  tuition_min INT,
  tuition_max INT,
  currency TEXT DEFAULT 'USD',
  requirements TEXT,
  scholarships_available BOOLEAN DEFAULT false,
  website TEXT,
  application_deadline DATE,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.universities TO authenticated, anon;
GRANT ALL ON public.universities TO service_role;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "universities readable" ON public.universities FOR SELECT USING (verified = true);
CREATE TRIGGER trg_universities_updated BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS universities_country_idx ON public.universities(country);

-- Verified scholarship directory
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  country TEXT,
  eligibility TEXT,
  benefits TEXT,
  documents_required TEXT,
  deadline DATE,
  source_url TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scholarships TO authenticated, anon;
GRANT ALL ON public.scholarships TO service_role;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scholarships readable" ON public.scholarships FOR SELECT USING (verified = true);
CREATE TRIGGER trg_scholarships_updated BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS scholarships_deadline_idx ON public.scholarships(deadline);
