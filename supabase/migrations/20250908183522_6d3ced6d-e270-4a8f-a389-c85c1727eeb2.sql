-- Update documents table to support spreadsheet content storage
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS spreadsheet_data JSONB DEFAULT '{}';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS spreadsheet_formatting JSONB DEFAULT '{}';

-- Add an index for better performance on spreadsheet queries
CREATE INDEX IF NOT EXISTS idx_documents_type_user ON public.documents(type, user_id) WHERE deleted = false;

-- Update the trigger to handle spreadsheet documents
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;