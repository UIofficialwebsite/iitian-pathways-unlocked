import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminContentDialog from './AdminContentDialog';
import { ContentType } from '@/integrations/supabase/types';

interface AdminAddButtonProps {
  contentType: ContentType;
  children: ReactNode;
}

const AdminAddButton: React.FC<AdminAddButtonProps> = ({ contentType, children }) => {
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="bg-gray-800 text-white hover:bg-gray-700"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {children}
      </Button>
      <AdminContentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        contentType={contentType}
        mode="add"
      />
    </>
  );
};

export default AdminAddButton;
