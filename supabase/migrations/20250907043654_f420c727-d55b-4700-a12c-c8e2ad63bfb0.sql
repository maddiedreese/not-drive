-- Add backup fields to store original state before killing files
ALTER TABLE public.documents 
ADD COLUMN original_content TEXT,
ADD COLUMN original_created_at TIMESTAMP WITH TIME ZONE;