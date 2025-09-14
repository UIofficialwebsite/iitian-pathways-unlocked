import React, { useState, useEffect } from "react";
import { FileText, BookOpen, Code, Play, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const tabsData = [
  {
    id: "notes",
    label: "Notes",
    icon: FileText,
    description: "Comprehensive study materials"
  },
  {
    id: "lectures",
    label: "Lectures",
    icon: Play,
    description: "Video learning content"
  },
  {
    id: "skill",
    label: "Skill Enhancement",
    icon: Code,
    description: "Professional development"
  },
];

interface ResourceItem {
  name: string;
  description: string;
  href: string;
  cta: string;
  Icon: React.ElementType;
  className?: string;
  background?: React.ReactNode;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="border-none shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const ResourceHubSection = () => {
  const [activeTab, setActiveTab] = useState("notes");
  const [userExam, setUserExam] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setIsAuthenticated(true);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('exam')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileData?.exam) {
          setUserExam(profileData.exam);
        }
      }
      setLoading(false);
    };

    checkUserProfile();
  }, []);

  const resourcesData: { [key: string]: ResourceItem[] } = {
    notes: [
      {
        name: "NEET",
        description: "Comprehensive notes covering all medical entrance topics and concepts for thorough preparation.",
        href: "/exam-preparation/neet",
        cta: "View Notes",
        Icon: FileText,
        className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 opacity-30"></div>
        ),
      },
      {
        name: "JEE",
        description: "Advanced preparation materials for engineering entrance exams with detailed explanations.",
        href: "/exam-preparation/jee",
        cta: "View Notes",
        Icon: FileText,
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-2 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 opacity-30"></div>
        ),
      },
      {
        name: "IITM BS Data Science",
        description: "Comprehensive study materials for IIT Madras BS Data Science program.",
        href: "/exam-preparation/iitm-bs",
        cta: "View Notes",
        Icon: FileText,
        className: "lg:row-start-2 lg:row-end-3 lg:col-start-2 lg:col-end-3",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-100 to-lime-100 opacity-30"></div>
        ),
      },
      {
        name: "IITM BS Electronic Systems",
        description: "Specialized content for Electronic Systems branch of IIT Madras BS degree.",
        href: "/exam-preparation/iitm-bs",
        cta: "View Notes",
        Icon: FileText,
        className: "lg:row-start-2 lg:row-end-3 lg:col-start-3 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100 opacity-30"></div>
        ),
      },
      {
        name: "IITM BS Fundamentals",
        description: "Foundation courses and qualifier preparation for IIT Madras BS program.",
        href: "/exam-preparation/iitm-bs",
        cta: "View Notes",
        Icon: BookOpen,
        className: "lg:row-start-3 lg:row-end-4 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-violet-100 opacity-30"></div>
        ),
      },
    ],
    lectures: [
      {
        name: "IITM BS Data Science Fundamentals",
        description: "Introduction to data science concepts and programming with comprehensive video lectures.",
        href: "/exam-preparation/iitm-bs",
        cta: "Watch Lectures",
        Icon: Play,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-100 opacity-30"></div>
        ),
      },
    ],
    skill: [
      {
        name: "Coming Soon",
        description: "Our skill enhancement section is under development. Check back for exciting updates!",
        href: "#",
        cta: "Get Notified",
        Icon: Code,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-slate-100 to-stone-100 opacity-30"></div>
        ),
      },
    ],
  };

  const getPersonalizedCard = (exam: string | null): ResourceItem | null => {
    if (!exam) return null;

    let matchingResource: Omit<ResourceItem, 'Icon'> & { Icon?: React.ElementType } = {};

    if (exam.includes("NEET")) {
      matchingResource = {
        name: "Your NEET Resources",
        description: "Continue where you left off with personalized NEET preparation resources.",
        href: "/exam-preparation/neet",
        cta: "Continue Learning",
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-purple-200 opacity-60"></div>
        ),
      };
    } else if (exam.includes("JEE")) {
      matchingResource = {
        name: "Your JEE Resources",
        description: "Continue where you left off with personalized JEE preparation resources.",
        href: "/exam-preparation/jee",
        cta: "Continue Learning",
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-blue-200 opacity-60"></div>
        ),
      };
    } else if (exam.includes("IITM BS")) {
      matchingResource = {
        name: "Your IITM BS Resources",
        description: "Continue where you left off with personalized IITM BS preparation resources.",
        href: "/exam-preparation/iitm-bs",
        cta: "Continue Learning",
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-green-200 opacity-60"></div>
        ),
      };
    }

    return { ...matchingResource, Icon: Star } as ResourceItem;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };


  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Your Resource Hub
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Access comprehensive study materials designed by top IIT students to excel in your academic journey.
          </motion.p>
        </div>

        <div className="mb-6 md:mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex lg:h-auto lg:p-1 bg-white rounded-xl shadow-sm border">
              {tabsData.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-royal data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg"
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <div className="text-center sm:text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="hidden lg:block text-xs opacity-70 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 md:mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="notes" className="mt-0">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : (
                      <BentoGrid className="lg:grid-rows-3" variants={containerVariants} initial="hidden" animate="visible">
                        {isAuthenticated && userExam && getPersonalizedCard(userExam) && (
                          <BentoCard {...getPersonalizedCard(userExam)!} variants={itemVariants} />
                        )}

                        {resourcesData.notes
                          .filter((_, index) => !(isAuthenticated && userExam && index === 0))
                          .map((resource) => (
                            <BentoCard key={resource.name} {...resource} variants={itemVariants} />
                          ))}
                      </BentoGrid>
                    )}
                  </TabsContent>

                  <TabsContent value="lectures" className="mt-0">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : (
                      <BentoGrid className="lg:grid-rows-3" variants={containerVariants} initial="hidden" animate="visible">
                        {resourcesData.lectures.map((resource) => (
                          <BentoCard key={resource.name} {...resource} variants={itemVariants} />
                        ))}
                      </BentoGrid>
                    )}
                  </TabsContent>

                  <TabsContent value="skill" className="mt-0">
                    <div className="text-center py-12 md:py-16">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border-none shadow-md">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          >
                            <Code className="relative h-12 w-12 md:h-16 md:w-16 mx-auto text-royal mb-6" />
                          </motion.div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-4">Skill Enhancement Coming Soon!</h3>
                        <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mb-8">
                          We're currently developing an exciting range of skill enhancement courses including web development,
                          UI/UX design, data science, and mobile app development. Check back soon for updates!
                        </p>
                        <Button variant="outline" className="border-royal text-royal hover:bg-royal hover:text-white transition-all duration-200">
                          <Users className="h-4 w-4 mr-2" />
                          Get Notified When Available
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ResourceHubSection;
