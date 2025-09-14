
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import NEETNotesTab from "./NEETNotesTab";
import NEETPYQTab from "@/components/NEETPYQTab";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";

const NEETTabs = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "notes");

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "Previous Year Papers" },
    { id: "study-groups", label: "Study Groups" },
    { id: "news-updates", label: "News & Updates" },
    { id: "important-dates", label: "Important Dates" },
  ];

  // Update URL when tab changes
  useEffect(() => {
    if (tab !== activeTab) {
      if (activeTab === "notes") {
        navigate("/exam-preparation/neet", { replace: true });
      } else {
        navigate(`/exam-preparation/neet/${activeTab}`, { replace: true });
      }
    }
  }, [activeTab, tab, navigate]);

  // Update activeTab when URL changes
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <AnimatedTabs
            tabs={tabs}
            defaultTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="mt-6 md:mt-8">
          {activeTab === "notes" && (
            <NEETNotesTab />
          )}

          {activeTab === "pyqs" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Previous Year Questions</h2>
              </div>
              <OptimizedAuthWrapper>
                <NEETPYQTab />
              </OptimizedAuthWrapper>
            </div>
          )}

          {activeTab === "study-groups" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Study Groups</h2>
              </div>
              <OptimizedAuthWrapper>
                <StudyGroupsTab examType="NEET" />
              </OptimizedAuthWrapper>
            </div>
          )}
          
          {activeTab === "news-updates" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">News & Updates</h2>
              </div>
              <NewsUpdatesTab examType="NEET" />
            </div>
          )}

          {activeTab === "important-dates" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Important Dates</h2>
              </div>
              <ImportantDatesTab examType="NEET" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NEETTabs;
