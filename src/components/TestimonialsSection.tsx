import React from "react";

const testimonialsData = [
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
    text: "I come from a non-maths background, so the thought of even attempting the qualifier gave me anxiety. But once I joined the classes, things actually started making sense. The way they explained every small step made me feel included, not behind.",
    name: "Aanya",
    role: "IITM BS - Qualifier",
  },
  {
    text: "I started preparing just using their free videos and notes. A week later, I joined the batch and things got even better. The teachers actually cared about what we understood. For the first time, I didn't feel like I was studying alone.",
    name: "Riya",
    role: "IITM BS - Qualifier",
  },
  {
    text: "I'm from a non-maths background and honestly, I was scared. But the way the teachers approached maths made it so doable. The regular practice and tips actually helped me enjoy solving things.",
    name: "Yash",
    role: "IITM BS - Qualifier",
  },
  {
    text: "I've always struggled to stay consistent, but the way the classes were scheduled helped me build a routine. The notes were easy to refer to, especially before deadlines. It felt like everything I needed was already thought of and kept ready for me.",
    name: "Kriti",
    role: "IITM BS - Foundation",
  },
  {
    text: "Joining the classes was a good decision for me. But what made the real difference were the tools and notes. I could revise on my own between classes, and I didn't feel lost like I usually do.",
    name: "Raghav",
    role: "IITM BS - Foundation",
  },
  {
    text: "I'm working alongside studying, so I didn't have time to attend live lectures regularly. But their content was always updated and clear. I could watch what I needed, when I needed it, and that made a huge difference.",
    name: "Siddharth",
    role: "IITM BS - Foundation",
  },
  {
    text: "I work full-time, so I couldn't commit to live classes. Still, the notes and tools on the website were more than enough. I didn't need to waste time searching anywhere else. Everything was clear, simple, and exactly what I needed to stay on track.",
    name: "Divya",
    role: "IITM BS - Diploma",
  },
  {
    text: "I was just looking for good-quality notes and I ended up using almost everything they had. The mock tests helped me figure out what I was missing and I didn't need to use any other source after that.",
    name: "Priya",
    role: "IITM BS - Diploma",
  },
  {
    text: "I didn't attend any classes. I just used their free notes, previous year questions, and mock tests. And even then, I felt more confident this term than I ever have. Everything was neatly arranged and easy to access.",
    name: "Arjun",
    role: "IITM BS - Diploma",
  },
  {
    text: "At first, I thought I'd have to buy a bunch of courses. But the resources here were already enough. The layout of the syllabus, exam tips, and short revision notes helped me sail through without any extra pressure.",
    name: "Tanya",
    role: "IITM BS - Diploma",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-background my-20 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-10">
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg font-semibold text-royal">Testimonials</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
            What our students say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See what our course students have to say about their learning journey.
          </p>
        </div>
        
        <div className="w-full max-w-6xl mx-auto">
          <div 
            className="flex gap-6 overflow-x-auto pb-4" 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#cbd5e1 #f1f5f9',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 max-w-80 bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col h-full">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        @{testimonial.name.toLowerCase()}_{testimonial.role.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}
                      </div>
                      <div className="text-xs text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
