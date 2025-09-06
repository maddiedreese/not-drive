-- Make the documents bucket public so file previews can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';