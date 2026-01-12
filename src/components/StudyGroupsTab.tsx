
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  invite_link: string;
  group_type: string;
  exam_type: string;
  subjects: string[];
  class_level: string;
}

interface StudyGroupsTabProps {
  examType: 'JEE' | 'NEET' | 'IITM_BS';
  sortOrder?: 'recent' | 'oldest';
}

const StudyGroupsTab = ({ examType, sortOrder = 'recent' }: StudyGroupsTabProps) => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudyGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .select('*')
          .eq('exam_type', examType)
          .order('created_at', { ascending: sortOrder === 'oldest' });

        if (error) throw error;
        setStudyGroups(data || []);
      } catch (error: any) {
        setError("Failed to fetch study groups. Please try again later.");
        console.error("Error fetching study groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyGroups();
  }, [examType, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {studyGroups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No study groups available for {examType} at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studyGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {group.name}
                    </CardTitle>
                    <CardDescription>
                      {group.group_type} group
                    </CardDescription>
                  </div>
                   {group.invite_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={group.invite_link} target="_blank" rel="noopener noreferrer">
                        Join <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {group.subjects && group.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {group.subjects.map(subject => (
                        <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                )}
                 {group.class_level && <div className="text-sm text-gray-500 mt-2">Class: {group.class_level}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyGroupsTab;
