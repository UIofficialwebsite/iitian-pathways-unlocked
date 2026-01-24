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
  {
    text: "Coming from a non-tech background, I was intimidated by Python. The assignments and live doubt sessions here gave me the confidence to not just pass but excel.",
    name: "Priya Sharma",
    role: "IITM BS Degree | Python",
  },
  {
    text: "The mock tests are incredibly close to the actual exam pattern. It helped me manage my time better and identifying my weak areas before the main day.",
    name: "Vikram Singh",
    role: "JEE Main | Class 12",
  },
  {
    text: "Simple, effective, and to the point. The community support is the cherry on top—whenever I was stuck, there was someone to help out immediately.",
    name: "Anjali Menon",
    role: "NEET Aspirant | Biology",
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

  // Split data
  const featuredTestimonial = testimonials[0];
  const scrollableTestimonials = testimonials.slice(1);

  return (
    // Changed bg-gray-50 to bg-gray-100 for a slightly darker grey background
    <section className="py-24 bg-gray-100 font-['Inter',sans-serif] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-[50px] lg:mb-[70px]">
          <h1 className="text-[28px] lg:text-[34px] font-semibold text-[#0f172a] mb-3 tracking-tight flex items-center justify-center gap-3">
            ❤️<span className="text-red-500">for</span> Unknown IITians
          </h1>
          <p className="text-[#64748b] text-[15px] lg:text-[17px] font-normal max-w-[700px] mx-auto leading-relaxed">
            See what our students have to say about us
          </p>
        </div>

        {/* --- ROW 1: Featured Testimonial --- */}
        {featuredTestimonial && (
          <div className="mb-8 lg:mb-10">
            <div className="relative border border-black/5 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
              {/* Corner Fade */}
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: 'radial-gradient(circle at bottom right, rgba(30, 58, 138, 0.05) 0%, transparent 70%)' }}
              />
              
              <div className="relative z-10 p-8 lg:p-[50px]">
                <div className="text-[55px] text-black/5 font-serif leading-none mb-3">“</div>
                <p className="text-[16px] lg:text-[18px] leading-[1.75] text-slate-700 mb-[30px] font-normal max-w-[95%] lg:max-w-[85%]">
                  {featuredTestimonial.text}
                </p>
                <div className="">
                  <h4 className="text-[19px] font-semibold text-[#0f172a] mb-1">
                    {featuredTestimonial.name}
                  </h4>
                  <p className="text-[14px] text-[#64748b] font-medium flex items-center gap-2.5">
                    {featuredTestimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ROW 2: Horizontal Scroll Strip (All other reviews) --- 
            - Enabled flex-nowrap and overflow-x-auto for ALL screens
            - This ensures it stays as a single row that scrolls horizontally
        */}
        <div className="
          flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-5 pb-8 -mx-6 px-6 
          md:mx-0 md:px-0 md:gap-6
          scrollbar-hide
        ">
          {scrollableTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="
                relative border border-black/5 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col flex-shrink-0
                snap-center 
                /* Mobile Width */
                min-w-[85vw] sm:min-w-[350px] 
                /* Desktop Width - Fixed width to allow scrolling */
                lg:min-w-[400px] lg:max-w-[400px]
                h-auto
              "
            >
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.02) 0%, transparent 60%)' }}
              />

              <div className="relative z-10 p-[30px] lg:p-[40px] flex flex-col h-full">
                <div className="text-[55px] text-black/5 font-serif leading-none mb-2">“</div>
                <p className="text-[15px] leading-[1.75] text-slate-700 mb-[30px] font-normal flex-grow">
                  {testimonial.text}
                </p>
                <div className="mt-auto">
                  <h4 className="text-[17px] font-semibold text-[#0f172a] mb-1">
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
