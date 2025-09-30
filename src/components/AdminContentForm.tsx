
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackend } from '@/components/BackendIntegratedWrapper';

interface AdminContentFormProps {
  type: 'note' | 'pyq';
  onClose: () => void;
}

const AdminContentForm: React.FC<AdminContentFormProps> = ({ type, onClose }) => {
  const { addNote, addPyq } = useBackend();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    file_link: '',
    description: '',
    year: '',
    exam_type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let success: boolean;
      
      if (type === 'note') {
        success = (await addNote({
          title: formData.title,
          subject: formData.subject,
          file_link: formData.file_link,
          description: formData.description
        })) ?? false;
      } else {
        success = (await addPyq({
          title: formData.title,
          subject: formData.subject,
          year: formData.year ? parseInt(formData.year) : null,
          exam_type: formData.exam_type,
          file_link: formData.file_link,
          description: formData.description
        })) ?? false;
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add {type === 'note' ? 'Note' : 'Previous Year Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {type === 'pyq' && (
            <>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="exam_type">Exam Type</Label>
                <Select value={formData.exam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JEE">JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="IITM BS">IITM BS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="file_link">File Link</Label>
            <Input
              id="file_link"
              type="url"
              value={formData.file_link}
              onChange={(e) => setFormData(prev => ({ ...prev, file_link: e.target.value }))}
              placeholder="https://example.com/file.pdf"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminContentForm;
