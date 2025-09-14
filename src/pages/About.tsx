
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import PartnershipsSection from "@/components/PartnershipsSection";
import { Timeline } from "@/components/ui/timeline";

const About = () => {
  const timelineData = [
    {
      title: "2024",
      content: (
        <div>
          <h4 className="text-xl font-bold text-royal mb-4">The Foundation Year</h4>
          
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Mid-Year Milestone</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Launched YouTube Channel:</strong> Established our digital presence to provide free educational resources</p>
              <p><strong>Focus Area:</strong> Specialized content for IIT Madras BS Degree students</p>
              <p><strong>Mission:</strong> Making quality education accessible to aspiring students</p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">End of Year Achievement</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Website Launch:</strong> Developed our official website using a Free CRM Portal</p>
              <p><strong>Resource Hub:</strong> Created a comprehensive platform offering free resources for IIT Madras BS Degree</p>
              <p><strong>Community Building:</strong> Started building a student community around our platform</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2025",
      content: (
        <div>
          <h4 className="text-xl font-bold text-royal mb-4">Expansion & Growth</h4>
          
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Early 2025 - Global Outreach</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Worldwide Support:</strong> Extended our services to support IIT Madras BS Degree students across the globe</p>
              <p><strong>Strategic Partnerships:</strong> Collaborated with startups to integrate students into the startup and tech ecosystem</p>
              <p><strong>Career Development:</strong> Created pathways for students to explore entrepreneurial opportunities</p>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Key Launches</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Mentorship Batches:</strong> Launched comprehensive mentorship programs</p>
              <p><strong>Outstanding Response:</strong> Received overwhelming positive feedback from the student community</p>
              <p><strong>Personalized Guidance:</strong> Provided one-on-one mentorship for academic and career growth</p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Mid-2025 - Major Expansion</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Full-Length Batches:</strong> Launched comprehensive preparation courses for IIT Madras BS Qualifier</p>
              <p><strong>Team Growth:</strong> Expanded our team and provided employment opportunities to qualified individuals</p>
              <p><strong>Diversified Offerings:</strong> Extended services to Class 11 & 12 Science stream students preparing for JEE and NEET</p>
              <p><strong>Free Resource Expansion:</strong> Made quality educational resources available to a broader student base</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-royal/10 to-golden/10 rounded-lg p-6 mb-6 border border-royal/20">
            <h5 className="text-lg font-bold text-royal mb-3">MAJOR MILESTONE: BECAME A REGISTERED COMPANY</h5>
            <p className="text-gray-700">Officially established as a legitimate business entity, marking our transformation from a startup initiative to a formal organization</p>
          </div>
        </div>
      ),
    },
    {
      title: "Future",
      content: (
        <div>
          <h4 className="text-xl font-bold text-royal mb-4">Vision & Goals</h4>
          
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Educational Excellence</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Dual Approach:</strong> Continue providing both free and premium educational resources</p>
              <p><strong>Quality Assurance:</strong> Maintain high standards in all educational offerings</p>
              <p><strong>Accessibility:</strong> Ensure resources remain accessible to students from all backgrounds</p>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Career & Placement Support</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Placement Assistance:</strong> Develop comprehensive placement support programs</p>
              <p><strong>Industry Connections:</strong> Build strong networks with leading companies and organizations</p>
              <p><strong>Career Guidance:</strong> Provide end-to-end career development support</p>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Entrepreneurship & Innovation</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Startup Ecosystem:</strong> Encourage and support students in their entrepreneurial ventures</p>
              <p><strong>Opportunity Creation:</strong> Provide platforms and chances for students to showcase their talents</p>
              <p><strong>Employment Generation:</strong> Focus on creating more employment opportunities within the education sector</p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Long-term Impact</h5>
            <div className="space-y-2 text-gray-600">
              <p><strong>Student Empowerment:</strong> Enable students to achieve their academic and career aspirations</p>
              <p><strong>Community Building:</strong> Foster a strong network of successful alumni and current students</p>
              <p><strong>Educational Revolution:</strong> Contribute to transforming the educational landscape in India</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover the journey and mission behind Unknown IITians
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>

              <div className="prose prose-lg max-w-none">
                <p>
                  Unknown IITians was born from the shared vision of two entrepreneurial-minded friends who met in the heart of India's coaching hub—a city where thousands of students chase dreams of cracking competitive exams like JEE and NEET. Amid the relentless pressure and the rigid paths carved out by the system, these two visionaries saw a different possibility: a world where education wasn't just about securing a rank but about true learning, exploration, and carving one's unique journey.
                </p>
                
                <p>
                  What started as a simple YouTube channel to guide students through the IIT Madras BS Degree program soon transformed into something much bigger. The duo realized that countless students were struggling—not just with academics, but with a deeper issue: the lack of direction beyond traditional career options. Inspired by their own experiences, they set out to create a platform that wouldn't just help students crack exams but would also empower them to discover careers aligned with their passions.
                </p>
                
                <p>
                  Unknown IITians rapidly expanded its mission, offering high-quality, free resources for JEE, NEET, and other competitive exams. However, the platform stands apart because it doesn't just push students toward the conventional rat race of engineering and medical fields. Instead, it actively promotes alternative career paths, skill-based learning, and entrepreneurial thinking—so students can make informed choices rather than just follow the crowd.
                </p>
                
                <p>
                  Beyond academic support, Unknown IITians provides mentorship programs, real-world skill development, and a thriving community of learners and industry professionals. The goal is simple yet revolutionary: to ensure that students who are genuinely interested in fields like engineering and medicine don't fall behind due to a lack of resources, while also guiding others toward non-traditional careers where they can thrive.
                </p>
                
                <p>
                  With bigger plans on the horizon, Unknown IITians is on a mission to redefine success in education—one student at a time. The journey has only begun, and the future holds limitless possibilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <Timeline data={timelineData} />

        

      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

export default About;
