-- Create storage buckets for sermon files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
    ('sermon-audio', 'sermon-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']),
    ('sermon-documents', 'sermon-documents', true, 20971520, ARRAY['application/pdf']),
    ('sermon-presentations', 'sermon-presentations', true, 52428800, ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
    ('sermon-thumbnails', 'sermon-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('song-audio', 'song-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']);

-- Storage policies for sermon-audio
CREATE POLICY "Anyone can view sermon audio" ON storage.objects
FOR SELECT USING (bucket_id = 'sermon-audio');

CREATE POLICY "Pastors can upload sermon audio" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'sermon-audio' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can update sermon audio" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'sermon-audio' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can delete sermon audio" ON storage.objects
FOR DELETE USING (
    bucket_id = 'sermon-audio' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

-- Storage policies for sermon-documents
CREATE POLICY "Anyone can view sermon documents" ON storage.objects
FOR SELECT USING (bucket_id = 'sermon-documents');

CREATE POLICY "Pastors can upload sermon documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'sermon-documents' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can update sermon documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'sermon-documents' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can delete sermon documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'sermon-documents' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

-- Storage policies for sermon-presentations
CREATE POLICY "Anyone can view sermon presentations" ON storage.objects
FOR SELECT USING (bucket_id = 'sermon-presentations');

CREATE POLICY "Pastors can upload sermon presentations" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'sermon-presentations' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can update sermon presentations" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'sermon-presentations' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can delete sermon presentations" ON storage.objects
FOR DELETE USING (
    bucket_id = 'sermon-presentations' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

-- Storage policies for sermon-thumbnails
CREATE POLICY "Anyone can view sermon thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'sermon-thumbnails');

CREATE POLICY "Pastors can upload sermon thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'sermon-thumbnails' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can update sermon thumbnails" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'sermon-thumbnails' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Pastors can delete sermon thumbnails" ON storage.objects
FOR DELETE USING (
    bucket_id = 'sermon-thumbnails' 
    AND (has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

-- Storage policies for song-audio
CREATE POLICY "Anyone can view song audio" ON storage.objects
FOR SELECT USING (bucket_id = 'song-audio');

CREATE POLICY "Worship team can upload song audio" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'song-audio' 
    AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Worship team can update song audio" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'song-audio' 
    AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Worship team can delete song audio" ON storage.objects
FOR DELETE USING (
    bucket_id = 'song-audio' 
    AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role) OR has_approved_role(auth.uid(), 'admin'::app_role))
);