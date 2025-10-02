import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CGPACalculator from "@/components/iitm/CGPACalculator";
import GradeCalculator from "@/components/iitm/GradeCalculator";
import FoundationMarksPredictor from "@/components/iitm/FoundationMarksPredictor";
import DiplomaMarksPredictor from "@/components/iitm/DiplomaMarksPredictor";
import DegreeMarksPredictor from "@/components/iitm/DegreeMarksPredictor";
import { Level } from "@/components/iitm/types/gradeTypes";

const IITMCalculators = () => {
  const navigate = useNavigate();
  const { tool, branch, level } = useParams<{ tool?: string; branch?: string; level?: string }>();
  
  const [activeTab, setActiveTab] = useState(tool || "grade-calculator");
  const [selectedBranch, setSelectedBranch] = useState<"data-science" | "electronic-systems">(
    branch === "electronic-systems" ? "electronic-systems" : "data-science"
  );
  const [selectedLevel, setSelectedLevel] = useState<Level>(
    (level as Level) || "foundation"
  );

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/iitm-tools/${newTab}/${selectedBranch}/${selectedLevel}`, { replace: true });
  };

  const handleBranchChange = (newBranch: "data-science" | "electronic-systems") => {
    setSelectedBranch(newBranch);
    navigate(`/iitm-tools/${activeTab}/${newBranch}/${selectedLevel}`, { replace: true });
  };

  const handleLevelChange = (newLevel: Level) => {
    setSelectedLevel(newLevel);
    navigate(`/iitm-tools/${activeTab}/${selectedBranch}/${newLevel}`, { replace: true });
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Tools</h1>
            <p className="text-xl text-gray-600">Grade Calculators, CGPA Calculator & Marks Predictors</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
              <TabsTrigger value="grade-calculator">Grade Calculator</TabsTrigger>
              <TabsTrigger value="cgpa-calculator">CGPA Calculator</TabsTrigger>
              <TabsTrigger value="marks-predictor">Marks Predictor</TabsTrigger>
            </TabsList>

            <TabsContent value="grade-calculator" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Branch Selection */}
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => handleBranchChange("data-science")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedBranch === "data-science"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Data Science
                      </button>
                      <button
                        onClick={() => handleBranchChange("electronic-systems")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedBranch === "electronic-systems"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Electronic Systems
                      </button>
                    </div>

                    {/* Level Selection */}
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => handleLevelChange("foundation")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "foundation"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Foundation
                      </button>
                      <button
                        onClick={() => handleLevelChange("diploma")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "diploma"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Diploma
                      </button>
                      <button
                        onClick={() => handleLevelChange("degree")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "degree"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Degree
                      </button>
                    </div>

                    <GradeCalculator level={selectedLevel} branch={selectedBranch} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cgpa-calculator" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>CGPA Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CGPACalculator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marks-predictor" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marks Predictor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Level Selection for Predictor */}
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => handleLevelChange("foundation")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "foundation"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Foundation
                      </button>
                      <button
                        onClick={() => handleLevelChange("diploma")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "diploma"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Diploma
                      </button>
                      <button
                        onClick={() => handleLevelChange("degree")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedLevel === "degree"
                            ? "bg-royal text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Degree
                      </button>
                    </div>

                    {selectedLevel === "foundation" && <FoundationMarksPredictor branch={selectedBranch} level={selectedLevel} />}
                    {selectedLevel === "diploma" && <DiplomaMarksPredictor branch={selectedBranch} level={selectedLevel} />}
                    {selectedLevel === "degree" && <DegreeMarksPredictor branch={selectedBranch} level={selectedLevel} />}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IITMCalculators;
