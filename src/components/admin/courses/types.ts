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
  updated_at?: string | null;
  subject: string | null;
  start_date: string | null;
  end_date: string | null;
  valid_till?: string | null; // Added valid_till property
  course_type: string | null;
  batch_type?: string | null;
  branch: string | null;
  level: string | null;
  enroll_now_link: string | null;
  language: string | null;
  student_status?: string | null;
  parent_course_id?: string | null;
  is_live?: boolean | null;
}
