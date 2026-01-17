import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import EnrollButton from '@/components/EnrollButton';
import { Course } from '@/components/admin/courses/types';

// Simple structure matching your new table
export interface SimpleAddon {
  id: string;
  subject_name: string;
  price: number;
}

interface BatchConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCourse: Course;
  addons: SimpleAddon[];
}

const BatchConfigurationModal: React.FC<BatchConfigurationModalProps> = ({
  isOpen,
  onClose,
  mainCourse,
  addons
}) => {
  // Store just the names: ["Python", "Stats"]
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (name: string) => {
    setSelectedSubjects(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  const basePrice = mainCourse.discounted_price || mainCourse.price;
  
  // Calculate Total
  const addonsTotal = addons.reduce((sum, item) => {
    if (selectedSubjects.includes(item.subject_name)) {
      return sum + Number(item.price);
    }
    return sum;
  }, 0);

  const finalTotal = basePrice + addonsTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-royal" />
            Customize Batch
          </DialogTitle>
          <DialogDescription>Add optional subjects to your enrollment.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="p-6 max-h-[60vh]">
          {/* Mandatory Section */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Included (Mandatory)</h4>
            <div className="p-3 border rounded-lg bg-slate-50 flex justify-between">
               <div>
                 <p className="font-bold text-sm">{mainCourse.title}</p>
                 <p className="text-xs text-slate-500 mt-1">
                    {mainCourse.subject ? `Subjects: ${mainCourse.subject}` : "All Core Subjects"}
                 </p>
               </div>
               <Badge variant="secondary" className="h-6 bg-green-100 text-green-700">Included</Badge>
            </div>
          </div>

          {/* Optional Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Optional Add-ons</h4>
            <div className="space-y-2">
              {addons.map((addon) => {
                const isSelected = selectedSubjects.includes(addon.subject_name);
                return (
                  <div 
                    key={addon.id}
                    onClick={() => toggleSubject(addon.subject_name)}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-royal bg-blue-50' : 'hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-royal border-royal text-white' : 'bg-white'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium">{addon.subject_name}</span>
                    </div>
                    <span className="text-sm font-bold">+ ₹{addon.price}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
           <div>
             <p className="text-xs text-slate-500">Total Payable</p>
             <p className="text-2xl font-bold text-royal">₹{finalTotal}</p>
           </div>
           <EnrollButton
              courseId={mainCourse.id}
              coursePrice={finalTotal}
              // We pass the simple string array here
              selectedSubjectIds={selectedSubjects} 
              className="bg-royal px-8"
           >
              Pay Now
           </EnrollButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchConfigurationModal;
