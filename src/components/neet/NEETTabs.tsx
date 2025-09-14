
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import NEETNotesTab from "./NEETNotesTab";
import NEETPYQTab from "@/components/NEETPYQTab";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";
import { buildExamUrl, getTabFromUrl, getParamsFromUrl } from "@/utils/urlHelpers";

interface NEETTabsProps {
  navigate: any;
  location: any;
}

const NEETTabs = ({ navigate, location }: NEETTabsProps) => {
  // Initialize state from URL
  const initialTab = getTabFromUrl(location.pathname);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when filters change
  const updateUrl = (tab: string, subject?: string, classLevel?: string, year?: string, session?: string) => {
    const params: Record<string, string | undefined> = {};
    
    if (tab === 'notes' || tab === 'syllabus') {
      if (subject) params.subject = subject;
      if (classLevel) params.class = classLevel;
    } else if (tab === 'pyqs') {
      if (subject) params.subject = subject;
      if (classLevel) params.class = classLevel;
      if (year) params.year = year;
      if (session) params.session = session;
    }
    
    const newUrl = buildExamUrl('neet', tab, params);
    navigate(newUrl, { replace: true });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    updateUrl(newTab);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full min-w-fit">
              <TabsTrigger value="notes" className="rounded-md flex-shrink-0">
                Notes
              </TabsTrigger>
              <TabsTrigger value="pyqs" className="rounded-md flex-shrink-0">
                Previous Year Papers
              </TabsTrigger>
              <TabsTrigger value="study-groups" className="rounded-md flex-shrink-0">
                Study Groups
              </TabsTrigger>
              <TabsTrigger value="news-updates" className="rounded-md flex-shrink-0">
                News & Updates
              </TabsTrigger>
              <TabsTrigger value="important-dates" className="rounded-md flex-shrink-0">
                Important Dates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notes">
            <NEETNotesTab onFilterChange={updateUrl} />
          </TabsContent>

          <TabsContent value="pyqs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Previous Year Questions</h2>
            </div>
            <OptimizedAuthWrapper>
              <NEETPYQTab onFilterChange={updateUrl} />
            </OptimizedAuthWrapper>
          </TabsContent>

          <TabsContent value="study-groups">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Study Groups</h2>
            </div>
            <OptimizedAuthWrapper>
                <StudyGroupsTab examType="NEET" />
            </OptimizedAuthWrapper>
          </TabsContent>
          
          <TabsContent value="news-updates">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">News & Updates</h2>
            </div>
            <NewsUpdatesTab examType="NEET" />
          </TabsContent>

          <TabsContent value="important-dates">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Important Dates</h2>
            </div>
            <ImportantDatesTab examType="NEET" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NEETTabs;
