
import React, { useState, useEffect } from "react";
import { FileText, BookOpen, Code, Play, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
  title: string;
  description: string;
  link: string;
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

  const resourcesData = {
    notes: [
      {
        name: "NEET",
        description: "Comprehensive notes covering all medical entrance topics and concepts for thorough preparation.",
        href: "/exam-preparation/neet",
        cta: "View Notes",
        Icon: FileText,
        className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30">
            <div className="absolute top-4 right-4 w-20 h-20 bg-purple-200 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-pink-200 rounded-full opacity-40"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 opacity-30">
            <div className="absolute top-6 right-6 w-24 h-24 bg-blue-200 rounded-lg opacity-50 transform rotate-12"></div>
            <div className="absolute bottom-6 left-6 w-18 h-18 bg-cyan-200 rounded-lg opacity-40 transform -rotate-12"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 opacity-30">
            <div className="absolute top-4 right-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-emerald-200 rounded-full opacity-40"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 opacity-30">
            <div className="absolute top-4 right-4 w-18 h-18 bg-orange-200 rounded-lg opacity-50 transform rotate-45"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-200 rounded-lg opacity-40 transform -rotate-45"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30">
            <div className="absolute top-8 right-8 w-32 h-32 bg-indigo-200 rounded-full opacity-30"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-purple-200 rounded-full opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-200 rounded-full opacity-20"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-200 rounded-lg opacity-40 transform rotate-12"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-200 rounded-lg opacity-30 transform -rotate-12"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-200 rounded-full opacity-50"></div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-slate-100 opacity-30">
            <div className="absolute top-6 right-6 w-20 h-20 bg-gray-200 rounded-lg opacity-40 transform rotate-45"></div>
            <div className="absolute bottom-6 left-6 w-24 h-24 bg-slate-200 rounded-lg opacity-30 transform -rotate-45"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-300 rounded-full opacity-20"></div>
          </div>
        ),
      },
    ],
  };

  const getPersonalizedCard = (exam: string | null) => {
    if (!exam) return null;
    
    let matchingResource = null;
    
    if (exam.includes("NEET")) {
      matchingResource = {
        name: "Your NEET Resources",
        description: "Continue where you left off with personalized NEET preparation resources.",
        href: "/exam-preparation/neet",
        cta: "Continue Learning",
        Icon: Star,
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-purple-200 opacity-60">
            <div className="absolute top-4 right-4 w-16 h-16 bg-royal/30 rounded-full opacity-70"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-300 rounded-full opacity-50"></div>
          </div>
        ),
      };
    } else if (exam.includes("JEE")) {
      matchingResource = {
        name: "Your JEE Resources", 
        description: "Continue where you left off with personalized JEE preparation resources.",
        href: "/exam-preparation/jee",
        cta: "Continue Learning",
        Icon: Star,
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-blue-200 opacity-60">
            <div className="absolute top-4 right-4 w-16 h-16 bg-royal/30 rounded-full opacity-70"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-blue-300 rounded-full opacity-50"></div>
          </div>
        ),
      };
    } else if (exam.includes("IITM BS")) {
      matchingResource = {
        name: "Your IITM BS Resources",
        description: "Continue where you left off with personalized IITM BS preparation resources.",
        href: "/exam-preparation/iitm-bs", 
        cta: "Continue Learning",
        Icon: Star,
        className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-4",
        background: (
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-green-200 opacity-60">
            <div className="absolute top-4 right-4 w-16 h-16 bg-royal/30 rounded-full opacity-70"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-green-300 rounded-full opacity-50"></div>
          </div>
        ),
      };
    }
    
    return matchingResource;
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Resource Hub</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Access comprehensive study materials designed by top IIT students to excel in your academic journey.
          </p>
        </div>

        {/* Responsive Tabs */}
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

            {/* Tab Content */}
            <div className="mt-6 md:mt-8">
              <TabsContent value="notes" className="mt-0">
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <BentoGrid className="lg:grid-rows-3">
                    {isAuthenticated && userExam && getPersonalizedCard(userExam) && (
                      <BentoCard {...getPersonalizedCard(userExam)!} />
                    )}
                    
                    {resourcesData.notes
                      .filter((_, index) => !(isAuthenticated && userExam && index === 0))
                      .map((resource) => (
                        <BentoCard key={resource.name} {...resource} />
                      ))}
                  </BentoGrid>
                )}
              </TabsContent>

              <TabsContent value="lectures" className="mt-0">
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <BentoGrid className="lg:grid-rows-3">
                    {resourcesData.lectures.map((resource) => (
                      <BentoCard key={resource.name} {...resource} />
                    ))}
                  </BentoGrid>
                )}
              </TabsContent>

              <TabsContent value="skill" className="mt-0">
                <div className="text-center py-12 md:py-16">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border-none shadow-md">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
                      <Code className="relative h-12 w-12 md:h-16 md:w-16 mx-auto text-royal mb-6" />
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
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ResourceHubSection;
