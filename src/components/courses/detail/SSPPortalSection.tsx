import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, BarChart3, MessageCircle, FileText, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <section id="ssp" className="py-12 scroll-mt-24 bg-white -mx-4 px-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 text-slate-900">Student Success Portal (SSP)</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Your all-in-one learning companion with exclusive features designed to accelerate your success.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portalFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          const isStudyMaterial = feature.title === "Study Materials";
          
          // Theme Logic: 
          // "Study Materials" -> Red Theme
          // Others -> "Peace/Positive" (Emerald) Theme
          
          const cardBg = isStudyMaterial ? "bg-red-50" : "bg-emerald-50";
          const cardBorder = isStudyMaterial ? "border-red-100" : "border-emerald-100";
          const hoverBorder = isStudyMaterial ? "hover:border-red-200" : "hover:border-emerald-200";
          
          const iconColor = isStudyMaterial ? "text-red-600" : "text-emerald-600";
          const titleColor = isStudyMaterial ? "text-red-900" : "text-emerald-900";
          const descColor = isStudyMaterial ? "text-red-700/80" : "text-emerald-800/80";

          return (
            <Card key={idx} className={cn(
                "border transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                cardBg,
                cardBorder,
                hoverBorder
            )}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Icon Box */}
                  <div className="p-3 rounded-xl bg-white w-fit shadow-sm">
                    <Icon className={cn("h-6 w-6", iconColor)} />
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <h3 className={cn("font-bold text-lg mb-1.5", titleColor)}>
                      {feature.title}
                    </h3>
                    <p className={cn("text-sm leading-relaxed font-medium", descColor)}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats / Benefits Footer */}
      <div className="mt-10 p-8 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-xl font-bold mb-8 text-center text-slate-800">How SSP Portal Helps You</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="pt-6 md:pt-0">
            <p className="text-4xl font-extrabold text-emerald-600 mb-2 tracking-tight">100%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Content Access</p>
          </div>
          <div className="pt-6 md:pt-0">
            <p className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">24/7</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Availability</p>
          </div>
          <div className="pt-6 md:pt-0">
            <p className="text-4xl font-extrabold text-purple-600 mb-2 tracking-tight">∞</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice Resources</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SSPPortalSection;
