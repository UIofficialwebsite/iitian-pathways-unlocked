import React from "react";

const ImportantDatesTab = () => {
  // Data extracted from "BS-DS_Jan 2026 Grading document (STUDENT).pdf" (hh.pdf) 
  const importantDates = [
    {
      id: 1,
      title: "Term Start & Week 1 Content Release",
      date: "2026-02-06",
      description: "Official start of the Jan 2026 Term. Content for Week 1 is released.",
      type: "Academic",
      is_important: true,
    },
    {
      id: 2,
      title: "NPPE 1 Registration Opens",
      date: "2026-03-06",
      description: "Registration portal opens for Network Proctored Program Evaluation (NPPE) 1 at 5:00 PM.",
      type: "Registration",
      is_important: true,
    },
    {
      id: 3,
      title: "OPPE 1 Eligibility Closes",
      date: "2026-03-08",
      description: "Deadline to meet eligibility criteria for OPPE 1 (based on Week 1-4 assignments).",
      type: "Deadline",
      is_important: true,
    },
    {
      id: 4,
      title: "Quiz 1 (Jan 2026 Term)",
      date: "2026-03-15",
      description: "In-person quiz at designated centers. Syllabus: Weeks 1-4. Time: 2:00 PM - 6:00 PM.",
      type: "Exam",
      is_important: true,
    },
    {
      id: 5,
      title: "Qualifier 1-2 Re-attempt Registration Opens",
      date: "2026-03-19",
      description: "Application form opens for students re-attempting the Qualifier Exam (1-2 attempt).",
      type: "Registration",
      is_important: false,
    },
    {
      id: 6,
      title: "Qualifier 1-2 Re-attempt Registration Closes",
      date: "2026-03-20",
      description: "Deadline to apply for the Qualifier Re-attempt exam. Late applications are usually not accepted.",
      type: "Deadline",
      is_important: false,
    },
    {
      id: 7,
      title: "OPPE 1 - Day 1",
      date: "2026-04-04",
      description: "Online Proctored Programming Exam. Courses: Diploma (Python, MLP), Degree (C Prog, Intro to Big Data).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 8,
      title: "OPPE 1 - Day 2",
      date: "2026-04-05",
      description: "Online Proctored Programming Exam. Courses: Foundation (Python), Diploma (Java, MLOPS), TDS (ROE).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 9,
      title: "End Term & OPPE 2 Eligibility Closes",
      date: "2026-04-08",
      description: "Strict deadline to meet eligibility for End Term Exams and OPPE 2 (Week 9 Assignment Deadline).",
      type: "Deadline",
      is_important: true,
    },
    {
      id: 10,
      title: "Quiz 2 & Qualifier Re-attempt (1-2)",
      date: "2026-04-12",
      description: "Quiz 2 for current students and Qualifier Re-attempt Exam (1-2) for re-applicants. In-person.",
      type: "Exam",
      is_important: true,
    },
    {
      id: 11,
      title: "Qualifier 2-2 Re-attempt Registration Opens",
      date: "2026-04-16",
      description: "Application form opens for the second re-attempt (2-2) of the Qualifier Exam.",
      type: "Registration",
      is_important: false,
    },
    {
      id: 12,
      title: "Qualifier 2-2 Re-attempt Registration Closes",
      date: "2026-04-17",
      description: "Strict deadline to register for the final re-attempt opportunity for this cycle.",
      type: "Deadline",
      is_important: false,
    },
    {
      id: 13,
      title: "OPPE 2 - Day 1",
      date: "2026-04-25",
      description: "Online Proctored Programming Exam. Courses: Diploma (System Commands).",
      type: "OPPE",
      is_important: false,
    },
    {
      id: 14,
      title: "OPPE 2 - Day 2",
      date: "2026-04-26",
      description: "Online Proctored Programming Exam. Courses: Diploma (DBMS, PDSA, Java, MLP), Degree (C Prog, Intro to Big Data).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 15,
      title: "OPPE 2 - Day 3",
      date: "2026-05-02",
      description: "Online Proctored Programming Exam. Courses: Diploma (System Commands, Python).",
      type: "OPPE",
      is_important: false,
    },
    {
      id: 16,
      title: "OPPE 2 - Day 4",
      date: "2026-05-03",
      description: "Online Proctored Programming Exam. Courses: Foundation (Python), Diploma (Exceptions), Degree (MLOPS).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 17,
      title: "End Term Exam & Qualifier (2-2)",
      date: "2026-05-10",
      description: "Final End Term Exam for all levels and Qualifier Re-attempt Exam (2-2). In-person at centers.",
      type: "Exam",
      is_important: true,
    },
  ];

  // Sort by date (ascending)
  const sortedDates = importantDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full font-['Inter'] bg-white">
      <h2 className="text-[14px] font-semibold text-black uppercase tracking-[0.05em] mb-5">
        Important Dates & Deadlines (Jan 2026 Term)
      </h2>

      <div className="overflow-x-auto border border-black rounded-none">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#e6f7f7]">
              <th className="border-b border-r border-black px-5 py-4 text-left font-bold text-[11px] uppercase tracking-[0.05em] text-[#2c4a4a] w-[20%]">
                Date
              </th>
              <th className="border-b border-black px-5 py-4 text-left font-bold text-[11px] uppercase tracking-[0.05em] text-[#2c4a4a] w-[80%]">
                Event Details
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-black last:border-b-0">
                {/* Date Column */}
                <td className="border-r border-black p-5 align-top bg-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[24px] font-bold text-black leading-none">
                      {new Date(item.date).getDate()}
                    </span>
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                      {new Date(item.date).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase mt-1">
                      {new Date(item.date).toLocaleDateString("en-US", { weekday: 'long' })}
                    </span>
                  </div>
                </td>
                
                {/* Details Column */}
                <td className="p-5 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-[16px] font-bold text-black leading-tight">
                        {item.title}
                      </h3>
                      {/* Type Badge */}
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                        item.type === 'Exam' ? 'border-[#991b1b] bg-[#fef2f2] text-[#991b1b]' :
                        item.type === 'OPPE' ? 'border-[#854d0e] bg-[#fefce8] text-[#854d0e]' :
                        item.type === 'Registration' ? 'border-[#166534] bg-[#f0fdf4] text-[#166534]' :
                        item.type === 'Deadline' ? 'border-[#b91c1c] bg-[#fff1f2] text-[#b91c1c]' :
                        'border-black bg-white text-black'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-[#4b5563] leading-[1.5]">
                      {item.description}
                    </p>

                    {item.is_important && (
                      <div className="mt-1">
                         <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-black text-white">
                            {item.type === 'Deadline' ? 'Strict Deadline' : 'Important'}
                         </span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportantDatesTab;

