import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";

type Grade = "10" | "9" | "8" | "7" | "6" | "5" | "4" | "0";

interface Course {
  id: string;
  name: string;
  credits: string;
  grade: Grade;
}

const CGPACalculator = () => {
  // Input States
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [creditsCompleted, setCreditsCompleted] = useState("");
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Course 1", credits: "4", grade: "10" }
  ]);
  const [showReport, setShowReport] = useState(false);

  // Result States
  const [semesterGPA, setSemesterGPA] = useState(0);
  const [cumulativeCGPA, setCumulativeCGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({});
  
  const componentRef = useRef<HTMLDivElement>(null);

  const gradeOptions: { value: Grade; label: string; point: number }[] = [
    { value: "10", label: "S (10)", point: 10 },
    { value: "9", label: "A (9)", point: 9 },
    { value: "8", label: "B (8)", point: 8 },
    { value: "7", label: "C (7)", point: 7 },
    { value: "6", label: "D (6)", point: 6 },
    { value: "5", label: "E (5)", point: 5 },
    { value: "4", label: "U (4)", point: 0 },
  ];

  const getPoint = (g: Grade) => parseInt(g);

  // --- Calculations ---
  useEffect(() => {
    // 1. Semester Stats
    let semPoints = 0;
    let semCredits = 0;
    const dist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, Others: 0 };

    courses.forEach(c => {
      const cr = parseFloat(c.credits) || 0;
      const gp = getPoint(c.grade);
      
      semPoints += gp * cr;
      semCredits += cr;

      // Distribution
      if (c.grade === "10") dist.S++;
      else if (c.grade === "9") dist.A++;
      else if (c.grade === "8") dist.B++;
      else if (c.grade === "7") dist.C++;
      else dist.Others++;
    });

    const sGPA = semCredits > 0 ? semPoints / semCredits : 0;
    setSemesterGPA(sGPA);

    // 2. Cumulative Stats
    const pastCGPA = parseFloat(currentCGPA) || 0;
    const pastCredits = parseFloat(creditsCompleted) || 0;
    
    // Weighted Formula
    const totalSemPoints = semPoints; 
    const finalTotalCredits = pastCredits + semCredits;
    const totalPoints = (pastCGPA * pastCredits) + totalSemPoints;
    
    const cCGPA = finalTotalCredits > 0 ? totalPoints / finalTotalCredits : 0;
    
    setCumulativeCGPA(cCGPA);
    setTotalCredits(finalTotalCredits);
    setGradeDistribution(dist);

  }, [courses, currentCGPA, creditsCompleted]);

  // --- Handlers ---
  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: `Course ${courses.length + 1}`, credits: "4", grade: "10" }]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      const newCourses = [...courses];
      newCourses.splice(index, 1);
      setCourses(newCourses);
    }
  };

  const updateCourse = (index: number, field: keyof Course, value: string) => {
    const newCourses = [...courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setCourses(newCourses);
  };

  const handleReset = () => {
    if (window.confirm("Clear all data and start over?")) {
      setCurrentCGPA("");
      setCreditsCompleted("");
      setCourses([{ id: "1", name: "Course 1", credits: "4", grade: "10" }]);
      setShowReport(false);
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "CGPA_Report",
  });

  // --- Donut Chart Gradient ---
  const getConicGradient = () => {
    const total = courses.length;
    if (total === 0) return "conic-gradient(#e5e7eb 0deg 360deg)";

    const colors = {
      S: "#000000",   
      A: "#4b5563",   
      B: "#9ca3af",   
      C: "#d1d5db",   
      Others: "#f3f4f6" 
    };

    let currentDeg = 0;
    const segments: string[] = [];

    const entries = [
      { key: "S", count: gradeDistribution.S, color: colors.S },
      { key: "A", count: gradeDistribution.A, color: colors.A },
      { key: "B", count: gradeDistribution.B, color: colors.B },
      { key: "C", count: gradeDistribution.C, color: colors.C },
      { key: "Others", count: gradeDistribution.Others, color: colors.Others },
    ];

    entries.forEach((item) => {
      if (item.count > 0) {
        const deg = (item.count / total) * 360;
        segments.push(`${item.color} ${currentDeg}deg ${currentDeg + deg}deg`);
        currentDeg += deg;
      }
    });

    return `conic-gradient(${segments.join(", ")})`;
  };

  return (
    <div className="bg-white font-sans text-gray-900 pb-10">
      
      {/* INPUT SECTION */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* Academic Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="current-cgpa" className="text-xs font-bold uppercase tracking-wide text-gray-500">Current CGPA</Label>
              <Input
                id="current-cgpa"
                type="number"
                placeholder="e.g. 8.5"
                value={currentCGPA}
                onChange={(e) => setCurrentCGPA(e.target.value)}
                className="h-10 text-base bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits-completed" className="text-xs font-bold uppercase tracking-wide text-gray-500">Credits Completed</Label>
              <Input
                id="credits-completed"
                type="number"
                placeholder="e.g. 40"
                value={creditsCompleted}
                onChange={(e) => setCreditsCompleted(e.target.value)}
                className="h-10 text-base bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Course Inputs */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-100 pb-2">
             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500">Semester Courses</Label>
             <span className="text-[10px] text-gray-400 font-medium">{courses.length} courses added</span>
          </div>

          <div className="space-y-2">
            {courses.map((course, index) => (
              <div key={course.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded-sm border border-gray-200 shadow-sm">
                <div className="flex-grow w-full md:w-auto">
                  <Input
                    placeholder="Course Name"
                    value={course.name}
                    onChange={(e) => updateCourse(index, "name", e.target.value)}
                    className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 font-medium text-sm h-9 px-2 rounded-sm"
                  />
                </div>
                <div className="w-full md:w-24">
                    <Input
                    type="number"
                    placeholder="Credits"
                    value={course.credits}
                    onChange={(e) => updateCourse(index, "credits", e.target.value)}
                    className="border-gray-200 focus:border-black focus:ring-0 text-center h-9 text-sm rounded-sm"
                  />
                </div>
                <div className="w-full md:w-36">
                  <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                    <SelectTrigger className="border-gray-200 focus:border-black focus:ring-0 bg-white h-9 text-sm rounded-sm">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0 h-9 w-9 rounded-sm"
                  disabled={courses.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
             <Button onClick={addCourse} variant="outline" className="flex-1 h-10 border-dashed border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 uppercase text-[11px] tracking-wider font-bold rounded-sm">
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Course
            </Button>
            <Button 
              onClick={() => setShowReport(true)} 
              className="flex-1 h-10 bg-black hover:bg-gray-800 text-white uppercase text-[11px] tracking-wider font-bold rounded-sm transition-transform active:scale-[0.99]"
            >
              Calculate Result
            </Button>
          </div>
        </div>
      </div>

      {/* REPORT SECTION - Shown conditionally */}
      {showReport && (
        <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="max-w-4xl mx-auto mt-6 border-t border-black pt-8 px-4 md:px-6" ref={componentRef}>
             
             {/* Report Header */}
             <div className="text-center mb-8">
               <h2 className="text-2xl font-black tracking-tight uppercase text-black mb-1">Performance Report</h2>
               <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>

             {/* Top Stats */}
             <div className="flex flex-col md:flex-row justify-center items-stretch mb-10 divide-y md:divide-y-0 md:divide-x divide-gray-200">
               <div className="flex-1 text-center py-4 md:px-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Current Semester</h3>
                 <div className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-none">{semesterGPA.toFixed(2)}</div>
                 <p className="text-xs font-bold text-gray-500 mt-2 uppercase">GPA</p>
               </div>
               <div className="flex-1 text-center py-4 md:px-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Cumulative</h3>
                 <div className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-none">{cumulativeCGPA.toFixed(2)}</div>
                 <p className="text-xs font-bold text-gray-500 mt-2 uppercase">CGPA</p>
               </div>
             </div>

             {/* Grade Breakdown (Donut + Legend) */}
             <div className="mb-10 bg-gray-50 rounded-sm p-6 border border-gray-100">
               <h3 className="text-xs font-bold text-center mb-6 text-gray-500 uppercase tracking-widest">Grade Analysis</h3>
               <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20">
                 
                 {/* CSS Conic Gradient Donut */}
                 <div className="relative">
                   <div 
                      className="w-40 h-40 rounded-full flex items-center justify-center shadow-sm border-[3px] border-white"
                      style={{ background: getConicGradient() }}
                   >
                     <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-2xl font-black text-black leading-none">{courses.length}</span>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mt-1">Courses</span>
                     </div>
                   </div>
                 </div>

                 {/* Custom Legend */}
                 <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 bg-black rounded-[1px]"></div>
                      <span className="font-semibold text-xs text-gray-700">S Grade <span className="text-gray-400 text-[10px] ml-1">({gradeDistribution.S || 0})</span></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 bg-gray-600 rounded-[1px]"></div>
                      <span className="font-semibold text-xs text-gray-700">A Grade <span className="text-gray-400 text-[10px] ml-1">({gradeDistribution.A || 0})</span></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 bg-gray-400 rounded-[1px]"></div>
                      <span className="font-semibold text-xs text-gray-700">B Grade <span className="text-gray-400 text-[10px] ml-1">({gradeDistribution.B || 0})</span></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 bg-gray-300 rounded-[1px]"></div>
                      <span className="font-semibold text-xs text-gray-700">C Grade <span className="text-gray-400 text-[10px] ml-1">({gradeDistribution.C || 0})</span></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 bg-gray-100 rounded-[1px] border border-gray-200"></div>
                      <span className="font-semibold text-xs text-gray-700">Others <span className="text-gray-400 text-[10px] ml-1">({gradeDistribution.Others || 0})</span></span>
                    </div>
                 </div>
               </div>
             </div>

             {/* Summary Table */}
             <div className="mb-10">
               <div className="flex justify-between items-center mb-4 border-b border-black pb-2">
                 <h3 className="text-sm font-black text-black uppercase tracking-tight">Course Summary</h3>
                 <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">{totalCredits} Total Credits</span>
               </div>
               
               <div className="rounded-sm border border-gray-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-200">
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Course</th>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">Credits</th>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Grade Point</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 text-sm">
                     {courses.map((c) => (
                       <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="py-2.5 px-4 font-semibold text-gray-800">{c.name}</td>
                         <td className="py-2.5 px-4 text-gray-600 text-center">{c.credits}</td>
                         <td className="py-2.5 px-4 font-bold text-black text-right">{getPoint(c.grade)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Report Footer Actions */}
             <div className="flex flex-col md:flex-row gap-3 print:hidden">
               <Button 
                 onClick={handlePrint} 
                 className="flex-1 h-11 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-wider text-[11px] rounded-sm transition-colors"
               >
                 <Download className="mr-2 h-3.5 w-3.5" /> Download PDF
               </Button>
               <Button 
                 onClick={handleReset} 
                 variant="outline" 
                 className="flex-1 h-11 border border-gray-300 text-gray-600 hover:border-black hover:text-black font-bold uppercase tracking-wider text-[11px] rounded-sm transition-colors"
               >
                 <RefreshCw className="mr-2 h-3.5 w-3.5" /> Start New
               </Button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CGPACalculator;
