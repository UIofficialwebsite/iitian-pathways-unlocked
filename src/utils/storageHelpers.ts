// src/utils/storageHelpers.ts
import { supabase } from '@/integrations/supabase/client';
// Use a constant for your bucket name (e.g., 'course-images')
const COURSE_IMAGES_BUCKET = 'course_images'; 

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The File object selected by the user.
 * @param fileName A base name for the file (e.g., the course title) for the path.
 * @returns The public URL of the uploaded image, or null if upload fails.
 */
export async function uploadImageAndGetUrl(file: File, fileName: string): Promise<string | null> {
  if (!file) return null;

  // 1. Define a unique path to prevent conflicts
  // Using a sanitized title, a unique ID (Date.now()), and the file extension
  const fileExtension = file.name.split('.').pop();
  const sanitizedName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const path = `${sanitizedName}-${Date.now()}.${fileExtension}`;

  // 2. Execute the upload
  const { data, error: uploadError } = await supabase.storage
    .from(COURSE_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600', // Cache file for 1 hour (3600 seconds)
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    // You should handle errors here (e.g., show a toast notification)
    return null;
  }

  // 3. Get the Public URL
  // The 'data.path' contains the unique path used for upload
  const { data: publicUrlData } = supabase.storage
    .from(COURSE_IMAGES_BUCKET)
    .getPublicUrl(data.path);
    
  // This is the direct photo link you need for the image_url column.
  return publicUrlData.publicUrl;
}
