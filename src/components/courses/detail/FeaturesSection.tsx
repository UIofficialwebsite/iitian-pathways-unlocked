import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video, Users, BookOpen, Headphones, CheckCircle, WalletMinimal, UserCheck } from "lucide-react";
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
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">Course Features</h2>
          {hasCustomFeatures ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {course.features!.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 md:gap-3 p-3 rounded-lg bg-muted/40">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 md:gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="p-2 md:p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm md:text-base">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default FeaturesSection;
