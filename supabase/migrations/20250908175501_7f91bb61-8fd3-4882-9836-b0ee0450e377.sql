-- Add deleted column to documents table for soft deletes
ALTER TABLE public.documents ADD COLUMN deleted boolean NOT NULL DEFAULT false;

-- Create index on deleted column for better performance
CREATE INDEX idx_documents_deleted ON public.documents(deleted);