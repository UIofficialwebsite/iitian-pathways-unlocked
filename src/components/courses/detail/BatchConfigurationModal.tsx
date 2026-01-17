import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Course } from '@/components/admin/courses/types';
import { CheckCircle2, Circle, ShoppingCart, Plus, Loader2 } from 'lucide-react';
import EnrollButton from '@/components/EnrollButton';

interface BundleItemWrapper {
  linkId: string;
  isMandatory: boolean;
  sectionTitle: string;
  course: Course;
}

interface BatchConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCourse: Course;
  bundleItems: BundleItemWrapper[];
}

const BatchConfigurationModal: React.FC<BatchConfigurationModalProps> = ({
  isOpen,
  onClose,
  mainCourse,
  bundleItems
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Initialize selection: Mandatory items are always selected
  useEffect(() => {
    if (isOpen) {
      const mandatoryIds = bundleItems
        .filter(item => item.isMandatory)
        .map(item => item.course.id);
      setSelectedIds(mandatoryIds);
    }
  }, [isOpen, bundleItems]);

  const toggleSelection = (courseId: string, isMandatory: boolean) => {
    if (isMandatory) return; // Cannot uncheck mandatory items

    setSelectedIds(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // --- Calculations ---
  const basePrice = mainCourse.discounted_price || mainCourse.price;
  
  // Calculate Add-on cost (Only optional items that are selected)
  const addonsTotal = bundleItems.reduce((sum, item) => {
    if (!item.isMandatory && selectedIds.includes(item.course.id)) {
      return sum + (item.course.discounted_price || item.course.price);
    }
    return sum;
  }, 0);

  const finalTotal = basePrice + addonsTotal;
  const selectedCount = selectedIds.length;

  // Group items for display
  const sections: Record<string, BundleItemWrapper[]> = {};
  bundleItems.forEach(item => {
    const title = item.sectionTitle || "Other";
    if (!sections[title]) sections[title] = [];
    sections[title].push(item);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-royal" />
            Configure Your Batch
          </DialogTitle>
          <DialogDescription>
            Select the subjects you want to include in your enrollment.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            
            {/* Base Course (Always Included) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{mainCourse.title}</h3>
                  <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
                    Base Course (Included)
                  </Badge>
                </div>
                <span className="font-bold text-lg">₹{basePrice}</span>
              </div>
            </div>

            {/* Dynamic Sections */}
            {Object.entries(sections).map(([title, items]) => (
              <div key={title} className="space-y-3">
                <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                  {title}
                </h4>
                
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.course.id);
                  const price = item.course.discounted_price || item.course.price;

                  return (
                    <div 
                      key={item.course.id}
                      onClick={() => toggleSelection(item.course.id, item.isMandatory)}
                      className={`
                        flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer
                        ${isSelected ? 'border-royal bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}
                        ${item.isMandatory ? 'opacity-80 cursor-default' : ''}
                      `}
                    >
                      {/* Checkbox Icon */}
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                        ${isSelected ? 'bg-royal border-royal text-white' : 'bg-white border-slate-300'}
                      `}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-900">{item.course.title}</span>
                          <span className="font-medium text-slate-900">
                            {item.isMandatory ? <span className="text-green-600 text-xs font-bold uppercase">Included</span> : `+ ₹${price}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.course.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer / Checkout Bar */}
        <div className="p-6 border-t bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600 font-medium">Total Payable amount</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-royal">₹{finalTotal}</span>
              <p className="text-xs text-slate-500">{selectedCount} Items Selected</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
             </Button>
             
             <EnrollButton
                courseId={mainCourse.id} // You might need to update EnrollButton to accept a list of IDs or a 'bundle_ids' prop
                coursePrice={finalTotal}
                className="flex-[2]"
             >
                Confirm & Enroll
             </EnrollButton>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default BatchConfigurationModal;
