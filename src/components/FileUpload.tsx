import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUploaded: () => void;
  currentFolderId?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, currentFolderId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      try {
        // Upload file to storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('documents')
          .insert([
            {
              user_id: user.id,
              name: file.name,
              type: 'file',
              file_path: uploadData.path,
              file_size: file.size,
              mime_type: file.type,
              parent_folder_id: currentFolderId,
              is_folder: false,
            },
          ]);

        if (dbError) throw dbError;

        toast.success(`${file.name} uploaded successfully`);
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    onFileUploaded();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <span
        onClick={handleUploadClick}
        className="text-sm text-gray-700 flex-1 cursor-pointer"
      >
        File upload
      </span>
    </>
  );
};