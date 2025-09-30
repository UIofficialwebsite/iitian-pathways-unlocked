import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminContentDialog from './AdminContentDialog';

type ContentType = 'notes' | 'pyqs' | 'news' | 'dates' | 'communities' | 'courses' | 'syllabus';

interface AdminAddButtonProps {
  contentType: ContentType;
  children: ReactNode;
  examType?: string;
  prefilledSubject?: string;
  branch?: string;
  level?: string;
  classLevel?: string;
}

const AdminAddButton: React.FC<AdminAddButtonProps> = ({ 
  contentType, 
  children, 
  examType,
  prefilledSubject,
  branch,
  level,
  classLevel
}) => {
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
        examType={examType}
        prefilledSubject={prefilledSubject}
        branch={branch}
        level={level}
        classLevel={classLevel}
      />
    </>
  );
};

export default AdminAddButton;
