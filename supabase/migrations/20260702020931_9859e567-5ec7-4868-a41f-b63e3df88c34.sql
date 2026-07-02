
CREATE POLICY "doodle_uploads_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'doodle-uploads' AND owner = auth.uid());

CREATE POLICY "doodle_uploads_read_own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'doodle-uploads' AND owner = auth.uid());

CREATE POLICY "doodle_uploads_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'doodle-uploads' AND owner = auth.uid());
