
DROP POLICY IF EXISTS "own applications" ON public.applications;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own career_plans" ON public.career_plans;
CREATE POLICY "own career_plans" ON public.career_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own deadlines" ON public.deadlines;
CREATE POLICY "own deadlines" ON public.deadlines FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
