import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, TrendingUp, Award } from "lucide-react";

const IITMToolsTab = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: "cgpa-calculator",
      name: "CGPA Calculator",
      icon: Calculator,
      description: "Calculate your CGPA based on course grades",
      path: "/iitm-tools/cgpa-calculator/data-science/foundation"
    },
    {
      id: "grade-calculator",
      name: "Grade Calculator",
      icon: Award,
      description: "Calculate grades for specific subjects",
      path: "/iitm-tools/grade-calculator/data-science/foundation"
    },
    {
      id: "marks-predictor",
      name: "Marks Predictor",
      icon: TrendingUp,
      description: "Predict required marks based on current scores",
      path: "/iitm-tools/marks-predictor/data-science/foundation"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card 
            key={tool.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-royal hover:bg-royal/5"
            onClick={() => navigate(tool.path)}
          >
            <CardContent className="p-6 text-center">
              <tool.icon className="h-10 w-10 mx-auto mb-3 text-royal" />
              <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
              <button className="mt-4 text-royal font-medium hover:underline">
                Open Tool →
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-8 text-gray-600">
        <p>Select a tool above to start calculating your grades and scores.</p>
      </div>
    </div>
  );
};

export default IITMToolsTab;
