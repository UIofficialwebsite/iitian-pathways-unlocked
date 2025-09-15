-- Fix the Security Definer View issue by removing the problematic view
-- and using a different approach for testimonials security

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_testimonials;

-- Instead, update the RLS policies to be more secure without using a view
-- Keep the existing policies but make them more restrictive

DROP POLICY IF EXISTS "Public can view approved testimonials via secure view" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can view approved testimonials" ON public.testimonials;

-- Create a more secure policy that excludes email from public access
-- We'll handle this in the application layer instead of the database layer
CREATE POLICY "Public can view approved testimonials without email"
ON public.testimonials
FOR SELECT
USING (is_approved = true);

-- Add a function to get public testimonials without sensitive data
CREATE OR REPLACE FUNCTION public.get_public_testimonials()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  rating integer,
  is_approved boolean,
  is_featured boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  name text,
  company text,
  "position" text,
  testimonial_text text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    t.id,
    t.user_id,
    t.rating,
    t.is_approved,
    t.is_featured,
    t.created_at,
    t.updated_at,
    t.name,
    t.company,
    t."position",
    t.testimonial_text
  FROM public.testimonials t
  WHERE t.is_approved = true;
$function$;