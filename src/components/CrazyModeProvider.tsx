import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CrazyModeContextType {
  crazyMode: boolean;
  toggleCrazyMode: () => void;
}

const CrazyModeContext = createContext<CrazyModeContextType | undefined>(undefined);

export const useCrazyMode = () => {
  const context = useContext(CrazyModeContext);
  if (context === undefined) {
    throw new Error('useCrazyMode must be used within a CrazyModeProvider');
  }
  return context;
};

export const CrazyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crazyMode, setCrazyMode] = useState(false);

  const toggleCrazyMode = async () => {
    if (crazyMode) {
      // When turning OFF crazy mode, restore all files to normal state
      try {
        // First, get all documents that need restoration
        const { data: documentsToRestore, error: fetchError } = await supabase
          .from('documents')
          .select('id, original_created_at, original_content')
          .not('original_created_at', 'is', null);

        if (fetchError) {
          throw fetchError;
        }

        // Restore each document individually
        if (documentsToRestore && documentsToRestore.length > 0) {
          for (const doc of documentsToRestore) {
            const { error: updateError } = await supabase
              .from('documents')
              .update({
                created_at: doc.original_created_at,
                content: doc.original_content,
                original_created_at: null,
                original_content: null
              })
              .eq('id', doc.id);

            if (updateError) {
              console.error(`Error restoring document ${doc.id}:`, updateError);
            }
          }

          toast.success(`${documentsToRestore.length} files restored to normal state!`);
          // Trigger refresh of documents
          window.dispatchEvent(new Event('documents:refresh'));
        }
      } catch (error) {
        console.error('Failed to restore files:', error);
        toast.error('Failed to restore some files to normal state');
      }
    }
    
    setCrazyMode(prev => !prev);
  };

  return (
    <CrazyModeContext.Provider value={{ crazyMode, toggleCrazyMode }}>
      {children}
    </CrazyModeContext.Provider>
  );
};