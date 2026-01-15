import React, { useState, useEffect } from "react";
import CGPACalculator from "./CGPACalculator";
import GradeCalculator from "./GradeCalculator";
import FoundationMarksPredictor from "./FoundationMarksPredictor";
import { Level } from "./types/gradeTypes";
import { Calculator, GraduationCap, LineChart } from "lucide-react";

interface IITMToolsTabProps {
  selectedTool?: string;
  branch?: string;
  level?: string;
}

const IITMToolsTab = ({ 
  selectedTool = "cgpa-calculator",
  branch = "Data Science",
  level = "Foundation"
}: IITMToolsTabProps) => {
  // Local state to manage active tool, initializing from prop
  const [activeTool, setActiveTool] = useState(selectedTool);

  // Sync state if prop changes
  useEffect(() => {
    setActiveTool(selectedTool);
  }, [selectedTool]);

  // Convert branch format for calculator components
  const branchForCalc = branch === "Data Science" ? "data-science" : "electronic-systems";
  const levelForCalc = level.toLowerCase() as Level;

  const tools = [
    {
      id: "cgpa-calculator",
      label: "CGPA Calculator",
      icon: Calculator
    },
    {
      id: "grade-calculator",
      label: "Grade Calculator",
      icon: GraduationCap
    },
    {
      id: "marks-predictor",
      label: "Marks Predictor",
      icon: LineChart
    }
  ];

  // Render the selected tool directly
  const renderTool = () => {
    switch (activeTool) {
      case "cgpa-calculator":
        return <CGPACalculator />;
      case "grade-calculator":
        return <GradeCalculator level={levelForCalc} branch={branchForCalc} />;
      case "marks-predictor":
        return <FoundationMarksPredictor branch={branchForCalc} level={levelForCalc} />;
      default:
        return <CGPACalculator />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Navigation / Filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-primary text-white shadow-md transform scale-105" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tool.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl">
        {renderTool()}
      </div>
    </div>
  );
};

export default IITMToolsTab;
