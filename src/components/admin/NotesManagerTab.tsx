
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Download, Search } from "lucide-react";
import { Note } from "@/hooks/useNotesManager";

const NotesManagerTab = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExamType, setFilterExamType] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class_level: '',
    exam_type: '',
    branch: '',
    level: '',
    session: '',
    shift: '',
    file_link: '',
  });

  // Subject options based on exam type
  const getSubjectOptions = (examType: string) => {
    switch (examType) {
      case 'JEE':
        return ['Physics', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Mathematics'];
      case 'NEET':
        return ['Physics', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Botany', 'Zoology'];
      case 'IITM_BS':
        return formData.branch === 'Data Science' 
          ? ['Mathematics', 'Statistics', 'Programming', 'Data Analysis']
          : ['Electronics', 'Signal Processing', 'Circuit Design', 'Digital Systems'];
      default:
        return [];
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as unknown as Note[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class_level: '',
      exam_type: '',
      branch: '',
      level: '',
      session: '',
      shift: '',
      file_link: '',
    });
    setEditingNote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const noteData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || null,
        class_level: formData.class_level || null,
        exam_type: formData.exam_type || null,
        branch: formData.exam_type === 'IITM_BS' ? formData.branch : null,
        level: formData.exam_type === 'IITM_BS' ? formData.level : null,
        session: formData.exam_type === 'JEE' ? formData.session : null,
        shift: formData.exam_type === 'JEE' ? formData.shift : null,
        file_link: formData.file_link || null,
        upload_date: new Date().toISOString(),
        download_count: 0,
        is_active: true,
      };

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;
        toast({ title: "Success", description: "Note updated successfully" });
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([noteData]);

        if (error) throw error;
        toast({ title: "Success", description: "Note created successfully" });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description || '',
      subject: note.subject || '',
      class_level: note.class_level || '',
      exam_type: note.exam_type || '',
      branch: note.branch || '',
      level: note.level || '',
      session: note.session || '',
      shift: note.shift || '',
      file_link: note.file_link || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_active: false })
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: "Success", description: "Note deleted successfully" });
      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterExamType === 'all' || note.exam_type === filterExamType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Notes Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-royal hover:bg-royal-dark" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
              <DialogDescription>
                {editingNote ? 'Update note details' : 'Fill in the note information'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="exam_type">Exam Type *</Label>
                  <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value, subject: '', branch: '', level: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="IITM_BS">IITM BS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubjectOptions(formData.exam_type).map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class_level">Class Level</Label>
                  <Input
                    id="class_level"
                    value={formData.class_level}
                    onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                    placeholder="e.g., Class 11, Class 12"
                  />
                </div>
              </div>

              {formData.exam_type === 'IITM_BS' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value, subject: '' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Electronic System">Electronic System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Qualifier">Qualifier</SelectItem>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Degree">Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.exam_type === 'JEE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session">Session</Label>
                    <Input
                      id="session"
                      value={formData.session}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      placeholder="e.g., Session 1, Session 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shift">Shift</Label>
                    <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shift 1">Shift 1</SelectItem>
                        <SelectItem value="Shift 2">Shift 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="file_link">File Link</Label>
                <Input
                  id="file_link"
                  type="url"
                  value={formData.file_link}
                  onChange={(e) => setFormData({ ...formData, file_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingNote ? 'Update Note' : 'Create Note'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterExamType} onValueChange={setFilterExamType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by exam type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exam Types</SelectItem>
            <SelectItem value="JEE">JEE</SelectItem>
            <SelectItem value="NEET">NEET</SelectItem>
            <SelectItem value="IITM_BS">IITM BS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes List */}
      <div className="grid gap-4">
        {filteredNotes.length === 0 ? (
          <Card className="p-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-500">No notes found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first note to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {note.title}
                      {note.exam_type && <Badge variant="outline">{note.exam_type}</Badge>}
                    </CardTitle>
                    <CardDescription>{note.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {note.file_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={note.file_link} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {note.subject && <div><span className="font-medium">Subject:</span> {note.subject}</div>}
                  {note.class_level && <div><span className="font-medium">Class:</span> {note.class_level}</div>}
                  {note.branch && <div><span className="font-medium">Branch:</span> {note.branch}</div>}
                  {note.level && <div><span className="font-medium">Level:</span> {note.level}</div>}
                  {note.session && <div><span className="font-medium">Session:</span> {note.session}</div>}
                  {note.shift && <div><span className="font-medium">Shift:</span> {note.shift}</div>}
                  <div><span className="font-medium">Downloads:</span> {note.download_count}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesManagerTab;
