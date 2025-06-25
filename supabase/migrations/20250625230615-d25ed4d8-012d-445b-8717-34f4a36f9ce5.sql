
-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-files', 'cv-files', false);

-- Create RLS policy for authenticated users to upload their own files
CREATE POLICY "Users can upload their own CV files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cv-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for users to view their own files
CREATE POLICY "Users can view their own CV files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cv-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for users to delete their own files
CREATE POLICY "Users can delete their own CV files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cv-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update documents table to include backup status
ALTER TABLE documents ADD COLUMN backed_up_to_s3 BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN s3_key TEXT;

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents table
CREATE POLICY "Users can view their own documents" ON documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
FOR DELETE USING (auth.uid() = user_id);
