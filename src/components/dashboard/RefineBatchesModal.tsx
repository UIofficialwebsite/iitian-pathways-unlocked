import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterCategory {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  options: FilterOption[];
}

interface RefineBatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string[]>) => void;
}

const RefineBatchesModal = ({ isOpen, onClose, onApply }: RefineBatchesModalProps) => {
  const [activeTabId, setActiveTabId] = useState("goal");
  const [tempSelections, setTempSelections] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicFilters = async () => {
      setIsLoading(true);
      // Fetch unique values from the courses table
      const { data, error } = await supabase
        .from('courses')
        .select('exam_category, level, subject, language, batch_type');
      
      if (data && !error) {
        // Extract unique options from the database results
        const getUnique = (key: keyof typeof data[0]) => 
          Array.from(new Set(data.map(item => item[key]).filter(Boolean))) as string[];

        const dynamicCategories: FilterCategory[] = [
          {
            id: "goal",
            name: "Exam Goal",
            selectionType: "multiple", // Users can see JEE and NEET together
            options: getUnique('exam_category').map(val => ({ id: val.toLowerCase(), label: val }))
          },
          {
            id: "class",
            name: "Class/Level",
            selectionType: "multiple",
            options: getUnique('level').map(val => ({ id: val, label: val }))
          },
          {
            id: "subject",
            name: "Subject",
            selectionType: "multiple",
            options: getUnique('subject').map(val => ({ id: val, label: val }))
          },
          {
            id: "language",
            name: "Language",
            selectionType: "single", // Usually one language at a time
            options: getUnique('language').map(val => ({ id: val.toLowerCase(), label: val }))
          }
        ];
        
        setCategories(dynamicCategories);
        if (dynamicCategories.length > 0) setActiveTabId(dynamicCategories[0].id);
      }
      setIsLoading(false);
    };

    if (isOpen) fetchDynamicFilters();
  }, [isOpen]);

  const handleToggleOption = (categoryId: string, optionId: string, type: "single" | "multiple") => {
    setTempSelections((prev) => {
      const current = prev[categoryId] || [];
      if (type === "single") return { ...prev, [categoryId]: [optionId] };
      const updated = current.includes(optionId) 
        ? current.filter(id => id !== optionId) 
        : [...current, optionId];
      return { ...prev, [categoryId]: updated };
    });
  };

  const activeCategory = categories.find((cat) => cat.id === activeTabId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* z-[200] ensures it sits above the Navbar */}
      <SheetContent side="right" className="p-0 sm:max-w-[450px] border-none h-full flex flex-col gap-0 shadow-2xl z-[200]">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
          <SheetTitle className="text-xl font-bold text-gray-900 tracking-tight">Refine Batches</SheetTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Nav */}
          <div className="w-[160px] bg-[#f8f9fa] border-r border-gray-100">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setActiveTabId(cat.id)}
                  className={`px-5 py-4 text-[13px] cursor-pointer border-l-4 transition-all ${
                    activeTabId === cat.id 
                      ? "bg-[#f1f1f1] text-gray-900 border-[#5d54d1] font-bold" 
                      : "text-gray-500 border-transparent hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </div>
              ))
            )}
          </div>

          {/* Right Content Options */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-50 rounded" />)}
              </div>
            ) : (
              activeCategory?.options.map((option) => {
                const isSelected = tempSelections[activeCategory.id]?.includes(option.id);
                const isSingle = activeCategory.selectionType === "single";

                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(activeCategory.id, option.id, activeCategory.selectionType)}
                    className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer group"
                  >
                    <span className={`text-[15px] transition-colors ${isSelected ? "text-[#5d54d1] font-bold" : "text-gray-700 group-hover:text-black"}`}>
                      {option.label}
                    </span>
                    <div className={`w-5 h-5 flex items-center justify-center border transition-all ${
                      isSingle ? "rounded-full" : "rounded"
                    } ${isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"}`}>
                      {isSelected && (isSingle ? <div className="w-2 h-2 rounded-full bg-white" /> : <Check size={14} className="text-white" />)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-4 bg-white z-10">
          <Button variant="outline" className="flex-1 h-12 font-bold text-gray-600" onClick={() => setTempSelections({})}>
            Reset
          </Button>
          <Button className="flex-1 bg-[#9499a6] hover:bg-[#838895] h-12 font-bold text-white" onClick={() => { onApply(tempSelections); onClose(); }}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RefineBatchesModal;
