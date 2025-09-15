
import React, { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Star, Quote, Users, GraduationCap, Network } from "lucide-react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
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
    text: "I've always had trouble with maths. Group classes used to make me feel even more behind. But here, I could go topic by topic and understand at my own pace. It was simple, but powerful. I wish I had found this earlier.",
    name: "Saket",
    role: "JEE Preparation",
  },
  {
    text: "I didn't do well in JEE the first time and felt stuck. I needed something that didn't feel overwhelming. This website gave me just that. It felt calm, clear, and like a fresh start. I actually enjoy studying again.",
    name: "Moksha",
    role: "JEE Preparation",
  },
  {
    text: "This platform just made everything easier. No ads, no complicated logins. I could find my subject, download the notes, and get started. One of my Kota teachers suggested it and now I tell all my friends too.",
    name: "Harshita",
    role: "NEET Preparation",
  },
  {
    text: "I used to waste hours scrolling through Telegram groups looking for notes. Now, I don't have to. Everything's here, well arranged, and accurate. It's like someone finally understood what we students really need.",
    name: "Tarun",
    role: "NEET Preparation",
  },
  {
    text: "Preparing for both exams used to drain me out. I didn't know where to start or what to focus on. This site gave me a direction. I followed their study plans and just trusted the process. It worked.",
    name: "Ananya",
    role: "JEE & NEET Preparation",
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonialsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Use the secure function that excludes email addresses
        const { data, error } = await supabase.rpc('get_public_testimonials');
        
        if (error) {
          console.error('Error fetching testimonials:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Transform database testimonials to match our component format
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

  // Split testimonials into columns for the display
  const firstColumn = testimonials.slice(0, Math.ceil(testimonials.length / 3));
  const secondColumn = testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil((testimonials.length * 2) / 3));
  const thirdColumn = testimonials.slice(Math.ceil((testimonials.length * 2) / 3));

  if (isLoading) {
    return (
      <section className="bg-background my-20 relative">
        <div className="container z-10 mx-auto">
          <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-lg font-semibold text-royal">Testimonials</div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
              What our users say
            </h2>
            <p className="text-center mt-5 opacity-75">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg font-semibold text-royal">Testimonials</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
            What our users say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See what our community has to say about Unknown IITians.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={16} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={20} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={18} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
