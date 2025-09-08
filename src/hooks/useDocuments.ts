import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface Document {
  id: string;
  name: string;
  type: string;
  content?: string;
  parent_folder_id?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  is_folder: boolean;
  created_at: string;
  updated_at: string;
  original_content?: string;
  original_created_at?: string;
  deleted?: boolean;
}

export const useDocuments = (currentFolderId?: string, includeDeleted = false) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadDocuments = async () => {
    if (!user) {
      console.log('No user, clearing documents');
      setDocuments([]);
      setLoading(false);
      return;
    }

    console.log('Loading documents for user:', user.id, 'folder:', currentFolderId, 'includeDeleted:', includeDeleted);

    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (currentFolderId) {
        query = query.eq('parent_folder_id', currentFolderId);
      } else {
        query = query.is('parent_folder_id', null);
      }

      // Filter by deleted status based on includeDeleted parameter
      if (!includeDeleted) {
        query = query.eq('deleted', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading documents:', error);
        throw error;
      }
      
      console.log('Documents loaded successfully:', data?.length, 'documents');
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      toast.error(`Failed to load documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (name: string, type: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user.id,
            name,
            type,
            content: type === 'folder' ? null : '',
            parent_folder_id: currentFolderId,
            is_folder: type === 'folder',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDocuments((prev) => [data, ...prev]);
      toast.success(`${type === 'folder' ? 'Folder' : 'Document'} created successfully`);
      return data;
    } catch (error: any) {
      toast.error(`Failed to create ${type}: ${error.message}`);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete document: ${error.message}`);
    }
  };

  const downloadFile = async (document: Document) => {
    if (!document.file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error: any) {
      toast.error(`Failed to download file: ${error.message}`);
    }
  };

  useEffect(() => {
    loadDocuments();

    const handler = () => loadDocuments();
    window.addEventListener('documents:refresh', handler);

    // Cross-tab refresh via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('documents');
      bc.onmessage = (event) => {
        if (event.data === 'refresh') loadDocuments();
      };
    }

    // Fallback cross-tab refresh via localStorage events
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'documents:refresh-token') {
        loadDocuments();
      }
    };
    window.addEventListener('storage', storageHandler);

    // Realtime subscription to backend changes
    const channel = user
      ? supabase
          .channel('documents-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'documents', filter: `user_id=eq.${user.id}` },
            () => loadDocuments()
          )
          .subscribe()
      : null;

    return () => {
      window.removeEventListener('documents:refresh', handler);
      window.removeEventListener('storage', storageHandler);
      bc?.close();
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, currentFolderId, includeDeleted]);

  return {
    documents,
    loading,
    createDocument,
    deleteDocument,
    downloadFile,
    refetch: loadDocuments,
  };
};