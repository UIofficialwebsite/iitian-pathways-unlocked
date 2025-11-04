
import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectBlock from "@/components/SubjectBlock";
import { useBackend } from "@/components/BackendIntegratedWrapper";

interface NEETNotesTabProps {
  onFilterChange?: (tab: string, subject?: string, classLevel?: string) => void;
  initialParams?: string[];
}

const NEETNotesTab = ({ onFilterChange, initialParams }: NEETNotesTabProps) => {
  const { notes, contentLoading } = useBackend();
  
  // Parse initialParams: [0] = subject, [1] = class
  // Note: params come unslugified as "Physics", "Class12" but we need "physics", "class12"
  const urlSubject = initialParams?.[0];
  const urlClass = initialParams?.[1]?.toLowerCase(); // Convert "Class12" to "class12"
  
  const [activeSubject, setActiveSubject] = useState(urlSubject || "Physics");
  const [activeClass, setActiveClass] = useState(urlClass || "class11");

  const neetNotes = useMemo(() => notes.filter(note => note.exam_type === 'NEET'), [notes]);

  const subjects = useMemo(() => {
    const preferredOrder = ["Physics", "Botany", "Zoology", "Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"];
    const subjectSet = new Set(neetNotes.map(note => note.subject).filter(Boolean) as string[]);
    
    const sortedSubjects = preferredOrder.filter(s => subjectSet.has(s));
    
    Array.from(subjectSet).forEach(s => {
        if (!sortedSubjects.includes(s)) {
            sortedSubjects.push(s);
        }
    });
    
    return sortedSubjects;
  }, [neetNotes]);
  
  useEffect(() => {
    if (!contentLoading && subjects.length > 0) {
      // Match URL subject with available subjects (case-insensitive)
      let newSubject = activeSubject;
      
      // If URL has a subject, try to match it
      if (urlSubject) {
        const matched = subjects.find(s => s.toLowerCase() === urlSubject.toLowerCase());
        if (matched && matched !== activeSubject) {
          newSubject = matched;
          setActiveSubject(matched);
        }
      }
      
      // If current subject is not in available subjects, use first one
      if (!subjects.some(s => s.toLowerCase() === newSubject.toLowerCase())) {
        newSubject = subjects[0];
        setActiveSubject(newSubject);
      }
      
      // Update URL if subject changed
      if (newSubject !== activeSubject) {
        onFilterChange?.('notes', newSubject, activeClass);
      }
    }
  }, [contentLoading, subjects, urlSubject]);

  // Handle subject changes
  const handleSubjectChange = (newSubject: string) => {
    setActiveSubject(newSubject);
    onFilterChange?.('notes', newSubject, activeClass);
  };

  // Handle class changes
  const handleClassChange = (newClass: string) => {
    setActiveClass(newClass);
    onFilterChange?.('notes', activeSubject, newClass);
  };


  const classes = [
    { value: "class11", label: "Class 11" },
    { value: "class12", label: "Class 12" }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Subject-wise Notes</h2>
      </div>

      {/* Subject Filter Tabs */}
      <div className="mb-6">
        <Tabs value={activeSubject} onValueChange={handleSubjectChange}>
          <div className="overflow-x-auto pb-2">
            {contentLoading && subjects.length === 0 ? (
               <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
               </div>
            ) : (
              <TabsList className="w-full min-w-fit">
                {subjects.map((subject) => (
                  <TabsTrigger key={subject} value={subject} className="rounded-md flex-shrink-0">
                    {subject}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
          </div>
        </Tabs>
      </div>

      <div className="mb-6">
        <Tabs value={activeClass} onValueChange={handleClassChange}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full min-w-fit">
              {classes.map((classItem) => (
                <TabsTrigger key={classItem.value} value={classItem.value} className="rounded-md flex-shrink-0">
                  {classItem.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
      
      <SubjectBlock 
        subject={activeSubject} 
        selectedClass={activeClass}
        examType="NEET"
      />
    </>
  );
};

export default NEETNotesTab;
