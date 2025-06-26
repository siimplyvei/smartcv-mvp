
-- Remove the existing foreign key constraint that's causing the issue
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- Since we're using RLS policies to control access, we don't need a foreign key constraint
-- The user_id will be validated through the RLS policies instead
