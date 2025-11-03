
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShareButton } from "../ShareButton";

const CommunitiesTab = () => {
  const { communities, contentLoading } = useBackend();

  // Filter communities for IITM BS
  const iitmCommunities = communities.filter(community => 
    community.exam_type === 'IITM_BS' || community.exam_type === 'IITM BS' || !community.exam_type
  );

  // Function to get button style based on group type
  const getButtonStyle = (groupType: string) => {
    if (groupType?.toLowerCase().includes('telegram')) {
      return "bg-sky-400 hover:bg-sky-500 text-white"; // Light blue for Telegram
    } else if (groupType?.toLowerCase().includes('whatsapp')) {
      return "bg-green-400 hover:bg-green-500 text-white"; // Light green for WhatsApp
    }
    return "bg-royal hover:bg-royal-dark text-white"; // Default
  };

  if (contentLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {iitmCommunities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No communities available for IITM BS at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {iitmCommunities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {community.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {community.group_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {community.branch && (
                      <Badge variant="secondary">{community.branch}</Badge>
                    )}
                    {community.level && (
                      <Badge variant="secondary">{community.level}</Badge>
                    )}
                    {community.subject && (
                      <Badge variant="outline">{community.subject}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      className={`flex-1 ${getButtonStyle(community.group_type)}`}
                    >
                      <a 
                        href={community.group_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Join {community.group_type}
                      </a>
                    </Button>
                    <ShareButton
                      url={`${window.location.origin}/communities/${community.id}`}
                      title={community.name}
                      description={community.description || `Join ${community.name} community`}
                      size="icon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunitiesTab;
