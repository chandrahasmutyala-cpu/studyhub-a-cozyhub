CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.are_friends(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IN (_a, _b) AND EXISTS (
    SELECT 1
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = _a AND f.addressee_id = _b)
        OR (f.requester_id = _b AND f.addressee_id = _a))
  )
$$;

CREATE OR REPLACE FUNCTION private.is_group_member(_group uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() = _user AND EXISTS (
    SELECT 1
    FROM public.group_members m
    WHERE m.group_id = _group AND m.user_id = _user
  )
$$;

REVOKE ALL ON FUNCTION private.are_friends(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_group_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.are_friends(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_group_member(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "dm send to friends" ON public.dm_messages;
CREATE POLICY "dm send to friends"
ON public.dm_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND private.are_friends(sender_id, recipient_id)
);

DROP POLICY IF EXISTS "groups visible" ON public.study_groups;
CREATE POLICY "groups visible"
ON public.study_groups FOR SELECT TO authenticated
USING (is_public OR private.is_group_member(id, auth.uid()));

DROP POLICY IF EXISTS "members visible to members" ON public.group_members;
CREATE POLICY "members visible to members"
ON public.group_members FOR SELECT TO authenticated
USING (private.is_group_member(group_id, auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "group messages read" ON public.group_messages;
CREATE POLICY "group messages read"
ON public.group_messages FOR SELECT TO authenticated
USING (private.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "group messages send" ON public.group_messages;
CREATE POLICY "group messages send"
ON public.group_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND private.is_group_member(group_id, auth.uid())
);

DROP POLICY IF EXISTS "notify self or related users" ON public.notifications;
CREATE POLICY "notify self or related users"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR private.are_friends(auth.uid(), user_id)
  OR EXISTS (
    SELECT 1
    FROM public.group_members me
    JOIN public.group_members them ON them.group_id = me.group_id
    WHERE me.user_id = auth.uid()
      AND them.user_id = public.notifications.user_id
  )
);

DROP POLICY IF EXISTS "discover peers in age group" ON public.profiles;
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

DROP FUNCTION IF EXISTS public.are_friends(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_group_member(uuid, uuid);