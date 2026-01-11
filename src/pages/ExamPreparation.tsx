
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Users, Calendar, Bell, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const ExamPreparation = () => {
  const examTypes = [
    {
      title: "NEET - Medical MBBS",
      path: "/exam-preparation/neet",
      description: "Comprehensive resources for medical entrance exams",
      icon: BookOpen,
      color: "from-blue-500 to-purple-600",
      features: ["Study Materials", "Previous Papers", "Community Support", "Mock Tests"]
    },
    {
      title: "IIT Madras BS Degree - UG",
      path: "/exam-preparation/iitm-bs",
      description: "Resources for IIT Madras Bachelor of Science programs",
      icon: GraduationCap,
      color: "from-green-500 to-teal-600",
      features: ["Foundation Courses", "Data Science & Electronic Systems", "Exam Preparation", "Mock Tests"]
    },
    {
      title: "JEE Mains - Engineering",
      path: "/exam-preparation/jee",
      description: "Study materials for engineering entrance exams",
      icon: FileText,
      color: "from-orange-500 to-pink-600",
      features: ["Chapter-wise Notes", "Previous Papers", "Doubt Resolution", "Test Series"]
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Exam Preparation
            </motion.h1>
            <motion.p 
              className="text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Comprehensive resources to help you succeed in your competitive exams
            </motion.p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Exam</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Select from our specialized exam preparation programs designed to help you excel
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examTypes.map((exam, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={exam.path} className="block h-full">
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-premium overflow-hidden group">
                      <div className={`h-2 bg-gradient-to-r ${exam.color}`}></div>
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className={`rounded-full bg-gradient-to-r ${exam.color} p-4 mb-6 text-white w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <exam.icon className="h-8 w-8" />
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-royal transition-colors duration-300">{exam.title}</h3>
                        <p className="text-gray-600 mb-6">{exam.description}</p>
                        
                        <div className="grid grid-cols-2 gap-y-2 mb-8">
                          {exam.features.map((feature, i) => (
                            <div key={i} className="flex items-center">
                              <svg className="h-5 w-5 text-royal mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button className="mt-auto bg-royal hover:bg-royal-dark text-white w-full group-hover:translate-y-0 translate-y-1 transition-transform duration-300">
                          View Resources
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Choose Our Exam Preparation</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our comprehensive resources and support system are designed to maximize your potential
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Expert Educators",
                  description: "Learn from experienced IITians who understand what it takes to succeed",
                  icon: Users
                },
                {
                  title: "Comprehensive Resources",
                  description: "Access complete study materials, previous papers, and practice tests",
                  icon: FileText
                },
                {
                  title: "Structured Learning",
                  description: "Follow our proven preparation strategies and systematic approach",
                  icon: Calendar
                },
                {
                  title: "Regular Updates",
                  description: "Stay informed about exam patterns, notifications, and important dates",
                  icon: Bell
                }
              ].map((feature, index) => (
                <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="rounded-full bg-royal/10 p-4 mb-4">
                      <feature.icon className="h-6 w-6 text-royal" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ExamPreparation;
