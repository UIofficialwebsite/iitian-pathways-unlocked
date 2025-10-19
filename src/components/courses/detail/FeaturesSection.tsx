import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video, Users, Clock, Award, BookOpen, Headphones, CheckCircle } from "lucide-react";
import { Course } from '@/components/admin/courses/types';

interface FeaturesSectionProps {
  course: Course;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ course }) => {
  const defaultFeatures = [
    {
      icon: Video,
      title: "Live Classes",
      description: "Interactive live sessions with expert instructors"
    },
    {
      icon: Users,
      title: "Small Batch Size",
      description: "Personalized attention with limited students per batch"
    },
    {
      icon: WalletMinimal,
      title: "Affordable Learning",
      description: "High-quality education at prices every student can afford."
    },
    {
      icon: UserCheck,
      title: "Personal Mentorship",
      description: "Dedicated mentors to guide you with study plans, career oriented decisions"
    },
    {
      icon: BookOpen,
      title: "Study Materials",
      description: "Comprehensive notes, PDFs, and practice questions"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Get your doubts resolved anytime through our portal"
    }
  ];

  // Use course features if available, otherwise use default features
  const hasCustomFeatures = course.features && course.features.length > 0;

  return (
    <section id="features" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Course Features</h2>
      {hasCustomFeatures ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {course.features!.map((feature, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm leading-relaxed">{feature}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {defaultFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FeaturesSection;
