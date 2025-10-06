import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video, Users, Clock, Award, BookOpen, Headphones } from "lucide-react";

const FeaturesSection: React.FC = () => {
  const features = [
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
      icon: Clock,
      title: "Flexible Timing",
      description: "Choose from multiple batch timings that suit your schedule"
    },
    {
      icon: Award,
      title: "Certification",
      description: "Receive a recognized certificate upon course completion"
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

  return (
    <section id="features" className="py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8">Course Features</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
