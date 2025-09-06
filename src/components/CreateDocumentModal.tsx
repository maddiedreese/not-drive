import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Presentation, Sheet, Folder } from 'lucide-react';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (name: string, type: string) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreateDocument,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('document');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateDocument(name.trim(), type);
      setName('');
      onClose();
    }
  };

  const documentTypes = [
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'spreadsheet', label: 'Spreadsheet', icon: Sheet },
    { value: 'presentation', label: 'Presentation', icon: Presentation },
    { value: 'folder', label: 'Folder', icon: Folder },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => {
                  const IconComponent = docType.icon;
                  return (
                    <SelectItem key={docType.value} value={docType.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {docType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};