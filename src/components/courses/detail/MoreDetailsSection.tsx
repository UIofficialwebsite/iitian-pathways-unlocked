import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Video, Briefcase } from "lucide-react";

const MoreDetailsSection: React.FC = () => {
  const benefits = [
    {
      icon: Users,
      title: "Community Access",
      description: "Join our exclusive community of learners. Network, collaborate, and grow together with peers from around the world."
    },
    {
      icon: Video,
      title: "Live Q&A Sessions",
      description: "Participate in regular live sessions with instructors. Get your doubts cleared in real-time and engage in interactive discussions."
    },
    {
      icon: Briefcase,
      title: "Career Guidance",
      description: "Receive personalized career guidance, resume reviews, and interview preparation support to help you achieve your professional goals."
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Why Choose This Course?</h2>
          <p className="text-gray-600">More than just lessons - a complete learning experience</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MoreDetailsSection;
