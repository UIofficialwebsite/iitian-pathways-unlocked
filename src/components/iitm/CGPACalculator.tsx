import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useJobsManager } from "@/hooks/useJobsManager";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type Grade = "10" | "9" | "8" | "7" | "6" | "5" | "4" | "0";

interface Course {
  id: string;
  name: string;
  credits: string;
  grade: Grade;
}

interface CGPACalculatorProps {
  branch?: string;
  level?: string;
}

const CGPACalculator: React.FC<CGPACalculatorProps> = ({ 
  branch = "Data Science", 
  level = "Foundation" 
}) => {
  // Input States
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [creditsCompleted, setCreditsCompleted] = useState("");
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", credits: "4", grade: "10" }
  ]);
  const [showReport, setShowReport] = useState(false);

  // Result States
  const [semesterGPA, setSemesterGPA] = useState(0);
  const [cumulativeCGPA, setCumulativeCGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({});
  
  // Jobs Data Integration
  const { jobs, isLoading: jobsLoading } = useJobsManager();
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Autoplay plugin for the carousel
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

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
    let semPoints = 0;
    let semCredits = 0;
    const dist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, Others: 0 };

    courses.forEach(c => {
      const cr = parseFloat(c.credits) || 0;
      const gp = getPoint(c.grade);
      
      semPoints += gp * cr;
      semCredits += cr;

      if (c.grade === "10") dist.S++;
      else if (c.grade === "9") dist.A++;
      else if (c.grade === "8") dist.B++;
      else if (c.grade === "7") dist.C++;
      else dist.Others++;
    });

    const sGPA = semCredits > 0 ? semPoints / semCredits : 0;
    setSemesterGPA(sGPA);

    const pastCGPA = parseFloat(currentCGPA) || 0;
    const pastCredits = parseFloat(creditsCompleted) || 0;
    
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
    setCourses([...courses, { id: Date.now().toString(), name: "", credits: "4", grade: "10" }]);
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

  const handleCalculate = () => {
    setShowReport(true);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    if (window.confirm("Start over?")) {
      setCurrentCGPA("");
      setCreditsCompleted("");
      setCourses([{ id: "1", name: "", credits: "4", grade: "10" }]);
      setShowReport(false);
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "Grade_Report",
  });

  const getConicGradient = () => {
    const total = courses.length;
    if (total === 0) return "conic-gradient(#f3f4f6 0deg 360deg)";

    const colors = { S: "#000000", A: "#4b5563", B: "#9ca3af", C: "#d1d5db", Others: "#f3f4f6" };
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
    <div className="w-full bg-white font-sans text-gray-900">
      
      {/* 1. TOP ROW: JOB TICKER (Banner Style) */}
      {!jobsLoading && jobs && jobs.length > 0 && (
        <div className="w-full bg-black text-white py-2 px-6 mb-8">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {jobs.map((job) => (
                <CarouselItem key={job.id} className="basis-full">
                  <div className="flex items-center justify-between gap-4 h-8 w-full max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs md:text-sm font-medium whitespace-nowrap text-gray-300 font-sans tracking-wide">
                        POSITIONS OPEN:
                      </span>
                      <span className="text-xs md:text-sm font-bold truncate font-sans tracking-wide">
                        {job.title} <span className="font-normal text-gray-400">at</span> {job.company}
                      </span>
                    </div>
                    
                    <a 
                      href={job.application_url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-7 text-[11px] font-sans font-bold tracking-wider px-4 bg-white text-black hover:bg-gray-200 border-none rounded-sm"
                      >
                        Apply Now
                      </Button>
                    </a>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {/* 2. MAIN INPUTS (Full Width) */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-20">
        
        {/* Academic Status - Using full grid width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 w-full">
          <div className="space-y-3 w-full">
            <Label htmlFor="current-cgpa" className="text-xs font-bold uppercase tracking-wide text-gray-500 font-sans">Current CGPA</Label>
            <Input
              id="current-cgpa"
              type="number"
              placeholder="0.00"
              value={currentCGPA}
              onChange={(e) => setCurrentCGPA(e.target.value)}
              className="h-12 w-full text-lg bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm font-sans"
            />
          </div>
          <div className="space-y-3 w-full">
            <Label htmlFor="credits-completed" className="text-xs font-bold uppercase tracking-wide text-gray-500 font-sans">Credits Earned</Label>
            <Input
              id="credits-completed"
              type="number"
              placeholder="0"
              value={creditsCompleted}
              onChange={(e) => setCreditsCompleted(e.target.value)}
              className="h-12 w-full text-lg bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm font-sans"
            />
          </div>
        </div>

        {/* Course Inputs - Full Width */}
        <div className="space-y-5 w-full">
          <div className="flex justify-between items-end pb-2 border-b border-gray-100">
             <Label className="text-xs font-bold uppercase tracking-wide text-gray-500 font-sans">Semester Subjects</Label>
          </div>

          <div className="space-y-3 w-full">
            {courses.map((course, index) => (
              <div key={course.id} className="grid grid-cols-12 gap-4 items-center group w-full">
                <div className="col-span-6 md:col-span-7">
                  <Input
                    placeholder="Subject Name"
                    value={course.name}
                    onChange={(e) => updateCourse(index, "name", e.target.value)}
                    className="bg-transparent border-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 font-medium text-sm h-11 px-3 rounded-sm transition-colors w-full font-sans"
                  />
                </div>
                <div className="col-span-2 md:col-span-2">
                    <Input
                    type="number"
                    placeholder="Cr"
                    value={course.credits}
                    onChange={(e) => updateCourse(index, "credits", e.target.value)}
                    className="text-center h-11 text-sm border-gray-200 focus:border-black focus:ring-0 rounded-sm w-full font-sans"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                    <SelectTrigger className="h-11 text-sm border-gray-200 focus:border-black focus:ring-0 rounded-sm bg-white w-full font-sans">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs font-sans">{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                    onClick={() => removeCourse(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    disabled={courses.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex gap-4 w-full">
             <Button onClick={addCourse} variant="outline" className="h-12 px-6 border-dashed border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 uppercase text-xs tracking-wider font-bold rounded-sm font-sans">
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Row
            </Button>
            <Button 
              onClick={handleCalculate} 
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white uppercase text-xs tracking-wider font-bold rounded-sm transition-transform active:scale-[0.99] font-sans"
            >
              Calculate Result
            </Button>
          </div>
        </div>
      </div>

      {/* 3. REPORT SECTION (Bottom, Full Width, Vertical) */}
      {showReport && (
        <div ref={reportRef} className="w-full bg-white border-t border-gray-200 animate-in fade-in duration-500">
           <div className="max-w-[1600px] mx-auto p-6 md:p-12 space-y-16">
             
             {/* Report Header */}
             <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight uppercase text-black mb-2 font-sans">Performance Report</h2>
                <div className="flex justify-center gap-4 print:hidden">
                   <Button onClick={handlePrint} variant="ghost" className="h-8 text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-black hover:bg-gray-100 font-sans">
                      <Download className="w-3 h-3 mr-2" /> Download PDF
                   </Button>
                   <Button onClick={handleReset} variant="ghost" className="h-8 text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-black hover:bg-gray-100 font-sans">
                      <RefreshCw className="w-3 h-3 mr-2" /> Reset
                   </Button>
                </div>
             </div>

             {/* Stats Row */}
             <div className="flex flex-col md:flex-row justify-center items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-100 border-y border-gray-100 py-12">
               <div className="flex-1 text-center px-6 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 font-sans">Semester GPA</h3>
                  <div className="text-8xl font-black text-black tracking-tighter leading-none font-sans">{semesterGPA.toFixed(2)}</div>
               </div>
               <div className="flex-1 text-center px-6 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 font-sans">Cumulative CGPA</h3>
                  <div className="text-8xl font-black text-black tracking-tighter leading-none font-sans">{cumulativeCGPA.toFixed(2)}</div>
               </div>
             </div>

             {/* Chart Section */}
             <div className="flex flex-col items-center">
                 <div className="mb-10">
                    <div 
                       className="w-64 h-64 rounded-full flex items-center justify-center shadow-sm border-[6px] border-white ring-1 ring-gray-100"
                       style={{ background: getConicGradient() }}
                    >
                       <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-5xl font-black text-black leading-none font-sans">{courses.length}</span>
                          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mt-2 font-sans">Subjects</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                       count > 0 && (
                          <div key={grade} className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${grade === 'S' ? 'bg-black' : 'bg-gray-300'}`}></div>
                             <span className="text-sm font-bold text-gray-700 font-sans">{grade} Grade: {count}</span>
                          </div>
                       )
                    ))}
                 </div>
             </div>

             {/* Detailed Table */}
             <div className="border border-gray-200 rounded-sm overflow-hidden mt-10">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center">
                   <h3 className="text-sm font-black text-black uppercase tracking-wide font-sans">Transcript</h3>
                   <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-sm uppercase font-sans">{totalCredits} Credits</span>
                </div>
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="py-5 px-8 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Subject</th>
                         <th className="py-5 px-8 text-xs font-bold uppercase tracking-wider text-gray-400 text-center font-sans">Cr</th>
                         <th className="py-5 px-8 text-xs font-bold uppercase tracking-wider text-gray-400 text-right font-sans">GP</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {courses.map((c, i) => (
                         <tr key={i} className="hover:bg-gray-50/50">
                            <td className="py-4 px-8 text-sm font-semibold text-gray-800 font-sans">{c.name || `Subject ${i+1}`}</td>
                            <td className="py-4 px-8 text-sm text-gray-600 text-center font-sans">{c.credits}</td>
                            <td className="py-4 px-8 text-sm font-bold text-black text-right font-sans">{getPoint(c.grade)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default CGPACalculator;
