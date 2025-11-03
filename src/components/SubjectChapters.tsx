
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { ShareButton } from "./ShareButton";

interface Chapter {
  id: string;
  title: string;
  description: string;
}

interface SubjectChaptersProps {
  chapters: {
    class11: Chapter[];
    class12: Chapter[];
  };
  downloads: Record<string, number>;
  onDownload: (id: string) => void;
}

const SubjectChapters = ({ chapters, downloads, onDownload }: SubjectChaptersProps) => {
  const [activeClass, setActiveClass] = useState<"class11" | "class12">("class11");

  return (
    <div className="mt-4">
      <Tabs defaultValue="class11" onValueChange={(value) => setActiveClass(value as "class11" | "class12")}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="class11">Class 11</TabsTrigger>
          <TabsTrigger value="class12">Class 12</TabsTrigger>
        </TabsList>

        {["class11", "class12"].map((classLevel) => (
          <TabsContent key={classLevel} value={classLevel}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters[classLevel as "class11" | "class12"].map((chapter) => (
                <Card key={chapter.id} className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        Class {classLevel === "class11" ? "11" : "12"}
                      </Badge>
                    </div>
                    <CardDescription>{chapter.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <Button
                      onClick={() => onDownload(chapter.id)}
                      className="bg-royal hover:bg-royal-dark text-white"
                    >
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                    <ShareButton
                      url={`${window.location.origin}/notes/${chapter.id}`}
                      title={chapter.title}
                      description={chapter.description}
                      size="sm"
                    />
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">{downloads[chapter.id] || 0}</span>
                      <div className="ml-2 bg-gray-200 h-1.5 w-16 rounded-full overflow-hidden">
                        <div 
                          className="bg-royal h-full rounded-full" 
                          style={{ width: `${Math.min(100, ((downloads[chapter.id] || 0) / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SubjectChapters;
