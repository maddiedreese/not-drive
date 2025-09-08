-- Add deleted column to documents table for soft deletes
ALTER TABLE public.documents ADD COLUMN deleted boolean NOT NULL DEFAULT false;

-- Create index on deleted column for better performance
CREATE INDEX idx_documents_deleted ON public.documents(deleted);

-- Add trigger to update updated_at when deleted status changes
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();