import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface SyllabusTabProps {
  branch: string;
}

// --- DATA STRUCTURES ---

interface Course {
  code?: string;
  title: string;
  credits: number;
  type: "Theory" | "Lab" | "Project";
  prereq?: string;
}

interface SyllabusLevel {
  levelName: string;
  totalCredits: number;
  courses: Course[];
}

// --- DATA: BS in Data Science & Applications ---
const DATA_SCIENCE_SYLLABUS: SyllabusLevel[] = [
  {
    levelName: "Foundation Level (32 Credits)",
    totalCredits: 32,
    courses: [
      { code: "BSMA1001", title: "Mathematics for Data Science I", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSMA1002", title: "Statistics for Data Science I", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSCS1001", title: "Computational Thinking", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSHS1001", title: "English I", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSMA1003", title: "Mathematics for Data Science II", credits: 4, type: "Theory", prereq: "Math I" },
      { code: "BSMA1004", title: "Statistics for Data Science II", credits: 4, type: "Theory", prereq: "Stats I" },
      { code: "BSCS1002", title: "Programming in Python", credits: 4, type: "Theory", prereq: "CT" },
      { code: "BSHS1002", title: "English II", credits: 4, type: "Theory", prereq: "English I" },
    ],
  },
  {
    levelName: "Diploma in Programming (27 Credits)",
    totalCredits: 27,
    courses: [
      { code: "BSCS2001", title: "Database Management Systems", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSCS2002", title: "PDSA using Python", credits: 4, type: "Theory", prereq: "Python" },
      { code: "BSCS2003", title: "Modern Application Development I", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSCS2004", title: "Programming Concepts using Java", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSCS2005", title: "Modern Application Development II", credits: 4, type: "Theory", prereq: "MAD I" },
      { code: "BSSE2001", title: "System Commands", credits: 3, type: "Lab", prereq: "-" },
      { code: "PROJ2001", title: "MAD I Project", credits: 2, type: "Project", prereq: "MAD I" },
      { code: "PROJ2002", title: "MAD II Project", credits: 2, type: "Project", prereq: "MAD II" },
    ],
  },
  {
    levelName: "Diploma in Data Science (27 Credits)",
    totalCredits: 27,
    courses: [
      { code: "BSDS2001", title: "Machine Learning Foundations", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSDS2002", title: "Business Data Management", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSDS2003", title: "Machine Learning Techniques", credits: 4, type: "Theory", prereq: "MLF" },
      { code: "BSDS2004", title: "Machine Learning Practice", credits: 4, type: "Theory", prereq: "MLT" },
      { code: "BSDS2005", title: "Business Analytics", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSDS2006", title: "Tools in Data Science", credits: 3, type: "Lab", prereq: "-" },
      { code: "PROJ2003", title: "Business Data Management Project", credits: 2, type: "Project", prereq: "BDM" },
      { code: "PROJ2004", title: "ML Practice Project", credits: 2, type: "Project", prereq: "MLP" },
    ],
  },
  {
    levelName: "BS Degree Level (56 Credits)",
    totalCredits: 56,
    courses: [
      { code: "BSCS3001", title: "Software Engineering", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSCS3002", title: "Software Testing", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSDS3001", title: "Deep Learning", credits: 4, type: "Theory", prereq: "MLT" },
      { code: "BSDS3002", title: "AI: Search Methods", credits: 4, type: "Theory", prereq: "-" },
      { code: "BSHS3001", title: "Strategies for Professional Growth", credits: 4, type: "Theory", prereq: "-" },
      { code: "ELECTIVE", title: "Electives (Various)", credits: 36, type: "Theory", prereq: "Varies" },
    ],
  },
];

// --- DATA: BS in Electronic Systems ---
const ELECTRONIC_SYSTEMS_SYLLABUS: SyllabusLevel[] = [
  {
    levelName: "Foundation Level (43 Credits)",
    totalCredits: 43,
    courses: [
      { code: "MA1101", title: "Math for Electronics I", credits: 4, type: "Theory", prereq: "-" },
      { code: "HS1101", title: "English I", credits: 4, type: "Theory", prereq: "-" },
      { code: "CS1101", title: "Introduction to C Programming", credits: 4, type: "Theory", prereq: "-" },
      { code: "EE1101", title: "Electronic Systems Thinking", credits: 4, type: "Theory", prereq: "-" },
      { code: "EE1102", title: "Digital Systems", credits: 4, type: "Theory", prereq: "CS1101" },
      { code: "EE1103", title: "Electrical & Electronic Circuits", credits: 4, type: "Theory", prereq: "EE1101" },
      { code: "CS1102", title: "Intro to Linux & Programming", credits: 4, type: "Theory", prereq: "-" },
      { code: "LABS", title: "Labs (C Prog, Linux, Electronics)", credits: 7, type: "Lab", prereq: "Varies" },
      { code: "HS1102", title: "English II", credits: 4, type: "Theory", prereq: "English I" },
    ],
  },
  {
    levelName: "Diploma Level (43 Credits)",
    totalCredits: 43,
    courses: [
      { code: "EE2101", title: "Signals and Systems", credits: 4, type: "Theory", prereq: "EE1103" },
      { code: "EE2102", title: "Analog Electronic Systems", credits: 4, type: "Theory", prereq: "EE2101" },
      { code: "EE2103", title: "Digital System Design", credits: 4, type: "Theory", prereq: "EE1102" },
      { code: "CS2101", title: "Embedded C Programming", credits: 4, type: "Theory", prereq: "CS1101" },
      { code: "EE3103", title: "Sensors and Applications", credits: 4, type: "Theory", prereq: "EE2102" },
      { code: "EE4104", title: "Computer Architecture", credits: 4, type: "Theory", prereq: "-" },
      { code: "LABS", title: "Labs (Analog, Digital, Sensors)", credits: 10, type: "Lab", prereq: "Varies" },
      { code: "PROJ", title: " Electronic Systems Projects", credits: 4, type: "Project", prereq: "-" },
    ],
  },
];

const SyllabusTab = ({ branch }: SyllabusTabProps) => {
  // Determine which syllabus to show based on branch prop
  const isElectronics = branch.toLowerCase().includes("electronic");
  const syllabusData = isElectronics ? ELECTRONIC_SYSTEMS_SYLLABUS : DATA_SCIENCE_SYLLABUS;
  const programTitle = isElectronics ? "BS in Electronic Systems" : "BS in Data Science & Applications";

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{programTitle}</h2>
          <p className="text-sm text-gray-500 mt-2">
            Complete credit breakdown and course list for all levels.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Render Tables for Each Level */}
      {syllabusData.map((level, index) => (
        <Card key={index} className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-gray-800">
                    {level.levelName}
                </CardTitle>
                <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 font-medium">
                    {level.totalCredits} Credits
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/30 hover:bg-gray-50/30">
                  <TableHead className="w-[100px] font-semibold text-gray-600">Code</TableHead>
                  <TableHead className="font-semibold text-gray-600">Course Title</TableHead>
                  <TableHead className="w-[100px] font-semibold text-gray-600 text-center">Type</TableHead>
                  <TableHead className="w-[100px] font-semibold text-gray-600 text-center">Credits</TableHead>
                  <TableHead className="w-[120px] font-semibold text-gray-600">Prerequisite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {level.courses.map((course, cIndex) => (
                  <TableRow key={cIndex} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                        {course.code || "-"}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800">
                        {course.title}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge 
                            variant="outline" 
                            className={`text-[10px] px-2 py-0.5 border-0 font-medium ${
                                course.type === 'Lab' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' : 
                                course.type === 'Project' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' : 
                                'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                            }`}
                        >
                            {course.type}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center text-gray-600 font-medium">
                        {course.credits}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                        {course.prereq || "None"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
            <h4 className="font-bold text-blue-900 text-sm">Grading & Passing Criteria</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                To pass a course, a learner must typically secure a minimum average assignment score (usually 40/100) to be eligible for the end-term exam. 
                The final grade is calculated based on a weighted average of weekly assignments, monthly quizzes, and the end-term exam.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SyllabusTab;
