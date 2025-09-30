
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBackend } from '@/components/BackendIntegratedWrapper';
import AdminContentDialog from './AdminContentDialog';

interface AdminAddButtonProps {
  contentType: 'notes' | 'pyqs' | 'news' | 'dates' | 'communities' | 'courses' | 'syllabus';
  examType?: string;
  children: React.ReactNode;
  prefilledSubject?: string;
  branch?: string;
  level?: string;
  classLevel?: string;
}

const AdminAddButton: React.FC<AdminAddButtonProps> = ({
  contentType,
  examType,
  children,
  prefilledSubject,
  branch,
  level,
  classLevel
}) => {
  const { isAdmin } = useBackend();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  console.log('AdminAddButton - isAdmin:', isAdmin);

  if (!isAdmin) {
    console.log('AdminAddButton: User is not admin, hiding button');
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="bg-royal hover:bg-royal-dark text-white"
      >
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
