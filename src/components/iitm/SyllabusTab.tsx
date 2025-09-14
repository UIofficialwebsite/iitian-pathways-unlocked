
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, GraduationCap, Book } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ALL_SUBJECTS } from "./data/subjectsData";
import { Subject } from "./types/gradeTypes";

const syllabusData = {
  'data-science': {
    name: 'Data Science Curriculum',
    description: 'BS Degree in Data Science and Applications',
    icon: BookOpen,
    levels: {
      foundation: { 
        name: 'Foundation Level', 
        subjects: ALL_SUBJECTS.foundation 
      },
      diploma: { 
        name: 'Diploma Level', 
        subjects: ALL_SUBJECTS.diploma
      },
      degree: { 
        name: 'Degree Level', 
        subjects: ALL_SUBJECTS.degree
      },
    }
  },
  'electronic-systems': {
    name: 'Electronic Systems Curriculum',
    description: 'BS Degree in Electronic Systems',
    icon: Book,
    levels: {
      foundation: { 
        name: 'Foundation Level', 
        subjects: ALL_SUBJECTS['foundation-electronic-systems'] 
      },
      diploma: { 
        name: 'Diploma Level', 
        subjects: ALL_SUBJECTS['diploma-electronic-systems']
      },
      degree: { 
        name: 'Degree Level', 
        subjects: ALL_SUBJECTS['degree-electronic-systems']
      },
    }
  }
};

const SyllabusLevel: React.FC<{ levelKey: string, levelData: { name: string, subjects: Subject[] } }> = ({ levelKey, levelData }) => (
  <AccordionItem value={levelKey}>
    <AccordionTrigger className="text-lg font-medium">
      <div className="flex items-center">
        <div className="rounded-full bg-royal/10 p-2 mr-2">
          <GraduationCap className="h-5 w-5 text-royal" />
        </div>
        {levelData.name}
      </div>
    </AccordionTrigger>
    <AccordionContent className="space-y-2 pl-4 pt-4">
      {levelData.subjects.map((subject) => (
        <div key={subject.key} className="border-l-2 border-royal pl-4 py-2">
          <h4 className="text-md font-semibold">{subject.name}</h4>
        </div>
      ))}
    </AccordionContent>
  </AccordionItem>
);

const SyllabusCard: React.FC<{ branchKey: 'data-science' | 'electronic-systems', handleDownload: (id: string) => void, downloads: Record<string, number> }> = ({ branchKey, handleDownload, downloads }) => {
  const branchData = syllabusData[branchKey];
  const Icon = branchData.icon;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center">
          <Icon className="h-6 w-6 mr-2 text-royal" />
          <div>
            <CardTitle>{branchData.name}</CardTitle>
            <CardDescription>{branchData.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(branchData.levels).map(([levelKey, levelData]) => (
              levelData.subjects.length > 0 && <SyllabusLevel key={levelKey} levelKey={levelKey} levelData={levelData} />
            ))}
          </Accordion>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t">
        <Button 
          onClick={() => handleDownload(`${branchKey}-syllabus`)}
          className="bg-royal hover:bg-royal-dark text-white"
        >
          <Download className="h-4 w-4 mr-2" /> Download Full Curriculum
        </Button>
        <span className="text-sm text-gray-500">{downloads[`${branchKey}-syllabus`] || 0} downloads</span>
      </CardFooter>
    </Card>
  );
};

const SyllabusTab = ({ onFilterChange }: { onFilterChange?: (tab: string, branch?: string) => void }) => {
  const [branch, setBranch] = useState<keyof typeof syllabusData>("data-science");
  const [downloads, setDownloads] = useState({
    "data-science-syllabus": 482,
    "electronic-systems-syllabus": 315,
  });
  
  const handleBranchChange = (value: keyof typeof syllabusData) => {
    setBranch(value);
    onFilterChange?.('syllabus', value);
  };
  
  const handleDownload = (id: string) => {
    setDownloads(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    // Actual download logic would go here
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={branch} onValueChange={handleBranchChange} className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="data-science">Data Science</TabsTrigger>
          <TabsTrigger value="electronic-systems">Electronic Systems</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-science">
          <SyllabusCard branchKey="data-science" handleDownload={handleDownload} downloads={downloads} />
        </TabsContent>
        
        <TabsContent value="electronic-systems">
          <SyllabusCard branchKey="electronic-systems" handleDownload={handleDownload} downloads={downloads} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SyllabusTab;
