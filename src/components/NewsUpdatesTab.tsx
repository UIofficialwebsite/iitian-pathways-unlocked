
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

interface News {
  id: string;
  title: string;
  description: string;
  content: string;
  exam_type: string;
  tag: string;
  date_time: string;
  is_featured: boolean;
  is_important: boolean;
  button_text: string | null;
  button_url: string | null;
}

interface NewsUpdatesTabProps {
  examType: 'JEE' | 'NEET' | 'IITM_BS' | 'all';
  sortOrder?: 'recent' | 'oldest';
}

const NewsUpdatesTab = ({ examType, sortOrder = 'recent' }: NewsUpdatesTabProps) => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('news_updates')
          .select('*')
          .eq('is_active', true)
          .order('date_time', { ascending: sortOrder === 'oldest' });

        if (examType !== 'all') {
            query = query.or(`exam_type.eq.${examType},exam_type.is.null`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setNews(data || []);
      } catch (error: any) {
        setError("Failed to fetch news updates. Please try again later.");
        console.error("Error fetching news updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [examType, sortOrder]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

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
    <div className="space-y-4">
      {news.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No news updates available for {examType} at the moment.</p>
        </div>
      ) : (
        news.map((newsItem) => (
          <Card key={newsItem.id}>
            <Collapsible onOpenChange={() => toggleExpanded(newsItem.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                      {newsItem.title}
                      {newsItem.tag && <Badge variant="secondary">{newsItem.tag}</Badge>}
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

export default NewsUpdatesTab;
