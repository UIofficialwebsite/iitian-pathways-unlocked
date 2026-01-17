import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Course } from '@/components/admin/courses/types';
import { uploadImageAndGetUrl } from '@/utils/storageHelpers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MinusCircle, PlusCircle, Loader2, ImageOff, Search, Trash2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// --- Validation Schema ---
const courseFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  exam_category: z.string().nullable(),
  price: z.number().min(0),
  discounted_price: z.number().nullable(),
  duration: z.string().min(1),
  features: z.array(z.object({ value: z.string().min(1) })).optional(),
  image_url: z.string().url().nullable().or(z.literal('')),
  bestseller: z.boolean().default(false),
  students_enrolled: z.number().optional().nullable(),
  rating: z.number().optional().nullable(),
  subject: z.string().nullable(),
  start_date: z.string().nullable(),
  course_type: z.string().nullable(),
  branch: z.string().nullable(),
  level: z.string().nullable(),
  enroll_now_link: z.string().url().nullable().or(z.literal('')),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

// Internal type for managing add-ons in the UI
interface AddonItem {
  child_course_id: string;
  child_course_title: string;
  price: number;
}

interface CourseFormProps {
  initialData?: Course;
  onSave: (courseData: Course) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSave, onClose, isSaving }) => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // --- Bundle / Add-on State ---
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      id: initialData?.id || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      exam_category: initialData?.exam_category || null,
      price: initialData?.price || 0,
      discounted_price: initialData?.discounted_price || null,
      duration: initialData?.duration || '',
      image_url: initialData?.image_url || null,
      bestseller: initialData?.bestseller || false,
      students_enrolled: initialData?.students_enrolled || 0,
      rating: initialData?.rating || 4.0,
      subject: initialData?.subject || null,
      start_date: initialData?.start_date?.split('T')[0] || null,
      course_type: initialData?.course_type || null,
      branch: initialData?.branch || null,
      level: initialData?.level || null,
      enroll_now_link: initialData?.enroll_now_link || null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features" as never,
  });

  // 1. Fetch available courses & existing add-ons on load
  useEffect(() => {
    const loadData = async () => {
      // A. Fetch all courses (to populate the dropdown)
      const { data: allCourses } = await supabase
        .from('courses')
        .select('*')
        .neq('id', initialData?.id || 'new'); // Exclude self
      
      if (allCourses) setAvailableCourses(allCourses as unknown as Course[]);

      // B. If editing, fetch existing linked add-ons
      if (initialData?.id) {
        setIsLoadingAddons(true);
        const { data: existingAddons } = await supabase
          .from('course_addons')
          .select(`
            child_course_id,
            price,
            courses:child_course_id (title)
          `)
          .eq('parent_course_id', initialData.id);

        if (existingAddons) {
          const formatted = existingAddons.map((item: any) => ({
            child_course_id: item.child_course_id,
            child_course_title: item.courses?.title || 'Unknown Course',
            price: item.price
          }));
          setSelectedAddons(formatted);
        }
        setIsLoadingAddons(false);
      }
    };

    loadData();

    // Reset features field array
    if (initialData?.features) {
      form.setValue('features', initialData.features.map(f => ({ value: f })));
    } else {
      form.setValue('features', [{ value: '' }]);
    }
  }, [initialData]);

  // --- Handlers for Add-ons ---
  const handleAddAddon = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;
    
    // Prevent duplicates
    if (selectedAddons.some(a => a.child_course_id === courseId)) return;

    setSelectedAddons(prev => [...prev, {
      child_course_id: course.id,
      child_course_title: course.title,
      price: course.discounted_price || course.price // Default to current price
    }]);
  };

  const handleRemoveAddon = (childId: string) => {
    setSelectedAddons(prev => prev.filter(a => a.child_course_id !== childId));
  };

  const handleAddonPriceChange = (childId: string, newPrice: number) => {
    setSelectedAddons(prev => prev.map(a => 
      a.child_course_id === childId ? { ...a, price: newPrice } : a
    ));
  };

  // --- Submit Handler ---
  const onSubmit = async (data: CourseFormData) => {
    if (isUploading || isSaving) return;
    setIsUploading(true);

    let finalImageUrl = data.image_url;

    // 1. Handle Image Upload
    if (imageFile) {
      const newUrl = await uploadImageAndGetUrl(imageFile, data.title);
      if (newUrl) finalImageUrl = newUrl;
      else {
        toast({ title: "Image Upload Failed", variant: "destructive" });
        setIsUploading(false);
        return;
      }
    }
    
    // 2. Prepare Main Course Data
    const courseToSave = {
      ...data,
      id: data.id || initialData?.id || undefined,
      image_url: finalImageUrl,
      features: data.features?.map(f => f.value).filter(Boolean) || null,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    try {
      // 3. Save Main Course (Wait for ID if new)
      // Note: We need to modify onSave to return the ID if it's a new course
      // For now, assuming onSave handles the basic update/insert
      await onSave(courseToSave as unknown as Course);

      // If we are editing an EXISTING course, we can update relations immediately.
      // If NEW, we technically need the new ID. 
      // *Limitation Fix*: This assumes we are Editing. For 'Create', ideally save first then redirect to Edit.
      const parentId = initialData?.id; 

      if (parentId) {
        // 4. Update Relations (Delete old, Insert new)
        // This is a simple "Sync" strategy
        
        // A. Delete all existing addons for this course
        await supabase.from('course_addons').delete().eq('parent_course_id', parentId);

        // B. Insert new list
        if (selectedAddons.length > 0) {
          const addonsPayload = selectedAddons.map(addon => ({
            parent_course_id: parentId,
            child_course_id: addon.child_course_id,
            price: addon.price,
            display_order: 0
          }));
          
          const { error: addonError } = await supabase.from('course_addons').insert(addonsPayload);
          if (addonError) {
            console.error("Error saving bundles:", addonError);
            toast({ title: "Course saved, but bundle items failed.", variant: "destructive" });
          }
        }
      }

      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Error saving course", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isSaving || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-[80vh] overflow-y-auto pr-2">
        
        {/* --- Image Section --- */}
        <div className="space-y-2">
          <Label>Course Image</Label>
          <div className="flex items-center space-x-4">
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])} disabled={isSubmitting} />
            {imageFile || form.watch('image_url') ? (
              <img src={imageFile ? URL.createObjectURL(imageFile) : form.watch('image_url')!} className="h-16 w-16 object-cover rounded" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center"><ImageOff className="h-6 w-6 text-gray-400" /></div>
            )}
          </div>
        </div>

        {/* --- Basic Info --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        {/* --- Pricing & Type --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="discounted_price" render={({ field }) => (
                <FormItem><FormLabel>Offer Price (₹)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="course_type" render={({ field }) => (
                <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Live">Live</SelectItem><SelectItem value="Recorded">Recorded</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                    </Select>
                </FormItem>
            )} />
             <FormField control={form.control} name="exam_category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="IITM BS">IITM BS</SelectItem><SelectItem value="JEE">JEE</SelectItem><SelectItem value="NEET">NEET</SelectItem></SelectContent>
                    </Select>
                </FormItem>
            )} />
        </div>

        {/* --- BUNDLE MANAGEMENT SECTION (NEW) --- */}
        {initialData?.id && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Bundle Add-ons (Optional Subjects)</h3>
                <p className="text-xs text-slate-500">Select subjects students can add to this batch for an extra cost.</p>
              </div>
              {isLoadingAddons && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            <div className="flex gap-2">
              <Select onValueChange={handleAddAddon}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Add a course..." /></SelectTrigger>
                <SelectContent>
                  {availableCourses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title} ({c.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAddons.length > 0 ? (
              <div className="space-y-2">
                {selectedAddons.map((addon) => (
                  <div key={addon.child_course_id} className="flex items-center gap-3 bg-white p-2 border rounded-md shadow-sm">
                    <span className="flex-1 text-sm font-medium">{addon.child_course_title}</span>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-500">Bundle Price:</Label>
                      <Input 
                        type="number" 
                        className="w-24 h-8 text-sm" 
                        value={addon.price}
                        onChange={(e) => handleAddonPriceChange(addon.child_course_id, Number(e.target.value))}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleRemoveAddon(addon.child_course_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed rounded-md text-slate-400 text-xs">
                No add-ons selected. This will be a standard single course.
              </div>
            )}
          </div>
        )}

        {/* --- Features --- */}
        <div>
          <Label>Features</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 mb-2 items-center">
              <FormField control={form.control} name={`features.${index}.value` as const} render={({ field }) => (
                  <FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}><MinusCircle className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}><PlusCircle className="h-4 w-4 mr-2" /> Add Feature</Button>
        </div>
        
        {/* Actions */}
        <div className="pt-4 flex justify-end space-x-2 sticky bottom-0 bg-white border-t p-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSaving ? "Saving..." : "Save Course"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
