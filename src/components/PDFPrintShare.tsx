import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from "sonner";

interface PDFPrintShareProps {
  targetId: string;
  fileName?: string;
  shareTitle?: string;
  shareText?: string;
  headerId?: string; // Optional: ID of a header to temporarily show during capture
  buttonLabel?: string;
  className?: string;
}

const PDFPrintShare: React.FC<PDFPrintShareProps> = ({
  targetId,
  fileName = "document.pdf",
  shareTitle = "Share PDF",
  shareText = "Here is the shared PDF document.",
  headerId,
  buttonLabel = "Share / Download PDF",
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    setIsGenerating(true);
    
    // Temporarily make the print header visible for capture if ID is provided
    const printHeader = headerId ? document.getElementById(headerId) : null;
    if (printHeader) {
      printHeader.classList.remove('hidden');
      printHeader.classList.add('flex');
    }

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error("Content to print not found.");
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2, // Better resolution
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: "application/pdf" });

      // Check if Web Share API supports file sharing (mostly mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
      } else {
        // Fallback for desktop: Download the file
        pdf.save(fileName);
        toast.success("PDF downloaded (Share not supported on this device)");
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate/share PDF.");
    } finally {
      setIsGenerating(false);
      // Re-hide the print header
      if (printHeader) {
        printHeader.classList.add('hidden');
        printHeader.classList.remove('flex');
      }
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShare}
      disabled={isGenerating}
      className={`flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5 ${className}`}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {isGenerating ? "Generating..." : buttonLabel}
    </Button>
  );
};

export default PDFPrintShare;
