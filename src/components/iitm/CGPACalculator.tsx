import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, RefreshCw, Briefcase, TrendingUp, ArrowRight } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useJobsManager } from "@/hooks/useJobsManager"; // Importing the actual Jobs Manager

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
      
      {/* MAIN CONTENT GRID: Inputs (Left) + Jobs Sidebar (Right) */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[500px] border-b border-gray-100">
        
        {/* LEFT COLUMN: INPUTS (8/12) */}
        <div className="lg:col-span-8 p-6 md:p-8 border-r border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-1 text-black uppercase">CGPA Calculator</h2>
            <p className="text-gray-500 text-xs font-medium">Enter your marks to get an accurate prediction.</p>
          </div>

          {/* Academic Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="current-cgpa" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Current CGPA</Label>
              <Input
                id="current-cgpa"
                type="number"
                placeholder="0.00"
                value={currentCGPA}
                onChange={(e) => setCurrentCGPA(e.target.value)}
                className="h-10 text-base bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credits-completed" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Credits Earned</Label>
              <Input
                id="credits-completed"
                type="number"
                placeholder="0"
                value={creditsCompleted}
                onChange={(e) => setCreditsCompleted(e.target.value)}
                className="h-10 text-base bg-gray-50 border-gray-200 focus:border-black focus:ring-0 rounded-sm"
              />
            </div>
          </div>

          {/* Course Inputs */}
          <div className="space-y-3">
            <div className="flex justify-between items-end pb-2 border-b border-gray-100">
               <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Semester Subjects</Label>
            </div>

            <div className="space-y-2">
              {courses.map((course, index) => (
                <div key={course.id} className="grid grid-cols-12 gap-2 items-center group">
                  <div className="col-span-6 md:col-span-7">
                    <Input
                      placeholder="Subject Name"
                      value={course.name}
                      onChange={(e) => updateCourse(index, "name", e.target.value)}
                      className="bg-transparent border-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 font-medium text-sm h-9 px-2 rounded-sm transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                      <Input
                      type="number"
                      placeholder="Cr"
                      value={course.credits}
                      onChange={(e) => updateCourse(index, "credits", e.target.value)}
                      className="text-center h-9 text-sm border-gray-200 focus:border-black focus:ring-0 rounded-sm"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                      <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-black focus:ring-0 rounded-sm bg-white">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}
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

            <div className="pt-4 flex gap-3">
               <Button onClick={addCourse} variant="outline" className="h-10 px-4 border-dashed border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 uppercase text-[10px] tracking-wider font-bold rounded-sm">
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Row
              </Button>
              <Button 
                onClick={handleCalculate} 
                className="flex-1 h-10 bg-black hover:bg-gray-800 text-white uppercase text-[11px] tracking-wider font-bold rounded-sm transition-transform active:scale-[0.99]"
              >
                Calculate Result
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE JOBS SYNC (4/12) */}
        <div className="lg:col-span-4 bg-gray-50/50 p-6 md:p-8 flex flex-col gap-6 border-l border-gray-100 h-full">
           
           {/* Header for Right Panel */}
           <div className="mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-black flex items-center gap-2">
                 <Briefcase className="w-4 h-4" /> Latest Opportunities
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Live updates from placement portal</p>
           </div>

           {/* Live Jobs List */}
           <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Recent Openings</h4>
                 <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                 {jobsLoading ? (
                    <div className="text-center py-8 text-xs text-gray-400 italic">Loading openings...</div>
                 ) : jobs.length > 0 ? (
                    jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex justify-between items-start border-b border-gray-50 last:border-0 pb-3 last:pb-0 group">
                         <div>
                            <div className="font-bold text-sm text-gray-900 group-hover:text-black transition-colors line-clamp-1">{job.title}</div>
                            <div className="text-[11px] text-gray-500">{job.company}</div>
                         </div>
                         <div className="text-[10px] font-bold text-black bg-gray-100 px-2 py-1 rounded-sm whitespace-nowrap ml-2">
                            {job.stipend || "View Details"}
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-8 text-xs text-gray-400">No active job listings found.</div>
                 )}
              </div>
              <Button variant="link" className="w-full text-[10px] text-black font-bold uppercase mt-2 h-auto p-0">
                 View All Opportunities <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
           </div>
        </div>
      </div>

      {/* BOTTOM SECTION: FULL WIDTH REPORT - Strictly Vertical Stack */}
      {showReport && (
        <div ref={reportRef} className="w-full bg-white border-t border-gray-200 animate-in fade-in duration-500">
           <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
             
             {/* Report Header */}
             <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight uppercase text-black mb-2">Performance Report</h2>
                <div className="flex justify-center gap-4 print:hidden">
                   <Button onClick={handlePrint} variant="ghost" className="h-8 text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-black hover:bg-gray-100">
                      <Download className="w-3 h-3 mr-2" /> Download PDF
                   </Button>
                   <Button onClick={handleReset} variant="ghost" className="h-8 text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-black hover:bg-gray-100">
                      <RefreshCw className="w-3 h-3 mr-2" /> Reset
                   </Button>
                </div>
             </div>

             {/* 1. KEY METRICS */}
             <div className="flex flex-col md:flex-row justify-center items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-100 border-y border-gray-100 py-8">
               <div className="flex-1 text-center px-6 py-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Semester GPA</h3>
                  <div className="text-6xl font-black text-black tracking-tighter leading-none">{semesterGPA.toFixed(2)}</div>
               </div>
               <div className="flex-1 text-center px-6 py-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Cumulative CGPA</h3>
                  <div className="text-6xl font-black text-black tracking-tighter leading-none">{cumulativeCGPA.toFixed(2)}</div>
               </div>
             </div>

             {/* 2. VISUAL ANALYSIS (Centered) */}
             <div className="flex flex-col items-center">
                 <div className="mb-6">
                    <div 
                       className="w-48 h-48 rounded-full flex items-center justify-center shadow-sm border-[4px] border-white ring-1 ring-gray-100"
                       style={{ background: getConicGradient() }}
                    >
                       <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-3xl font-black text-black leading-none">{courses.length}</span>
                          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mt-1">Subjects</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                       count > 0 && (
                          <div key={grade} className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${grade === 'S' ? 'bg-black' : 'bg-gray-400'}`}></div>
                             <span className="text-xs font-bold text-gray-600">{grade} Grade: {count}</span>
                          </div>
                       )
                    ))}
                 </div>
             </div>

             {/* 3. DETAILED TABLE */}
             <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                   <h3 className="text-xs font-black text-black uppercase tracking-wide">Transcript</h3>
                   <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-sm uppercase">{totalCredits} Credits</span>
                </div>
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Subject</th>
                         <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Cr</th>
                         <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">GP</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {courses.map((c, i) => (
                         <tr key={i} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-5 text-xs font-semibold text-gray-800">{c.name || `Subject ${i+1}`}</td>
                            <td className="py-2.5 px-5 text-xs text-gray-600 text-center">{c.credits}</td>
                            <td className="py-2.5 px-5 text-xs font-bold text-black text-right">{getPoint(c.grade)}</td>
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
