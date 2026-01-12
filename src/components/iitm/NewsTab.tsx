
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";

interface NewsTabProps {
  sortOrder?: 'recent' | 'oldest';
}

const NewsTab = ({ sortOrder = 'recent' }: NewsTabProps) => {
  const { newsUpdates, contentLoading } = useBackend();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  // Filter news for IITM BS and sort
  const iitmNews = newsUpdates
    .filter(news => 
      news.exam_type === 'IITM_BS' || news.exam_type === 'IITM BS' || !news.exam_type
    )
    .sort((a, b) => {
      const dateA = new Date(a.date_time || a.created_at).getTime();
      const dateB = new Date(b.date_time || b.created_at).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (contentLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {iitmNews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No news updates available for IITM BS at the moment.</p>
        </div>
      ) : (
        iitmNews.map((newsItem) => (
          <Card key={newsItem.id}>
            <Collapsible onOpenChange={() => toggleExpanded(newsItem.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                      {newsItem.title}
                      {newsItem.tag && <Badge variant="secondary">{newsItem.tag}</Badge>}
                      {newsItem.branch && <Badge variant="outline">{newsItem.branch}</Badge>}
                      {newsItem.level && <Badge variant="outline">{newsItem.level}</Badge>}
                      {newsItem.is_featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                      {newsItem.is_important && <Badge className="bg-red-500 text-white">Important</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {newsItem.description}
                      {newsItem.date_time && (
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(newsItem.date_time).toLocaleString()}
                        </span>
                      )}
                    </CardDescription>
                    {newsItem.button_text && newsItem.button_url && (
                      <div className="mt-3">
                        <Button 
                          asChild 
                          className="bg-royal hover:bg-royal-dark text-white"
                          size="sm"
                        >
                          <a 
                            href={newsItem.button_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            {newsItem.button_text}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {expandedItems.has(newsItem.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <span className="sr-only">Toggle content</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {newsItem.content}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))
      )}
    </div>
  );
};

export default NewsTab;
