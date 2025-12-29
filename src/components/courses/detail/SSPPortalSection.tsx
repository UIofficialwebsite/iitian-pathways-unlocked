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
    <section id="ssp" className="scroll-mt-24">
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5 md:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Student Success Portal (SSP)</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Your all-in-one learning companion with exclusive features designed to accelerate your success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portalFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/80 border border-border/40">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base mb-1">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 md:p-5 bg-background/70 rounded-lg border border-border/40">
              <h3 className="text-base md:text-lg font-semibold mb-4 text-center">How SSP Portal Helps You</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-1">100%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Course Content Access</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-1">24/7</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Learning Availability</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-1">∞</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Practice Resources</p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </section>
  );
};

export default SSPPortalSection;
