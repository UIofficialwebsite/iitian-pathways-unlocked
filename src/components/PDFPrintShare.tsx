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
  headerId?: string; // Optional: ID of a header to show ONLY in the PDF
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

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error("Content to print not found.");
        setIsGenerating(false);
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2, // Better resolution
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          if (headerId) {
            const clonedHeader = clonedDoc.getElementById(headerId);
            if (clonedHeader) {
              // Make the header visible in the PDF (clone) only
              clonedHeader.classList.remove('hidden');
              clonedHeader.classList.add('flex');
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 Page Dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit A4 width
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position -= pdfHeight; // Move the image up for the next page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

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
