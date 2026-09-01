REVOKE EXECUTE ON FUNCTION private.are_friends(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION private.is_group_member(uuid, uuid) FROM PUBLIC, authenticated;

DROP POLICY IF EXISTS "discover peers in age group" ON public.profiles;
DROP POLICY IF EXISTS "discover peers according to privacy" ON public.profiles;
CREATE POLICY "discover peers according to privacy"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR CASE COALESCE(privacy ->> 'profile_visibility', 'age_group')
    WHEN 'private' THEN false
    WHEN 'friends' THEN private.are_friends(auth.uid(), id)
    WHEN 'everyone' THEN true
    ELSE NOT (age_group IS DISTINCT FROM (
      SELECT p.age_group
      FROM public.profiles p
      WHERE p.id = auth.uid()
    ))
  END
);