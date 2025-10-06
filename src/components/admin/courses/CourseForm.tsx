// src/components/admin/courses/CourseForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Course } from '@/components/admin/courses/types'; //
import { uploadImageAndGetUrl } from '@/utils/storageHelpers'; // Assumed path for the upload utility
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MinusCircle, PlusCircle, Loader2, ImageOff } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast'; // Assuming you have a toast hook

// --- Zod Schema for Validation ---
const courseFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  exam_category: z.string().nullable(),
  price: z.number().min(0, { message: "Price cannot be negative." }),
  discounted_price: z.number().nullable(),
  duration: z.string().min(1, { message: "Duration is required." }),
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

export type CourseFormData = z.infer<typeof courseFormSchema>;

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
  
  // Prepare features array for react-hook-form
  const defaultFeatures = initialData?.features?.map(f => ({ value: f })) || [{ value: '' }];

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
      start_date: initialData?.start_date?.split('T')[0] || null, // Format date string for input type="date"
      course_type: initialData?.course_type || null,
      branch: initialData?.branch || null,
      level: initialData?.level || null,
      enroll_now_link: initialData?.enroll_now_link || null,
      // features initialized separately by useFieldArray
    },
    values: initialData ? {
        id: initialData.id,
        title: initialData.title,
        description: initialData.description,
        exam_category: initialData.exam_category,
        price: initialData.price,
        discounted_price: initialData.discounted_price,
        duration: initialData.duration,
        image_url: initialData.image_url,
        bestseller: initialData.bestseller || false,
        students_enrolled: initialData.students_enrolled || 0,
        rating: initialData.rating || 4.0,
        subject: initialData.subject || null,
        start_date: initialData.start_date?.split('T')[0] || null,
        course_type: initialData.course_type || null,
        branch: initialData.branch || null,
        level: initialData.level || null,
        enroll_now_link: initialData.enroll_now_link || null,
        features: defaultFeatures
      } : undefined
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features" as never, // Type assertion is needed here
  });

  const onSubmit = async (data: CourseFormData) => {
    if (isUploading || isSaving) return;
    setIsUploading(true);

    let finalImageUrl = data.image_url;

    if (imageFile) {
      // 1. Upload the file and get the public URL
      const newUrl = await uploadImageAndGetUrl(imageFile, data.title);

      if (newUrl) {
        finalImageUrl = newUrl;
      } else {
        toast({
          title: "Image Upload Failed",
          description: "Could not upload the course image to storage.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
    }
    
    // 2. Prepare final data for database save
    const courseToSave: Course = {
      ...data,
      id: data.id || initialData?.id || '', // Ensure ID is preserved for update
      price: data.price,
      discounted_price: data.discounted_price,
      students_enrolled: data.students_enrolled,
      rating: data.rating,
      image_url: finalImageUrl, // Use the new or old URL
      features: data.features?.map(f => f.value).filter(Boolean) || null, // Convert array of objects to array of strings
      // created_at and updated_at are handled by the database
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Course;
    
    // 3. Save the course
    try {
      await onSave(courseToSave);
      onClose();
    } catch (error) {
      console.error("Database save error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isSaving || isUploading;

  // Use useEffect to update the form's features array only once on mount/initialData change
  useEffect(() => {
    if (initialData && initialData.features) {
      form.reset({
        ...form.getValues(),
        features: initialData.features.map(f => ({ value: f })),
      });
    } else if (!initialData) {
        form.reset({
            ...form.getValues(),
            features: [{ value: '' }]
        })
    }
  }, [initialData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Course Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="course-image">Course Image (Upload or Keep Existing)</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="course-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              disabled={isSubmitting}
            />
            
            {/* Display preview of currently selected file or existing image_url */}
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-16 w-16 object-cover rounded" />
            ) : form.watch('image_url') ? (
              <img src={form.watch('image_url') || undefined} alt="Current" className="h-16 w-16 object-cover rounded" />
            ) : (
                <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    <ImageOff className="h-6 w-6" />
                </div>
            )}
          </div>
          <FormDescription>Current URL: {form.watch('image_url') || 'None'}</FormDescription>
          {/* Note: image_url is only updated on successful upload */}
        </div>

        {/* Title and Description */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="JEE Advanced 2025 Crash Course" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A detailed breakdown of the syllabus..." rows={3} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Exam Category, Subject, Course Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="exam_category"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Exam Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="IITM BS">IITM BS</SelectItem>
                                <SelectItem value="JEE">JEE</SelectItem>
                                <SelectItem value="NEET">NEET</SelectItem>
                                {/* Add more categories as needed */}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="Mathematics, Physics, etc." {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="course_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Live">Live</SelectItem>
                                <SelectItem value="Recorded">Recorded</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Price, Discounted Price, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Original Price (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="9999" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="discounted_price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Discounted Price (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="7999" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                            <Input placeholder="3 Months" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Enrollment Link and Start Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="enroll_now_link"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Enrollment Link</FormLabel>
                        <FormControl>
                            <Input placeholder="https://buy.link/course-123" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Bestseller Switch */}
        <FormField
          control={form.control}
          name="bestseller"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Bestseller Status
                </FormLabel>
                <FormDescription>
                  Mark this course as a bestseller to highlight it.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Dynamic Features List */}
        <div>
          <Label className="text-base font-semibold">Course Features</Label>
          <FormDescription className="mb-4">List key features of the course.</FormDescription>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 mb-2 items-center">
              <FormField
                control={form.control}
                name={`features.${index}.value` as const}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Feature Point" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1 || isSubmitting}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ value: '' })}
            disabled={isSubmitting}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Feature
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSaving ? "Saving..." : "Uploading Image..."}
              </>
            ) : initialData ? (
              "Update Course"
            ) : (
              "Create Course"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
