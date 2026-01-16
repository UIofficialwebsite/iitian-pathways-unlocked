import React from "react";
import { Loader2 } from "lucide-react";

const ImportantDatesTab = () => {
  // Hardcoded data extracted from "BS-DS_Jan 2026 Grading document (STUDENT).pdf" and "Sep 2025 ES Grading document.pdf"
  const importantDates = [
    {
      id: 1,
      title: "Jan 2026 Term Start",
      date: "2026-02-06",
      description: "Official start date for the Jan 2026 Term. Content release for Week 1 starts.",
      type: "Academic",
      is_important: true,
    },
    {
      id: 2,
      title: "Quiz 1 (Jan 2026 Term)",
      date: "2026-03-15",
      description: "In-person quiz at designated centers. Time: 2:00 PM - 6:00 PM. Syllabus: Weeks 1-4.",
      type: "Exam",
      is_important: true,
    },
    {
      id: 3,
      title: "OPPE 1 - Day 1",
      date: "2026-04-04",
      description: "Online Proctored Programming Exam. Courses: Diploma (Python, MLP), Degree (C Prog, Intro to Big Data).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 4,
      title: "OPPE 1 - Day 2",
      date: "2026-04-05",
      description: "Online Proctored Programming Exam. Courses: Foundation (Python), Diploma (Java, MLOPS), TDS (ROE).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 5,
      title: "Quiz 2 (Jan 2026 Term)",
      date: "2026-04-12",
      description: "In-person quiz at designated centers. Time: 2:00 PM - 6:00 PM. Syllabus: Weeks 5-8.",
      type: "Exam",
      is_important: true,
    },
    {
      id: 6,
      title: "OPPE 2 - Day 1",
      date: "2026-04-25",
      description: "Online Proctored Programming Exam. Courses: Diploma (System Commands).",
      type: "OPPE",
      is_important: false,
    },
    {
      id: 7,
      title: "OPPE 2 - Day 2",
      date: "2026-04-26",
      description: "Online Proctored Programming Exam. Courses: Diploma (DBMS, PDSA, Java, MLP), Degree (C Prog, Intro to Big Data).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 8,
      title: "OPPE 2 - Day 3",
      date: "2026-05-02",
      description: "Online Proctored Programming Exam. Courses: Diploma (System Commands, Python).",
      type: "OPPE",
      is_important: false,
    },
    {
      id: 9,
      title: "OPPE 2 - Day 4",
      date: "2026-05-03",
      description: "Online Proctored Programming Exam. Courses: Foundation (Python), Diploma (Exceptions), Degree (MLOPS).",
      type: "OPPE",
      is_important: true,
    },
    {
      id: 10,
      title: "End Term Exam (Jan 2026 Term)",
      date: "2026-05-10",
      description: "Final End Term Examination held in-person at designated centers. Sessions: 9am-12pm & 2pm-5pm.",
      type: "Exam",
      is_important: true,
    },
    {
      id: 11,
      title: "NPPE 1 Opens",
      date: "2026-03-06",
      description: "National Programming Proctored Exam (NPPE) 1 portal opens at 5:00 PM.",
      type: "Deadline",
      is_important: false,
    },
  ];

  // Sort by date (ascending) to show upcoming events first
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
                            Mandatory In-Person
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
