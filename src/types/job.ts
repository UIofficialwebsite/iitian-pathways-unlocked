export interface Job {
  id: string;
  title: string;
  job_type: string;
  location: string;
  stipend: string | null;
  duration: string | null;
  deadline: string | null; // Dates often come as strings from JSON APIs
  skills: string[] | null;
  description: string | null;
  requirements: string[] | null;
  application_url: string | null;
  company: string;
  experience_level: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
