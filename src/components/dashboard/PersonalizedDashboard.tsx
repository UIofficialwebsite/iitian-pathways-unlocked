
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Calendar, Users, TrendingUp, Clock, Download, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";

interface PersonalizedDashboardProps {
  profile: any;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ profile }) => {
  const { user } = useAuth();
  const { getFilteredContent, courses, notes, pyqs, importantDates, newsUpdates, communities, handleDownload } = useBackend();

  // Get filtered content based on user profile
  const filteredContent = getFilteredContent(profile);

  // For IITM BS users, further filter by branch and level
  const getIITMFilteredContent = () => {
    if (profile?.program_type !== 'IITM_BS') return filteredContent;

    return {
      ...filteredContent,
      courses: courses.filter(course => 
        course.exam_category === 'IITM BS' && 
        course.branch === profile.branch && 
        course.level === profile.level
      ),
      notes: notes.filter(note => 
        (note.exam_type === 'IITM_BS' || note.exam_type === 'IITM BS')
      ),
      pyqs: pyqs.filter(pyq => 
        (pyq.exam_type === 'IITM_BS' || pyq.exam_type === 'IITM BS') &&
        pyq.branch === profile.branch && 
        pyq.level === profile.level
      ),
      importantDates: importantDates.filter(date => 
        (date.exam_type === 'IITM_BS' || date.exam_type === 'IITM BS') &&
        date.branch === profile.branch && 
        date.level === profile.level
      ),
      newsUpdates: newsUpdates.filter(news => 
        (news.exam_type === 'IITM_BS' || news.exam_type === 'IITM BS') &&
        news.branch === profile.branch && 
        news.level === profile.level
      ),
      communities: communities.filter(community => 
        (community.exam_type === 'IITM_BS' || community.exam_type === 'IITM BS') &&
        community.branch === profile.branch && 
        community.level === profile.level
      )
    };
  };

  const personalizedContent = getIITMFilteredContent();

  const handleDownloadClick = async (contentId: string, fileUrl?: string, type: 'notes' | 'pyqs' = 'notes') => {
    await handleDownload(contentId, type, fileUrl);
  };

  const getWelcomeMessage = () => {
    if (profile?.program_type === 'IITM_BS') {
      return `Welcome back! Here's your personalized IITM BS ${profile.branch?.replace('-', ' ')} - ${profile.level} dashboard.`;
    } else if (profile?.program_type === 'COMPETITIVE_EXAM') {
      return `Welcome back! Here's your personalized ${profile.exam_type} preparation dashboard.`;
    }
    return "Welcome back! Here's your personalized learning dashboard.";
  };

  const getProgramBadge = () => {
    if (profile?.program_type === 'IITM_BS') {
      return (
        <div className="flex gap-2">
          <Badge variant="default" className="bg-royal text-white">IITM BS</Badge>
          <Badge variant="outline">{profile.branch?.replace('-', ' ')}</Badge>
          <Badge variant="outline">{profile.level}</Badge>
        </div>
      );
    } else if (profile?.program_type === 'COMPETITIVE_EXAM') {
      return (
        <div className="flex gap-2">
          <Badge variant="default" className="bg-green-600 text-white">{profile.exam_type}</Badge>
          <Badge variant="outline">Class {profile.student_status}</Badge>
        </div>
      );
    }
    return null;
  };

  // Get upcoming important dates (next 5)
  const upcomingDates = personalizedContent.importantDates
    .filter(date => new Date(date.date_value) >= new Date())
    .sort((a, b) => new Date(a.date_value).getTime() - new Date(b.date_value).getTime())
    .slice(0, 5);

  // Get recent news (last 3)
  const recentNews = personalizedContent.newsUpdates
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-royal/10 to-royal/5 border-royal/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Hello, {profile?.full_name || user?.email}!</CardTitle>
              <CardDescription className="text-lg mt-2">
                {getWelcomeMessage()}
              </CardDescription>
            </div>
            {getProgramBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalizedContent.courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalizedContent.notes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Papers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalizedContent.pyqs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalizedContent.communities.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDates.length > 0 ? (
              <div className="space-y-3">
                {upcomingDates.map((date) => (
                  <div key={date.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{date.title}</p>
                      <p className="text-sm text-muted-foreground">{date.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(date.date_value).toLocaleDateString()}</p>
                      {date.category && <Badge variant="outline" className="text-xs">{date.category}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming dates available.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent News & Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNews.length > 0 ? (
              <div className="space-y-3">
                {recentNews.map((news) => (
                  <div key={news.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{news.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{news.description}</p>
                      </div>
                      {news.is_important && <Badge className="bg-red-500 text-white">Important</Badge>}
                    </div>
                    {news.button_text && news.button_url && (
                      <Button size="sm" variant="outline" className="mt-2" asChild>
                        <a href={news.button_url} target="_blank" rel="noopener noreferrer">
                          {news.button_text}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent news available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Study Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Notes */}
            <div>
              <h4 className="font-medium mb-3">Latest Notes</h4>
              {personalizedContent.notes.slice(0, 3).map((note) => (
                <div key={note.id} className="flex items-center justify-between p-2 border rounded mb-2">
                  <div>
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-muted-foreground">{note.subject}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadClick(note.id, note.file_link, 'notes')}
                    disabled={!note.file_link}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Recent PYQs */}
            <div>
              <h4 className="font-medium mb-3">Latest Practice Papers</h4>
              {personalizedContent.pyqs.slice(0, 3).map((pyq) => (
                <div key={pyq.id} className="flex items-center justify-between p-2 border rounded mb-2">
                  <div>
                    <p className="text-sm font-medium">{pyq.title}</p>
                    <p className="text-xs text-muted-foreground">{pyq.subject} - {pyq.year}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadClick(pyq.id, pyq.file_link, 'pyqs')}
                    disabled={!pyq.file_link}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;
