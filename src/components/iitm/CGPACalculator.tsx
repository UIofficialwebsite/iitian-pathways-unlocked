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
  const [subjectsCompleted, setSubjectsCompleted] = useState("");
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", credits: "4", grade: "10" }
  ]);
  const [showReport, setShowReport] = useState(false);

  // Result States
  const [semesterGPA, setSemesterGPA] = useState(0);
  const [cumulativeCGPA, setCumulativeCGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({});
  
  // Jobs Data Integration
  const { jobs, isLoading: jobsLoading } = useJobsManager();
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Autoplay plugin
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
    const pastSubjects = parseInt(subjectsCompleted) || 0;
    
    // Formula: (Past Grade Points + Current Semester Grade Points) / Total Credits
    const totalSemPoints = semPoints; 
    const finalTotalCredits = pastCredits + semCredits;
    const totalPoints = (pastCGPA * pastCredits) + totalSemPoints;
    
    const cCGPA = finalTotalCredits > 0 ? totalPoints / finalTotalCredits : 0;
    
    setCumulativeCGPA(cCGPA);
    setTotalCredits(finalTotalCredits);
    setTotalSubjects(pastSubjects + courses.length);
    setGradeDistribution(dist);
  }, [courses, currentCGPA, creditsCompleted, subjectsCompleted]);

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
      setSubjectsCompleted("");
      setCourses([{ id: "1", name: "", credits: "4", grade: "10" }]);
      setShowReport(false);
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "Expected_Performance_Report",
    // Custom Page Style for Print
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background-color: white;
        }
        
        /* Main Container for the Border */
        .print-page-wrapper {
          padding: 10mm;
          min-height: 297mm;
          box-sizing: border-box;
          position: relative;
        }

        .print-border-container {
          border: 3px double #1a1a1a;
          padding: 15mm;
          min-height: 275mm;
          position: relative;
          background: white;
        }

        /* Corner decorations (optional for professional look) */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #000;
          border-style: solid;
        }
        .corner-tl { top: -1px; left: -1px; border-width: 4px 0 0 4px; }
        .corner-tr { top: -1px; right: -1px; border-width: 4px 4px 0 0; }
        .corner-bl { bottom: -1px; left: -1px; border-width: 0 0 4px 4px; }
        .corner-br { bottom: -1px; right: -1px; border-width: 0 4px 4px 0; }

        /* Watermark */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 8rem;
          color: rgba(0,0,0,0.03);
          font-weight: 900;
          text-transform: uppercase;
          pointer-events: none;
          z-index: 0;
          white-space: nowrap;
        }

        .print-footer {
          position: absolute;
          bottom: 15mm;
          left: 15mm;
          right: 15mm;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }

        .print-header {
          display: flex !important;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }

        .screen-only {
          display: none !important;
        }
      }
    `
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
        <div className="w-full bg-black text-white py-3 px-6 mb-8 screen-only">
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
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-20 screen-only">
        
        {/* Academic Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
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
          <div className="space-y-3 w-full">
            <Label htmlFor="subjects-completed" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Subjects Completed</Label>
            <Input
              id="subjects-completed"
              type="number"
              placeholder="0"
              value={subjectsCompleted}
              onChange={(e) => setSubjectsCompleted(e.target.value)}
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

      {/* 3. REPORT SECTION */}
      {showReport && (
        <div className="w-full bg-white border-t border-gray-200 animate-in fade-in duration-500">
           
           {/* WRAPPER FOR PRINT REF */}
           <div ref={reportRef} className="print-page-wrapper">
             <div className="print-border-container relative">
                
                {/* Decorative Corners for Print */}
                <div className="hidden print:block corner-tl"></div>
                <div className="hidden print:block corner-tr"></div>
                <div className="hidden print:block corner-bl"></div>
                <div className="hidden print:block corner-br"></div>
                
                {/* Watermark */}
                <div className="hidden print:block watermark">CONFIDENTIAL</div>

                {/* PRINT HEADER */}
                <div className="hidden print-header flex-row justify-between items-end w-full">
                    <div className="flex items-center gap-4">
                      {/* Placeholder for actual logo - using high contrast for print */}
                      <div className="h-16 w-16 bg-black flex items-center justify-center text-white font-bold text-2xl tracking-tighter">UI</div>
                      <div className="flex flex-col">
                        <h1 className="text-2xl font-bold uppercase text-black font-sans leading-none tracking-wide">Institute of Excellence</h1>
                        <p className="text-sm text-gray-600 font-sans tracking-widest uppercase mt-1">Official Transcript Projection</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-900">Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      <p className="text-xs text-gray-600 font-sans">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Screen-only Header (retained for UI) */}
                <div className="max-w-[1000px] mx-auto my-12 p-8 md:p-14 space-y-8 screen-only">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <h2 className="text-3xl font-semibold tracking-tight text-black font-sans uppercase">
                        Expected Performance Report
                        </h2>
                        <div className="flex justify-center gap-4 pt-2">
                        <Button onClick={handlePrint} variant="outline" className="h-8 text-[10px] uppercase font-medium tracking-wide text-black border-black hover:bg-gray-50 rounded-none font-sans">
                            <Download className="w-3 h-3 mr-2" /> Download Official PDF
                        </Button>
                        <Button onClick={handleReset} variant="ghost" className="h-8 text-[10px] uppercase font-medium tracking-wide text-gray-500 hover:text-black rounded-none font-sans">
                            <RefreshCw className="w-3 h-3 mr-2" /> Reset
                        </Button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="print:px-4 print:py-2 max-w-[1000px] mx-auto">
                    
                    {/* Student Info / Context */}
                    <div className="mb-8 p-4 border-l-4 border-black bg-gray-50 print:bg-transparent print:border-l-2 print:border-black print:pl-4">
                        <div className="grid grid-cols-2 gap-y-2">
                            <div className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest w-24 inline-block">Branch:</span> <span className="font-semibold">{branch}</span></div>
                            <div className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest w-24 inline-block">Level:</span> <span className="font-semibold">{level}</span></div>
                            <div className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest w-24 inline-block">Semesters:</span> <span className="font-semibold">{creditsCompleted ? Math.ceil(parseInt(creditsCompleted)/20) + 1 : 1} (Est.)</span></div>
                        </div>
                    </div>

                    {/* PREVIOUS RECORD SUMMARY */}
                    {(currentCGPA || creditsCompleted) && (
                        <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-3 border-b border-gray-300 pb-1">Previous Academic Standing</h4>
                        <div className="flex justify-start gap-12 text-left">
                            <div>
                                <span className="block text-2xl font-bold text-black font-sans">{currentCGPA || "-"}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-sans tracking-wide">Current CGPA</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-black font-sans">{creditsCompleted || "0"}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-sans tracking-wide">Credits Earned</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-black font-sans">{subjectsCompleted || "0"}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-sans tracking-wide">Subjects Completed</span>
                            </div>
                        </div>
                        </div>
                    )}

                    {/* Current Semester Performance */}
                    <div className="mb-10">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-4 border-b border-gray-300 pb-1">Projected Performance</h4>
                        
                        {/* Big Stats */}
                        <div className="flex flex-row justify-start gap-16 items-start mb-8">
                            <div className="text-left">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 font-sans">Projected Semester GPA</h3>
                                <div className="text-5xl font-bold text-black tracking-tight font-sans">{semesterGPA.toFixed(2)}</div>
                            </div>
                            <div className="w-px h-12 bg-gray-300"></div>
                            <div className="text-left">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 font-sans">New Cumulative CGPA</h3>
                                <div className="text-5xl font-bold text-black tracking-tight font-sans">{cumulativeCGPA.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Transcript Table */}
                        <div className="w-full">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-xs font-bold text-black uppercase tracking-wide font-sans">Detailed Course List</h3>
                            </div>
                            <table className="w-full text-left border-collapse border-t-2 border-b-2 border-black">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-black font-sans w-2/3">Course Name</th>
                                        <th className="py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-black text-center font-sans">Credits</th>
                                        <th className="py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-black text-right font-sans">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {courses.map((c, i) => (
                                    <tr key={i} className="print:break-inside-avoid">
                                        <td className="py-2 px-2 text-xs font-medium text-black font-sans">{c.name || `Course Element ${i+1}`}</td>
                                        <td className="py-2 px-2 text-xs text-black text-center font-sans">{c.credits}</td>
                                        <td className="py-2 px-2 text-xs font-bold text-black text-right font-sans">{c.grade} <span className="text-[10px] font-normal text-gray-500 ml-1">({getPoint(c.grade)} pts)</span></td>
                                    </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 print:bg-gray-100 font-bold border-t border-black">
                                        <td className="py-2 px-2 text-xs uppercase">Total</td>
                                        <td className="py-2 px-2 text-center text-xs">{courses.reduce((acc, curr) => acc + (parseFloat(curr.credits)||0), 0)}</td>
                                        <td className="py-2 px-2 text-right text-xs">-</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* PRINT FOOTER */}
                <div className="hidden print-footer w-full flex-row justify-between items-center">
                    <div className="text-[9px] text-gray-500 font-sans uppercase tracking-wider">
                        <p>This document is a system-generated estimation and not an official grade card.</p>
                        <p>Verify all inputs against official academic records.</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-black uppercase tracking-wider font-sans">Academic Cell</span>
                        <span className="text-[9px] text-gray-500 uppercase">Authorized Signatory</span>
                    </div>
                </div>

             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CGPACalculator;
