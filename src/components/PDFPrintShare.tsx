import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Link } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PDFPrintShareProps {
  targetId: string;
  fileName?: string;
  shareTitle?: string;
  shareText?: string;
  headerId?: string; 
  buttonLabel?: string;
  className?: string;
}

const PDFPrintShare: React.FC<PDFPrintShareProps> = ({
  targetId,
  fileName = "document.pdf",
  shareTitle = "Share PDF",
  shareText = "Here is the shared PDF document.",
  headerId,
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useIsMobile(); 

  const handleShare = async () => {
    // --- DESKTOP BEHAVIOR: Share Link Only ---
    if (!isMobile) {
      const url = window.location.href;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: url,
          });
        } catch (err) {
           console.log("Share cancelled or not supported");
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        } catch (err) {
          toast.error("Failed to copy link.");
        }
      }
      return;
    }

    // --- MOBILE BEHAVIOR: Share PDF File ---
    setIsGenerating(true);

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error("Content to print not found.");
        setIsGenerating(false);
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          if (headerId) {
            const clonedHeader = clonedDoc.getElementById(headerId);
            if (clonedHeader) {
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

      // Add pages
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: "application/pdf" });

      // Share the file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText,
          });
        } catch (shareError) {
          // If share fails (e.g. timeout due to long generation time), fallback to download
          console.warn("Share API failed or timed out, falling back to download:", shareError);
          pdf.save(fileName);
          toast.success("PDF downloaded (Share timed out)");
        }
      } else {
        // Fallback if file sharing isn't supported on this mobile device
        pdf.save(fileName);
        toast.success("PDF downloaded (Share not supported)");
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
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
        isMobile ? <Share2 className="w-4 h-4" /> : <Link className="w-4 h-4" />
      )}
      {isGenerating ? "Generating..." : (isMobile ? "Share PDF" : "Share Link")}
    </Button>
  );
};

export default PDFPrintShare;
