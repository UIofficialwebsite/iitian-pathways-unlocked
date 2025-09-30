-- Fix testimonials email exposure by restricting direct table access
-- Drop the permissive authenticated user policy that exposes emails
DROP POLICY IF EXISTS "Authenticated users can view approved testimonials" ON public.testimonials;

-- Keep the policy for users to view their own testimonials (they should see their own email)
-- This policy is already properly scoped: "Users can view own testimonials"

-- Update the existing get_public_testimonials function to ensure it's secure
-- This is the ONLY way public/authenticated users should access approved testimonials
CREATE OR REPLACE FUNCTION public.get_public_testimonials()
RETURNS TABLE(
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
  -- Note: email column is intentionally excluded for security
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    -- email is NOT selected
  FROM public.testimonials t
  WHERE t.is_approved = true;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.get_public_testimonials() IS 
'Secure function to retrieve approved testimonials without exposing email addresses. This is the only approved method for public/authenticated users to view testimonials.';

-- Verify admin policy still exists for managing testimonials
-- This should already exist: "Admins can manage testimonials"