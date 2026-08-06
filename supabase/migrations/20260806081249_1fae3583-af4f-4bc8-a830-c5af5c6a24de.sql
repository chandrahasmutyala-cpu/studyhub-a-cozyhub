DROP POLICY IF EXISTS "notify others" ON public.notifications;

CREATE POLICY "notify self or related users"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.are_friends(auth.uid(), user_id)
  OR EXISTS (
    SELECT 1
    FROM public.group_members me
    JOIN public.group_members them ON them.group_id = me.group_id
    WHERE me.user_id = auth.uid() AND them.user_id = notifications.user_id
  )
);

DROP POLICY IF EXISTS "Avatars are viewable by authenticated" ON storage.objects;

CREATE POLICY "Users read own avatar"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);