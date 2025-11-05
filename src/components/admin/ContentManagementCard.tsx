
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Trash2, ExternalLink } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBackend } from '@/components/BackendIntegratedWrapper';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  content_url?: string;
  file_link?: string;
  download_count?: number;
  created_at: string;
  exam_type?: string;
  class_level?: string;
  branch?: string;
  level?: string;
  year?: number;
}

interface ContentManagementCardProps {
  item: ContentItem;
  contentType: 'notes' | 'pyqs';
  onEdit?: (item: ContentItem) => void;
}

const ContentManagementCard: React.FC<ContentManagementCardProps> = ({
  item,
  contentType,
  onEdit
}) => {
  const { deleteNote, deletePyq, handleDownload } = useBackend();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      if (contentType === 'notes') {
        await deleteNote(item.id);
      } else if (contentType === 'pyqs') {
        await deletePyq(item.id);
      }
      // Success toast is handled by the backend wrapper
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleDownloadClick = () => {
    const fileUrl = item.content_url || item.file_link;
    if (fileUrl) {
      handleDownload(item.id, contentType, fileUrl);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              {item.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
                className="p-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the {contentType === 'notes' ? 'note' : 'PYQ'} "{item.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {item.subject && (
            <Badge variant="secondary">{item.subject}</Badge>
          )}
          {item.exam_type && (
            <Badge variant="outline">{item.exam_type}</Badge>
          )}
          {item.class_level && (
            <Badge variant="outline">{item.class_level}</Badge>
          )}
          {item.branch && (
            <Badge variant="outline">{item.branch}</Badge>
          )}
          {item.level && (
            <Badge variant="outline">{item.level}</Badge>
          )}
          {contentType === 'pyqs' && item.year && (
            <Badge variant="outline">{item.year}</Badge>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Created: {formatDate(item.created_at)}</span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {item.download_count || 0} downloads
            </span>
          </div>
          {(item.content_url || item.file_link) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadClick}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Access Content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentManagementCard;
