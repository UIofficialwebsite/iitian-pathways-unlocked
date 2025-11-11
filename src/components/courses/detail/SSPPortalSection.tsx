import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, BarChart3, MessageCircle, FileText, Video, Users } from "lucide-react";

const SSPPortalSection: React.FC = () => {
  const portalFeatures = [
    {
      icon: Video,
      title: "Recorded Lectures",
      description: "Access all class recordings anytime for revision"
    },
    {
      icon: FileText,
      title: "Study Materials",
      description: "Download PDFs, notes, and practice questions"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your performance with detailed analytics"
    },
    {
      icon: MessageCircle,
      title: "Doubt Resolution",
      description: "Ask questions and get answers from instructors"
    },
    {
      icon: Users,
      title: "Peer Learning",
      description: "Collaborate with fellow students in discussion forums"
    },
    {
      icon: Award,
      title: "Assignments & Tests",
      description: "Practice with regular assignments and mock tests"
    }
  ];

  return (
    <section id="ssp" className="py-12 scroll-mt-24 bg-gradient-to-br from-primary/5 to-primary/10 -mx-4 px-4 rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Student Success Portal (SSP)</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one learning companion with exclusive features designed to accelerate your success
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portalFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="border-primary/20 hover:shadow-lg transition-shadow bg-background/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-background/60 backdrop-blur rounded-xl border border-primary/20">
        <h3 className="text-xl font-semibold mb-3 text-center">How SSP Portal Helps You</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-2">100%</p>
            <p className="text-sm text-muted-foreground">Course Content Access</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">24/7</p>
            <p className="text-sm text-muted-foreground">Learning Availability</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">∞</p>
            <p className="text-sm text-muted-foreground">Practice Resources</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SSPPortalSection;
