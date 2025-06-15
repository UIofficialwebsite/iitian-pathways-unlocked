
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { ShimmerButton } from './ui/shimmer-button';

interface Chapter {
    id: string;
    title: string;
    description?: string;
    file_link?: string;
    download_count?: number;
    content_url?: string | null;
}

interface ChapterListProps {
    chapters: Chapter[];
    downloadCounts: Record<string, number>;
    onDownload: (noteId: string, fileUrl?: string) => Promise<void>;
}

const ChapterList: React.FC<ChapterListProps> = ({ chapters, downloadCounts, onDownload }) => {
    return (
        <div className="space-y-4">
            <ul className="space-y-3">
                {chapters.map((chapter) => (
                    <li key={chapter.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="text-md font-semibold text-gray-900">{chapter.title}</h3>
                            {chapter.description && <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                            <div className="flex items-center text-sm text-gray-600">
                                <Download className="h-4 w-4 mr-1.5" />
                                <span>{downloadCounts[chapter.id] || chapter.download_count || 0}</span>
                            </div>
                            {chapter.content_url && (
                                <Button
                                    onClick={() => window.open(chapter.content_url!, '_blank')}
                                    variant="outline"
                                    size="sm"
                                    title="Preview notes"
                                >
                                    <Eye className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">Preview</span>
                                </Button>
                            )}
                            <ShimmerButton
                                onClick={() => onDownload(chapter.id, chapter.file_link || undefined)}
                                disabled={!chapter.file_link}
                                title={!chapter.file_link ? "No file available for download" : "Download file"}
                                background={chapter.file_link ? "rgba(26, 86, 219, 0.8)" : "rgba(107, 114, 128, 0.5)"}
                                borderRadius="var(--radius)"
                                className={`px-3 h-9 ${!chapter.file_link ? "cursor-not-allowed opacity-70" : ""}`}
                            >
                                <span className="flex items-center text-white">
                                    <Download className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">Download</span>
                                </span>
                            </ShimmerButton>
                        </div>
                    </li>
                ))}
            </ul>
            {chapters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No chapters available for this selection. Please try a different subject or class.
                </div>
            )}
        </div>
    );
};

export default ChapterList;
