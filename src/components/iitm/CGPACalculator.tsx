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
    Autoplay({ delay: 3500, stopOnInteraction: false })
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
    documentTitle: "Expected_Performance_Report",
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
      
      {/* 1. TOP ROW: JOB TICKER */}
      {!jobsLoading && jobs && jobs.length > 0 && (
        <div className="w-full bg-black text-white py-3 px-6 mb-8">
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
                  <div className="flex items-center justify-between gap-4 h-9 w-full max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="hidden md:inline-flex bg-gray-100 text-green-600 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap font-sans">
                        OPEN NOW
                      </span>
                      <span className="text-xs md:text-sm font-semibold truncate font-sans tracking-wide">
                        {job.title} applications are live
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
                        variant="default" 
                        className="h-9 text-sm font-semibold tracking-wide px-6 bg-white text-black hover:bg-gray-200 border-none rounded-sm font-sans"
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

      {/* 2. MAIN INPUTS */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-20">
        
        {/* Academic Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 w-full">
          <div className="space-y-3 w-full">
            <Label htmlFor="current-cgpa" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Current CGPA</Label>
            <Input
              id="current-cgpa"
              type="number"
              placeholder="0.00"
              value={currentCGPA}
              onChange={(e) => setCurrentCGPA(e.target.value)}
              className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-3 w-full">
            <Label htmlFor="credits-completed" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Credits Earned</Label>
            <Input
              id="credits-completed"
              type="number"
              placeholder="0"
              value={creditsCompleted}
              onChange={(e) => setCreditsCompleted(e.target.value)}
              className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Course Inputs */}
        <div className="space-y-5 w-full">
          <div className="flex justify-between items-end pb-2 border-b border-gray-200">
             <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-sans">Semester Subjects</Label>
          </div>

          <div className="space-y-3 w-full">
            {courses.map((course, index) => (
              <div key={course.id} className="grid grid-cols-12 gap-4 items-center group w-full">
                <div className="col-span-6 md:col-span-7">
                  <Input
                    placeholder="Subject Name"
                    value={course.name}
                    onChange={(e) => updateCourse(index, "name", e.target.value)}
                    className="bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 font-normal text-sm h-11 px-3 rounded-sm transition-colors w-full font-sans placeholder:text-gray-400"
                  />
                </div>
                <div className="col-span-2 md:col-span-2">
                    <Input
                    type="number"
                    placeholder="Cr"
                    value={course.credits}
                    onChange={(e) => updateCourse(index, "credits", e.target.value)}
                    className="text-center h-11 text-sm bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 rounded-sm w-full font-sans font-normal placeholder:text-gray-400"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                    <SelectTrigger className="h-11 text-sm border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 rounded-sm bg-white w-full font-sans font-normal">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs font-sans font-medium">{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-center">
                   <button
                    onClick={() => removeCourse(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={courses.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex justify-end gap-4 w-full">
             <Button 
               onClick={addCourse} 
               variant="outline" 
               className="h-12 px-6 border-dashed border-2 border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 uppercase text-xs tracking-wider font-normal rounded-sm font-sans"
             >
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Row
            </Button>
            <Button 
              onClick={handleCalculate} 
              className="h-12 px-8 bg-blue-700 hover:bg-blue-800 text-white uppercase text-xs tracking-wider font-normal rounded-sm transition-transform active:scale-[0.99] font-sans"
            >
              Calculate Result
            </Button>
          </div>
        </div>
      </div>

      {/* 3. REPORT SECTION - Designed as a Clean PDF Report */}
      {showReport && (
        <div ref={reportRef} className="w-full bg-white border-t border-gray-200 animate-in fade-in duration-500">
           <div className="max-w-[1600px] mx-auto p-8 md:p-14 space-y-12">
             
             {/* Report Header */}
             <div className="flex flex-col items-center justify-center text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black font-sans">
                  Expected Performance Report
                </h2>
                <p className="text-sm text-gray-500 font-normal font-sans max-w-lg">
                  This report provides an estimated projection of your academic performance based on the data entered.
                </p>
                <div className="flex justify-center gap-4 print:hidden pt-2">
                   <Button onClick={handlePrint} variant="outline" className="h-9 text-xs uppercase font-medium tracking-wide text-black border-gray-300 hover:bg-gray-50 rounded-sm font-sans">
                      <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
                   </Button>
                   <Button onClick={handleReset} variant="ghost" className="h-9 text-xs uppercase font-medium tracking-wide text-gray-500 hover:text-black rounded-sm font-sans">
                      <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Data
                   </Button>
                </div>
             </div>

             <div className="w-full h-px bg-gray-100"></div>

             {/* Stats Row - Clean & Minimal */}
             <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 py-6">
               <div className="text-center">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-3 font-sans">Semester GPA</h3>
                  <div className="text-7xl font-semibold text-black tracking-tight leading-none font-sans">{semesterGPA.toFixed(2)}</div>
               </div>
               <div className="hidden md:block w-px h-24 bg-gray-100"></div>
               <div className="text-center">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-3 font-sans">Cumulative CGPA</h3>
                  <div className="text-7xl font-semibold text-black tracking-tight leading-none font-sans">{cumulativeCGPA.toFixed(2)}</div>
               </div>
             </div>

             {/* Visual Analysis */}
             <div className="flex flex-col items-center py-6">
                 <div className="mb-10 relative">
                    <div 
                       className="w-56 h-56 rounded-full flex items-center justify-center shadow-sm border-4 border-white ring-1 ring-gray-100"
                       style={{ background: getConicGradient() }}
                    >
                       <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-4xl font-semibold text-black leading-none font-sans">{courses.length}</span>
                          <span className="text-[10px] uppercase font-medium text-gray-400 tracking-wider mt-2 font-sans">Subjects</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap justify-center gap-8">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                       count > 0 && (
                          <div key={grade} className="flex items-center gap-2.5">
                             <div className={`w-2.5 h-2.5 rounded-sm ${grade === 'S' ? 'bg-black' : 'bg-gray-400'}`}></div>
                             <span className="text-sm font-medium text-gray-600 font-sans">{grade} Grade: <span className="text-black">{count}</span></span>
                          </div>
                       )
                    ))}
                 </div>
             </div>

             {/* Transcript Table - Minimal Border */}
             <div className="pt-4">
                <div className="flex justify-between items-end mb-4 border-b border-black pb-2">
                   <h3 className="text-sm font-semibold text-black uppercase tracking-wide font-sans">Subject Transcript</h3>
                   <span className="text-xs font-medium text-gray-500 font-sans">Total Credits: {totalCredits}</span>
                </div>
                <div className="overflow-hidden rounded-sm border border-gray-200">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                           <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-wider text-gray-500 font-sans">Subject Name</th>
                           <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-center font-sans">Credits</th>
                           <th className="py-4 px-6 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right font-sans">Grade Point</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {courses.map((c, i) => (
                           <tr key={i} className="hover:bg-gray-50/50">
                              <td className="py-3.5 px-6 text-sm font-normal text-gray-900 font-sans">{c.name || `Subject ${i+1}`}</td>
                              <td className="py-3.5 px-6 text-sm font-normal text-gray-600 text-center font-sans">{c.credits}</td>
                              <td className="py-3.5 px-6 text-sm font-semibold text-black text-right font-sans">{getPoint(c.grade)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             </div>

             {/* Footer Note */}
             <div className="text-center text-[10px] text-gray-400 font-sans pt-8">
                Generated via IITM Calculator • {new Date().toLocaleDateString()}
             </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default CGPACalculator;
