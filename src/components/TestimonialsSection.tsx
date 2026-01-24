import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = {
  text: string;
  name: string;
  role: string;
};

type DatabaseTestimonial = {
  id: string;
  user_id: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  name: string;
  company: string | null;
  position: string | null;
  testimonial_text: string;
};

// Fallback testimonials in case database fetch fails
const fallbackTestimonialsData: Testimonial[] = [
  {
    text: "The mentorship at Unknown IITians is unparalleled. Transitioning from complex concepts to intuitive problem-solving was made possible by the structured approach and the genuine support of the community. It’s more than just a platform; it’s an ecosystem that focuses on high-yield results.",
    name: "Saket Kumar",
    role: "JEE Advanced Merit | Physics & Mathematics",
  },
  {
    text: "I depended completely on their free website notes and YouTube lectures. The clarity in their teaching helped me clear the qualifier exam in one go with high scores.",
    name: "Meera Iyer",
    role: "IITM BS Degree | Statistics & CT",
  },
  {
    text: "The Foundation batch provided the exact direction I needed. Every session was detailed yet easy to follow, making revision super efficient for my preparation.",
    name: "Aditi Gupta",
    role: "Qualifier Batch | Mathematics",
  },
  {
    text: "Their structured notes and targeted practice papers were exactly what I needed to bridge the gap. I actually enjoy the learning process now without the extra fluff.",
    name: "Rohan Das",
    role: "IITM BS Student | Programming",
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonialsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_testimonials');
        
        if (error) {
          console.error('Error fetching testimonials:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const transformedTestimonials: Testimonial[] = data.map((testimonial: DatabaseTestimonial) => ({
            text: testimonial.testimonial_text,
            name: testimonial.name,
            role: testimonial.position || testimonial.company || 'Student',
          }));
          
          setTestimonials(transformedTestimonials);
        }
      } catch (error) {
        console.error('Unexpected error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Split data: First one is featured, next 3 are grid items
  const featuredTestimonial = testimonials[0];
  const gridTestimonials = testimonials.slice(1, 4);

  return (
    <section className="py-24 bg-white font-['Inter',sans-serif]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-[70px]">
          <h1 className="text-[34px] font-semibold text-[#0f172a] mb-3 tracking-tight flex items-center justify-center gap-3">
            Students <span className="text-red-500">❤️</span> Unknown IITians
          </h1>
          <p className="text-[#64748b] text-[17px] font-normal max-w-[700px] mx-auto leading-relaxed">
            See what our students have to say us
          </p>
        </div>

        {/* Featured Row (Unique Tinted Card) */}
        {featuredTestimonial && (
          <div className="mb-6">
            <div className="relative border border-black/10 rounded-lg bg-slate-50 overflow-hidden flex flex-col">
              {/* Corner Fade */}
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: 'radial-gradient(circle at bottom right, rgba(30, 58, 138, 0.08) 0%, transparent 70%)' }}
              />
              
              <div className="relative z-10 p-8 lg:p-[45px]">
                <div className="text-[55px] text-black/5 font-serif leading-none mb-2">“</div>
                <p className="text-[17px] leading-[1.75] text-slate-700 mb-[30px] font-normal max-w-[95%] lg:max-w-[85%]">
                  {featuredTestimonial.text}
                </p>
                <div className="">
                  <h4 className="text-[18px] font-semibold text-[#0f172a] mb-1">
                    {featuredTestimonial.name}
                  </h4>
                  <p className="text-[13px] text-[#64748b] font-medium flex items-center gap-2.5">
                    {featuredTestimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid Row (Standard Blocks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative border border-black/10 rounded-lg bg-white overflow-hidden flex flex-col h-full"
            >
              {/* Corner Fade */}
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.03) 0%, transparent 60%)' }}
              />

              <div className="relative z-10 p-[35px] lg:p-[45px] flex flex-col h-full">
                <div className="text-[55px] text-black/5 font-serif leading-none mb-2">“</div>
                <p className="text-[15px] leading-[1.75] text-slate-700 mb-[30px] font-normal flex-grow">
                  {testimonial.text}
                </p>
                <div className="mt-auto">
                  <h4 className="text-[18px] font-semibold text-[#0f172a] mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-[13px] text-[#64748b] font-medium flex items-center gap-2.5">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
