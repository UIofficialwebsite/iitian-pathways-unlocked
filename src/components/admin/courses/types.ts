export interface Course {
  id: string;
  title: string;
  description: string;
  exam_category: string | null;
  price: number;
  discounted_price: number | null;
  duration: string;
  features: string[] | null;
  image_url: string | null;
  bestseller: boolean | null;
  students_enrolled: number | null;
  rating: number | null;
  created_at: string;
  subject: string | null;
  start_date: string | null;
  end_date: string | null;
  course_type: string | null;
  branch: string | null;
  level: string | null;
  enroll_now_link: string | null;
  language: string | null;
  student_status?: string | null; // For compatibility with some components
}
