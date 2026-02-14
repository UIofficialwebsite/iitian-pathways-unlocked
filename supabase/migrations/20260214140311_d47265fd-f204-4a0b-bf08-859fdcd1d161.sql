
-- Create a trigger function that calls the add-to-google-group edge function
CREATE OR REPLACE FUNCTION public.notify_add_to_google_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://qzrvctpwefhmcduariuw.supabase.co/functions/v1/add-to-google-group',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'profiles',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'full_name', NEW.full_name
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table for INSERT
DROP TRIGGER IF EXISTS trigger_add_to_google_group ON public.profiles;
CREATE TRIGGER trigger_add_to_google_group
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_add_to_google_group();
