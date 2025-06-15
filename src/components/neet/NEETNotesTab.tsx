
import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectBlock from "@/components/SubjectBlock";
import { useBackend } from "@/components/BackendIntegratedWrapper";

const NEETNotesTab = () => {
  const { notes, contentLoading } = useBackend();
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [activeClass, setActiveClass] = useState("class11");

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
    if (!contentLoading && subjects.length > 0 && !subjects.includes(activeSubject)) {
      setActiveSubject(subjects[0]);
    }
  }, [contentLoading, subjects, activeSubject]);


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
        <Tabs value={activeSubject} onValueChange={setActiveSubject}>
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
        <Tabs value={activeClass} onValueChange={setActiveClass}>
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
