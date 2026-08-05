CREATE POLICY "own wallpapers read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own wallpapers insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own wallpapers update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own wallpapers delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);