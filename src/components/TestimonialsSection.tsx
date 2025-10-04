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
  {
    text: "The visual aids and simplified notes for Biology were a game-changer. Complex topics finally clicked, and I felt more confident walking into my exam.",
    name: "Priya",
    role: "NEET Preparation",
  },
  {
    text: "After cracking the JEE Mains, the advanced level content felt daunting. This platform’s structured approach and targeted practice papers were exactly what I needed to bridge the gap.",
    name: "Rohan",
    role: "JEE Advanced",
  },
  {
    text: "Starting my JEE prep early, I was overwhelmed with information. This site helped me build a strong foundation, making my class 11th concepts crystal clear.",
    name: "Sneha",
    role: "Class 11 Student",
  },
  {
    text: "Taking a drop year is tough, but this platform provided the support and resources I was missing. The 24/7 access to materials meant I could study whenever I felt most focused.",
    name: "Amit",
    role: "Dropper Student",
  },
  {
    text: "The flexibility of the IITM BS program allowed me to continue my job while pursuing a degree from a prestigious institution. The course content is top-notch and highly relevant to the industry.",
    name: "Aditya",
    role: "IITM BS Student",
  },
  {
    text: "I was hesitant about an online degree, but the interactive sessions and the support from the instructors at IITM BS have been incredible. I feel part of a real community.",
    name: "Neha",
    role: "IITM BS Student",
  },
  {
    text: "The hands-on projects and the emphasis on practical skills in the IITM BS program have given me the confidence to tackle real-world problems. It's an amazing learning experience.",
    name: "Karthik",
    role: "IITM BS Student",
  },
  {
    name: "Riya Sharma",
    role: "IITM BS Qualifier",
    text: "I joined the Foundation batch mainly for Maths 1 and Statistics 1, and it completely changed how I approached the subjects. The explanations were simple and focused on the qualifier pattern. I used only their free notes and YouTube lectures — that was more than enough to pass confidently.",
  },
  {
    name: "Aditya Verma",
    role: "IITM BS Qualifier",
    text: "The Foundation batch for Python and Maths 2 helped me understand the logic behind every problem. The classes were structured perfectly for beginners. I didn’t need any other coaching — the notes on their website and YouTube videos covered everything.",
  },
  {
    name: "Sneha Patel",
    role: "IITM BS Qualifier",
    text: "I was a free learner who followed their YouTube playlist for Statistics 2 and Maths 2. The teachers explained every topic slowly and clearly, and their free notes made revision super easy. Even without joining a batch, I was able to qualify comfortably.",
  },
  {
    name: "Arjun Nair",
    role: "IITM BS Qualifier",
    text: "The Foundation batch gave me direction and consistency. I studied Python, Computational Thinking, and Stats 1 through their lectures, and every class connected directly to the qualifier syllabus. The handwritten notes were gold — short, clear, and precise.",
  },
  {
    name: "Meera Iyer",
    role: "IITM BS Qualifier",
    text: "I was working full-time, so I depended completely on their free website notes and YouTube lectures. I covered Python, Maths 2, and Stats 2 at my own pace. The clarity and structure in their teaching helped me clear the exam in one go.",
  },
  {
    name: "Karthik Rao",
    role: "IITM BS Qualifier",
    text: "The Maths 1 and Statistics 1 Foundation batch was a lifesaver. The topics were explained from the basics, and the practice sets made me confident. Their free resources are better than many paid ones out there.",
  },
  {
    name: "Aditi Gupta",
    role: "IITM BS Qualifier",
    text: "I joined the Foundation batch for all subjects — Python, Stats 2, Maths 1, Maths 2, and Computational Thinking. Every session was detailed yet easy to follow. The notes and recorded lectures were my main source of study. I’m truly thankful for the effort they put in.",
  },
  {
    name: "Rahul Mehta",
    role: "IITM BS Qualifier",
    text: "I studied only through their free materials and YouTube videos. The playlists for Python and Stats 2 were exactly what I needed. Everything was so clear that I didn’t have to look anywhere else. I passed all subjects using just their content.",
  },
  {
    name: "Pooja Singh",
    role: "IITM BS Qualifier",
    text: "The Foundation batch for Maths 2 and Stats 1 helped me stay consistent. I used to get confused with problem-solving, but the teachers explained every step. The free notes made my revision quick and efficient.",
  },
  {
    name: "Aman Tiwari",
    role: "IITM BS Qualifier",
    text: "I didn’t take any paid course — just used their YouTube lectures and website notes. The Foundation-style teaching was visible even in free videos. Concepts in Python and Computational Thinking became so clear that I was confident during the exam.",
  },
  {
    name: "Divya Ramesh",
    role: "IITM BS Qualifier",
    text: "The Foundation batch gave me discipline. I studied regularly through their schedule for Maths 1, Stats 2, and CT. The explanations were always concept-based, not rote learning. The mentors genuinely care about students.",
  },
  {
    name: "Saurabh Jain",
    role: "IITM BS Qualifier",
    text: "Even though I only used their free content, it felt like I was part of the Foundation batch. The lectures for Python and Statistics 1 were so well explained. The handwritten notes saved a lot of my time during revision.",
  },
  {
    name: "Neha Bansal",
    role: "IITM BS Qualifier",
    text: "The Foundation batch made Statistics 2 and Maths 2 easy for me. The teachers explained real qualifier questions and guided us on how to approach them. I just followed their plan and it worked perfectly.",
  },
  {
    name: "Rohan Das",
    role: "IITM BS Qualifier",
    text: "I started as a free student using their YouTube channel, then joined the Foundation batch later. The improvement was visible immediately. Python and Maths 1 became my strongest subjects. The structured approach made learning so much smoother.",
  },
  {
    name: "Tanvi Sharma",
    role: "IITM BS Qualifier",
    text: "I loved how the Foundation batch explained every topic from scratch. Whether it was Stats 1 or CT, the lectures were simple and clear. The free notes and examples were all I needed to prepare properly.",
  },
  {
    name: "Harshit Agarwal",
    role: "IITM BS Qualifier",
    text: "Their free resources are honestly underrated. The Python lectures on YouTube are better than many paid platforms. I used their notes for Stats 2 and passed comfortably. The Foundation team really knows how to teach.",
  },
  {
    name: "Ananya Joshi",
    role: "IITM BS Qualifier",
    text: "The Foundation batch for Maths 1 and Stats 1 helped me fix all my basics. I was scared of the subjects earlier, but their calm explanations made everything simple. I’m thankful for their support throughout my preparation.",
  },
  {
    name: "Vikram Menon",
    role: "IITM BS Qualifier",
    text: "I followed their Foundation plan on my own using the free content. The Python and CT lectures were excellent. The teachers always connected theory to real examples. It made learning both interesting and effective.",
  },
  {
    name: "Kritika Sinha",
    role: "IITM BS Qualifier",
    text: "Maths 2 and Stats 2 were completely new to me, but the Foundation batch covered every topic step by step. The notes were neatly organized and helped me revise quickly. I cleared all subjects in my first attempt thanks to their support.",
  },
  {
    name: "Nikhil Raj",
    role: "IITM BS Qualifier",
    text: "I studied entirely through their YouTube channel. The playlists for Python, CT, and Maths 1 were perfect. The teachers explained concepts in such a simple way that I never felt lost. Even without joining the batch, I could easily qualify.",
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

  // Split testimonials into columns for a more balanced display
  const columns: Testimonial[][] = [[], [], []];
  testimonials.forEach((testimonial, index) => {
    columns[index % 3].push(testimonial);
  });
  const [firstColumn, secondColumn, thirdColumn] = columns;

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
