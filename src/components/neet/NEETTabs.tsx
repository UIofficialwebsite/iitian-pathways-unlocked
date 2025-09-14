
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import NEETNotesTab from "./NEETNotesTab";
import NEETPYQTab from "@/components/NEETPYQTab";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";

const NEETTabs = () => {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <NEETNotesTab />
          </TabsContent>

          <TabsContent value="pyqs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Previous Year Questions</h2>
            </div>
            <OptimizedAuthWrapper>
              <NEETPYQTab />
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
