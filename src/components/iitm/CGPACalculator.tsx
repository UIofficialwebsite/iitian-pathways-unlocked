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
    { value: "4", label: "U (4)", point: 0 }, // Assuming U is 0 points for GPA calculation in some contexts, or 4 if passing? IITM U is typically Fail/0 credit. Sticking to user input value 4 for calculation safety if passed.
  ];

  // Helper to get grade point
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
    
    // IITM Weighted Formula: (PastCGPA * PastCredits + SemPoints) / (PastCredits + SemCredits)
    const totalSemPoints = semPoints; // Already calculated
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
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "CGPA_Report",
  });

  // --- Donut Chart Gradient Generator ---
  const getConicGradient = () => {
    const total = courses.length;
    if (total === 0) return "conic-gradient(#e5e7eb 0deg 360deg)";

    const colors = {
      S: "#000000",   // Black
      A: "#374151",   // Dark Grey
      B: "#9ca3af",   // Grey
      C: "#d1d5db",   // Light Grey
      Others: "#f3f4f6" // Lightest
    };

    let currentDeg = 0;
    const segments = [];

    // Order: S, A, B, C, Others
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
    
    // Gap filler
    if (segments.length > 1) {
        // Add white separators manually or CSS handles it? CSS approach in prompt used specific stops.
        // We will stick to simple segments for React dynamic styling.
    }

    return `conic-gradient(${segments.join(", ")})`;
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans p-4 md:p-8" ref={componentRef}>
      
      {/* Header */}
      <header className="text-center mb-10 border-b-2 border-black pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">CGPA Calculator</h1>
        <p className="text-gray-500 mt-2 font-medium">Plan your semester grades and track your performance</p>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Section 1: Current Status */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">Step 1</span>
              <h3 className="text-lg font-bold uppercase tracking-wide">Where you are now</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="space-y-2">
                <Label htmlFor="current-cgpa" className="font-bold text-gray-700">Current CGPA</Label>
                <Input
                  id="current-cgpa"
                  type="number"
                  placeholder="0.00"
                  value={currentCGPA}
                  onChange={(e) => setCurrentCGPA(e.target.value)}
                  className="bg-white border-gray-200 focus:border-black focus:ring-0 h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits-completed" className="font-bold text-gray-700">Credits Earned</Label>
                <Input
                  id="credits-completed"
                  type="number"
                  placeholder="0"
                  value={creditsCompleted}
                  onChange={(e) => setCreditsCompleted(e.target.value)}
                  className="bg-white border-gray-200 focus:border-black focus:ring-0 h-12 text-lg"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Course List */}
          <section>
             <div className="flex items-center gap-2 mb-4">
              <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">Step 2</span>
              <h3 className="text-lg font-bold uppercase tracking-wide">Add Semester Courses</h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
              {courses.map((course, index) => (
                <div key={course.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded shadow-sm border border-gray-200 animate-in slide-in-from-left-2 duration-300">
                  <div className="flex-grow w-full md:w-auto">
                    <Input
                      placeholder="Course Name"
                      value={course.name}
                      onChange={(e) => updateCourse(index, "name", e.target.value)}
                      className="border-transparent hover:border-gray-200 focus:border-black focus:ring-0 font-medium"
                    />
                  </div>
                  <div className="w-full md:w-24">
                     <Input
                      type="number"
                      placeholder="Credits"
                      value={course.credits}
                      onChange={(e) => updateCourse(index, "credits", e.target.value)}
                      className="border-transparent hover:border-gray-200 focus:border-black focus:ring-0 text-center"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <Select value={course.grade} onValueChange={(val) => updateCourse(index, "grade", val as Grade)}>
                      <SelectTrigger className="border-transparent hover:border-gray-200 focus:border-black focus:ring-0 bg-gray-50">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCourse(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                    disabled={courses.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button onClick={addCourse} variant="outline" className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-black hover:border-black hover:bg-white mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Another Course
              </Button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ANALYSIS / RESULTS */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-8">
            
            {/* 1. Score Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black text-white p-6 rounded-lg text-center shadow-xl">
                 <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">This Semester</h4>
                 <div className="text-5xl font-black tracking-tight">{semesterGPA.toFixed(2)}</div>
                 <p className="text-xs mt-2 opacity-50">GPA</p>
               </div>
               <div className="bg-white border-2 border-black text-black p-6 rounded-lg text-center shadow-sm">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Overall</h4>
                 <div className="text-5xl font-black tracking-tight">{cumulativeCGPA.toFixed(2)}</div>
                 <p className="text-xs mt-2 text-gray-400">CGPA</p>
               </div>
            </div>

            {/* 2. Visual Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-center mb-6 text-gray-500 tracking-wider">Grade Breakdown</h3>
              
              <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div 
                  className="w-48 h-48 rounded-full relative flex items-center justify-center shadow-inner"
                  style={{ background: getConicGradient() }}
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-400">DIST</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-xs font-medium">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black rounded-sm"></div> S ({gradeDistribution.S || 0})</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-700 rounded-sm"></div> A ({gradeDistribution.A || 0})</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-sm"></div> B ({gradeDistribution.B || 0})</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> C ({gradeDistribution.C || 0})</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 rounded-sm"></div> Other ({gradeDistribution.Others || 0})</div>
                </div>
              </div>
            </div>

            {/* 3. Summary Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
               <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Course Summary</h3>
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">{totalCredits} Cr</span>
               </div>
               <div className="max-h-60 overflow-y-auto">
                 <table className="w-full text-sm">
                   <thead className="bg-white sticky top-0">
                     <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                       <th className="pl-4 py-2 font-medium">Course</th>
                       <th className="py-2 font-medium">Cr</th>
                       <th className="pr-4 py-2 text-right font-medium">Gr</th>
                     </tr>
                   </thead>
                   <tbody>
                     {courses.map((c) => (
                       <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                         <td className="pl-4 py-3 font-medium text-gray-800 truncate max-w-[120px]">{c.name}</td>
                         <td className="py-3 text-gray-500">{c.credits}</td>
                         <td className="pr-4 py-3 text-right font-bold">{gradeOptions.find(g => g.value === c.grade)?.label.split(' ')[0]}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handlePrint} variant="default" className="w-full bg-black hover:bg-gray-800 text-white font-bold h-12 uppercase text-xs tracking-wider">
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full border-gray-300 text-gray-500 hover:text-black hover:border-black font-bold h-12 uppercase text-xs tracking-wider">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;
