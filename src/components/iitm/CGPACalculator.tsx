import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, RefreshCw, Target, TrendingUp } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useJobsManager } from "@/hooks/useJobsManager";
import { Progress } from "@/components/ui/progress";
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
  // --- Input States ---
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [creditsCompleted, setCreditsCompleted] = useState("");
  const [subjectsCompleted, setSubjectsCompleted] = useState("");
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", credits: "4", grade: "10" }
  ]);
  const [showReport, setShowReport] = useState(false);

  // --- Prediction States (New Feature) ---
  const [targetCGPA, setTargetCGPA] = useState("");
  const [futureCredits, setFutureCredits] = useState("20");

  // --- Result States ---
  const [semesterGPA, setSemesterGPA] = useState(0);
  const [cumulativeCGPA, setCumulativeCGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({});
  
  // Jobs Data Integration
  const { jobs, isLoading: jobsLoading } = useJobsManager();
  
  const reportRef = useRef<HTMLDivElement>(null);
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: false }));

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

  // --- Prediction & Conclusion Logic (New Feature) ---
  const prediction = useMemo(() => {
    if (!targetCGPA || !futureCredits || totalCredits === 0) return null;
    const t = parseFloat(targetCGPA);
    const f = parseFloat(futureCredits);
    if (isNaN(t) || isNaN(f)) return null;

    const currentPoints = cumulativeCGPA * totalCredits;
    const requiredTotalPoints = t * (totalCredits + f);
    const pointsNeeded = requiredTotalPoints - currentPoints;
    const requiredGPA = pointsNeeded / f;

    return {
      requiredGPA,
      possible: requiredGPA <= 10 && requiredGPA >= 0
    };
  }, [targetCGPA, futureCredits, cumulativeCGPA, totalCredits]);

  const getConclusion = (cgpa: number) => {
    if (cgpa >= 9.0) return { title: "Outstanding", color: "text-emerald-700", text: "Exceptional academic standing. You are in the top tier." };
    if (cgpa >= 8.0) return { title: "Very Good", color: "text-blue-700", text: "Solid record opening most career & higher ed opportunities." };
    if (cgpa >= 7.0) return { title: "Good", color: "text-indigo-700", text: "Consistent performance. Push harder to cross the 8.0 barrier." };
    if (cgpa >= 6.0) return { title: "Satisfactory", color: "text-amber-700", text: "Clearing requirements, but improvement needed for top roles." };
    return { title: "Action Required", color: "text-red-700", text: "Immediate focus required to improve academic standing." };
  };

  const conclusion = getConclusion(cumulativeCGPA);

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
      setCurrentCGPA(""); setCreditsCompleted(""); setSubjectsCompleted("");
      setCourses([{ id: "1", name: "", credits: "4", grade: "10" }]);
      setTargetCGPA(""); setFutureCredits("20");
      setShowReport(false);
    }
  };
  
  // --- Original Print Styles (Preserved) ---
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "Expected_Performance_Report",
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; margin: 0; padding: 0; }
        .print-page-wrapper { width: 100%; min-height: 100vh; box-sizing: border-box; position: relative; }
        .print-border-container { width: 100%; min-height: 275mm; border: 3px double #1a1a1a; padding: 10mm 15mm; box-sizing: border-box; position: relative; background: white; display: flex; flex-direction: column; }
        .report-card { border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 8rem; color: rgba(0,0,0,0.03); font-weight: 900; text-transform: uppercase; pointer-events: none; z-index: 0; white-space: nowrap; }
        .print-footer { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; display: flex !important; width: 100%; justify-content: space-between; align-items: center; page-break-inside: avoid; }
        .print-header { display: flex !important; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        .screen-only { display: none !important; }
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
      
      {/* 1. TOP TICKER (Screen Only) */}
      {!jobsLoading && jobs && jobs.length > 0 && (
        <div className="w-full bg-black text-white py-3 px-6 mb-8 screen-only">
          <Carousel plugins={[plugin.current]} className="w-full" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset} opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {jobs.map((job) => (
                <CarouselItem key={job.id} className="basis-full">
                  <div className="flex items-center justify-between gap-4 h-9 w-full max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="hidden md:inline-flex bg-gray-100 text-green-600 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap font-sans">OPEN NOW</span>
                      <span className="text-xs md:text-sm font-semibold truncate font-sans tracking-wide">{job.title} applications are live</span>
                    </div>
                    <a href={job.application_url || "#"} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button size="sm" variant="default" className="h-9 text-sm font-semibold tracking-wide px-6 bg-white text-black hover:bg-gray-200 border-none rounded-sm font-sans">Apply Now</Button>
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
        
        {/* Past Records */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
          <div className="space-y-3 w-full">
            <Label htmlFor="current-cgpa" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Current CGPA</Label>
            <Input id="current-cgpa" type="number" placeholder="0.00" value={currentCGPA} onChange={(e) => setCurrentCGPA(e.target.value)} className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal" />
          </div>
          <div className="space-y-3 w-full">
            <Label htmlFor="credits-completed" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Credits Earned</Label>
            <Input id="credits-completed" type="number" placeholder="0" value={creditsCompleted} onChange={(e) => setCreditsCompleted(e.target.value)} className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal" />
          </div>
          <div className="space-y-3 w-full">
            <Label htmlFor="subjects-completed" className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">Subjects Completed</Label>
            <Input id="subjects-completed" type="number" placeholder="0" value={subjectsCompleted} onChange={(e) => setSubjectsCompleted(e.target.value)} className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal" />
          </div>
        </div>

        {/* Course Rows */}
        <div className="space-y-5 w-full">
          <div className="flex justify-between items-end pb-2 border-b border-gray-200">
             <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-sans">Semester Subjects</Label>
          </div>
          <div className="space-y-3 w-full">
            {courses.map((course, index) => (
              <div key={course.id} className="grid grid-cols-12 gap-4 items-center group w-full">
                <div className="col-span-6 md:col-span-7">
                  <Input placeholder="Subject Name" value={course.name} onChange={(e) => updateCourse(index, "name", e.target.value)} className="bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 font-normal text-sm h-11 px-3 rounded-sm w-full font-sans" />
                </div>
                <div className="col-span-2 md:col-span-2">
                    <Input type="number" placeholder="Cr" value={course.credits} onChange={(e) => updateCourse(index, "credits", e.target.value)} className="text-center h-11 text-sm bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 rounded-sm w-full font-sans" />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                    <SelectTrigger className="h-11 text-sm border-2 border-gray-200 hover:border-gray-300 focus:border-black focus:ring-0 rounded-sm bg-white w-full font-sans"><SelectValue placeholder="Grade" /></SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs font-sans font-medium">{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-center">
                   <button onClick={() => removeCourse(index)} className="text-gray-400 hover:text-red-500 transition-colors" disabled={courses.length <= 1}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* NEW: Prediction Inputs (Added Above Buttons) */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 w-full border-t border-gray-100 mt-8">
             <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <Target className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col">
                        <Label className="text-[10px] uppercase text-gray-400 font-bold font-sans">Target CGPA</Label>
                        <Input placeholder="e.g. 8.5" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} className="h-6 w-20 bg-transparent border-none p-0 text-sm focus-visible:ring-0 placeholder:text-gray-300 font-sans" />
                    </div>
                    <div className="w-px h-8 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col">
                        <Label className="text-[10px] uppercase text-gray-400 font-bold font-sans">Future Credits</Label>
                        <Input placeholder="e.g. 20" value={futureCredits} onChange={(e) => setFutureCredits(e.target.value)} className="h-6 w-20 bg-transparent border-none p-0 text-sm focus-visible:ring-0 placeholder:text-gray-300 font-sans" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
                <Button onClick={addCourse} variant="outline" className="h-12 px-6 border-dashed border-2 border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 uppercase text-xs tracking-wider font-normal rounded-sm font-sans"><Plus className="mr-2 h-3.5 w-3.5" /> Add Row</Button>
                <Button onClick={handleCalculate} className="h-12 px-8 bg-blue-700 hover:bg-blue-800 text-white uppercase text-xs tracking-wider font-normal rounded-sm transition-transform active:scale-[0.99] font-sans">Calculate Result</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRINTABLE REPORT */}
      {showReport && (
        <div className="w-full bg-white border-t border-gray-200 animate-in fade-in duration-500 relative min-h-screen">
           
           <div ref={reportRef} className="print-page-wrapper">
             
             <div className="print-border-container report-card max-w-[1000px] mx-auto my-12 p-8 md:p-14 space-y-8 border-2 border-black rounded-none shadow-sm print:shadow-none print:my-0">
             
                 {/* Watermark */}
                 <div className="hidden print:block watermark">EXPECTED</div>

                 {/* Print Header */}
                 <div className="hidden print-header flex-row justify-between items-center w-full">
                    <div className="flex items-center">
                       <img src="https://i.ibb.co/RT8FMKst/UI-Logo.png" alt="UI Logo" className="h-14 w-auto object-contain" />
                    </div>
                    <div className="text-right">
                       <h1 className="text-xl font-bold uppercase text-black font-sans tracking-wide">Performance Report</h1>
                       <p className="text-xs text-gray-500 font-sans tracking-widest">{new Date().toLocaleDateString()}</p>
                    </div>
                 </div>

                 {/* Screen Header */}
                 <div className="flex flex-col items-center justify-center text-center space-y-3 screen-only">
                    <h2 className="text-3xl font-semibold tracking-tight text-black font-sans uppercase">Expected Performance Report</h2>
                    <p className="text-xs text-gray-500 font-medium font-sans uppercase tracking-widest">Academic Projection</p>
                    <div className="flex justify-center gap-4 pt-2">
                       <Button onClick={handlePrint} variant="outline" className="h-8 text-[10px] uppercase font-medium tracking-wide text-black border-black hover:bg-gray-50 rounded-none font-sans"><Download className="w-3 h-3 mr-2" /> Download</Button>
                       <Button onClick={handleReset} variant="ghost" className="h-8 text-[10px] uppercase font-medium tracking-wide text-gray-500 hover:text-black rounded-none font-sans"><RefreshCw className="w-3 h-3 mr-2" /> Reset</Button>
                    </div>
                 </div>

                 <div className="w-full h-px bg-black screen-only"></div>

                 {/* Previous Record */}
                 {(currentCGPA || creditsCompleted) && (
                    <div className="bg-gray-50 p-4 border border-black rounded-none print:border print:border-black print:mb-6">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 font-sans">Previous Academic Record</h4>
                       <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-300">
                          <div><span className="block text-xl font-bold text-black font-sans">{currentCGPA || "-"}</span><span className="text-[9px] uppercase text-gray-500 font-sans tracking-wide">Current CGPA</span></div>
                          <div><span className="block text-xl font-bold text-black font-sans">{creditsCompleted || "0"}</span><span className="text-[9px] uppercase text-gray-500 font-sans tracking-wide">Credits Earned</span></div>
                          <div><span className="block text-xl font-bold text-black font-sans">{subjectsCompleted || "0"}</span><span className="text-[9px] uppercase text-gray-500 font-sans tracking-wide">Subjects Completed</span></div>
                       </div>
                    </div>
                 )}

                 {/* Stats Row */}
                 <div className="flex flex-col md:flex-row justify-between items-center gap-12 px-8 py-4 print:py-4 print:mb-4">
                   <div className="text-center flex-1">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Semester GPA</h3>
                      <div className="text-6xl font-semibold text-black tracking-tight leading-none font-sans">{semesterGPA.toFixed(2)}</div>
                   </div>
                   <div className="hidden md:block w-px h-16 bg-gray-200 print:bg-black"></div>
                   <div className="text-center flex-1">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">Cumulative CGPA</h3>
                      <div className="text-6xl font-semibold text-black tracking-tight leading-none font-sans">{cumulativeCGPA.toFixed(2)}</div>
                   </div>
                 </div>

                 {/* Analytics Section (Original Chart + New Conclusions & Predictions) */}
                 <div className="flex flex-col md:flex-row gap-8 items-start py-6 bg-gray-50/50 border border-black rounded-none print:border print:bg-white print:border-black print:mb-6 p-6">
                     {/* Original Chart Visual */}
                     <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 pr-6 w-full">
                         <div className="mb-6 relative">
                            <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-sm border-4 border-white ring-1 ring-gray-200 print:border-black print:ring-0" style={{ background: getConicGradient() }}>
                               <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner print:shadow-none">
                                  <span className="text-2xl font-semibold text-black leading-none font-sans">{courses.length}</span>
                                  <span className="text-[8px] uppercase font-medium text-gray-400 tracking-wider mt-1 font-sans">Subjects</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-wrap justify-center gap-4">
                            {Object.entries(gradeDistribution).map(([grade, count]) => (
                               count > 0 && <div key={grade} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-none border border-black ${grade === 'S' ? 'bg-black' : 'bg-gray-400'}`}></div><span className="text-[10px] font-medium text-gray-600 font-sans">{grade}: <span className="text-black font-bold">{count}</span></span></div>
                            ))}
                         </div>
                     </div>

                     {/* New: Conclusions & Predictions Section */}
                     <div className="flex-1 flex flex-col justify-center space-y-5 w-full">
                        {/* Conclusion */}
                        <div className={`border-l-2 ${conclusion.color.replace('text', 'border')} pl-4`}>
                           <h4 className={`text-sm font-bold uppercase tracking-wider ${conclusion.color} mb-1 font-sans`}>{conclusion.title}</h4>
                           <p className="text-[10px] text-gray-600 leading-relaxed font-sans">{conclusion.text}</p>
                        </div>
                        
                        {/* Prediction Bar */}
                        {prediction && (
                            <div className="bg-white p-3 border border-gray-200 shadow-sm">
                                <h4 className="text-[9px] uppercase font-bold text-gray-500 mb-2 flex items-center gap-2 font-sans"><TrendingUp className="w-3 h-3" /> Target: {targetCGPA}</h4>
                                {prediction.possible ? (
                                    <>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-xl font-bold text-black font-sans">{prediction.requiredGPA.toFixed(2)}</span>
                                            <span className="text-[9px] text-gray-500 mb-1 font-sans">GPA needed next {futureCredits} credits</span>
                                        </div>
                                        <Progress value={(prediction.requiredGPA / 10) * 100} className="h-1.5 bg-gray-100" />
                                    </>
                                ) : (
                                    <p className="text-[9px] text-red-500 font-medium font-sans">Target not mathematically possible.</p>
                                )}
                            </div>
                        )}
                     </div>
                 </div>

                 {/* Transcript Table */}
                 <div className="print:flex-grow">
                    <div className="flex justify-between items-end mb-3 border-b-2 border-black pb-2">
                       <h3 className="text-xs font-bold text-black uppercase tracking-wide font-sans">Subject Transcript</h3>
                       <div className="flex gap-4 text-[10px] uppercase font-medium font-sans text-gray-500">
                          <span>Total Credits: <span className="text-black font-bold">{totalCredits}</span></span>
                          <span>Total Subjects: <span className="text-black font-bold">{totalSubjects}</span></span>
                       </div>
                    </div>
                    <div className="border border-black rounded-none">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-gray-100 border-b border-black print:bg-white">
                               <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-black font-sans border-r border-black">Subject Name</th>
                               <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-black text-center font-sans border-r border-black">Credits</th>
                               <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-black text-right font-sans">Grade Point</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-black">
                            {courses.map((c, i) => (
                               <tr key={i} className="hover:bg-gray-50 print:hover:bg-transparent">
                                  <td className="py-2 px-4 text-xs font-normal text-black font-sans border-r border-black">{c.name || `Subject ${i+1}`}</td>
                                  <td className="py-2 px-4 text-xs font-normal text-black text-center font-sans border-r border-black">{c.credits}</td>
                                  <td className="py-2 px-4 text-xs font-bold text-black text-right font-sans">{getPoint(c.grade)}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                 </div>

                 {/* NEW: "Work With Us" Section with QR CODES (Print Only) */}
                 {!jobsLoading && jobs && jobs.length > 0 && (
                    <div className="hidden print:block mt-8 pt-8 border-t-2 border-dashed border-gray-300 break-inside-avoid">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="h-2 w-2 bg-black rounded-full"></div>
                           <h3 className="text-sm font-bold uppercase tracking-widest text-black font-sans">Work With Us</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {jobs.slice(0, 4).map((job) => (
                            <div key={job.id} className="border border-gray-200 p-2 flex flex-row justify-between items-center gap-3 bg-gray-50/30">
                               <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-[10px] text-black uppercase leading-tight mb-1 truncate font-sans">{job.title}</h4>
                                 <p className="text-[8px] text-gray-500 line-clamp-2 leading-tight font-sans">{job.description || "Join our team to build the future of education."}</p>
                                 <div className="mt-2 text-[7px] font-bold text-green-700 uppercase tracking-wider border border-green-200 bg-green-50 px-1 py-0.5 w-fit rounded-none font-sans">Open Now</div>
                               </div>
                               <div className="shrink-0 flex flex-col items-center">
                                 {/* QR CODE GENERATION */}
                                 <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/career/job/' + job.id)}&color=000000`} 
                                    alt="Scan" 
                                    className="w-14 h-14 object-contain border border-black p-0.5 bg-white" 
                                  />
                                 <span className="text-[6px] font-bold uppercase mt-1 tracking-wider text-gray-500 font-sans">Scan to Apply</span>
                               </div>
                            </div>
                          ))}
                        </div>
                    </div>
                 )}

                 {/* Footer */}
                 <div className="hidden print-footer">
                    <span className="text-[9px] font-bold text-black uppercase tracking-wider font-sans">Calculated by UI Calculator</span>
                    <span className="text-[9px] font-bold text-black uppercase tracking-wider font-sans">Foundation & Diploma Batches available • Study now from UI</span>
                 </div>

                 <div className="flex justify-between items-center pt-6 border-t border-gray-200 screen-only">
                    <span className="text-[9px] text-gray-400 font-sans uppercase tracking-wider">Generated on {new Date().toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-black font-sans uppercase tracking-wider">Calculated by UI Calculator</span>
                 </div>

             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CGPACalculator;
