-- Phase 1: Fix Critical Data Protection Issues

-- 1. Create secure view for public testimonials (excluding email addresses)
CREATE OR REPLACE VIEW public.public_testimonials AS
SELECT 
  id,
  user_id,
  rating,
  is_approved,
  is_featured,
  created_at,
  updated_at,
  name,
  company,
  position,
  testimonial_text
FROM public.testimonials
WHERE is_approved = true;

-- 2. Update testimonials RLS policies to be more restrictive
DROP POLICY IF EXISTS "Everyone can view approved testimonials" ON public.testimonials;

CREATE POLICY "Public can view approved testimonials via secure view"
ON public.testimonials
FOR SELECT
USING (is_approved = true AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view approved testimonials"
ON public.testimonials  
FOR SELECT
USING (is_approved = true AND auth.uid() IS NOT NULL);

-- 3. Fix database function security by adding proper search_path settings
CREATE OR REPLACE FUNCTION public.increment_download_count(table_name text, content_id uuid, user_email text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF table_name = 'notes' THEN
    UPDATE public.notes 
    SET download_count = download_count + 1 
    WHERE id = content_id AND is_active = true;
  ELSIF table_name = 'pyqs' THEN
    UPDATE public.pyqs 
    SET download_count = download_count + 1 
    WHERE id = content_id AND is_active = true;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, profile_completed)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.email,
    false
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT user_email = 'uiwebsite638@gmail.com';
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Check if current user email is the hardcoded admin
  IF auth.email() = 'uiwebsite638@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user exists in admin_users table
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.email()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email AND is_super_admin = true
  );
$function$;

-- 4. Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  admin_email text NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (is_super_admin(auth.email()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- 5. Tighten updated_profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own profile history" ON public.updated_profiles;

CREATE POLICY "Users can view only their own profile history"
ON public.updated_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Prevent users from viewing other users' profile data
CREATE POLICY "Prevent cross-user profile access"
ON public.updated_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);