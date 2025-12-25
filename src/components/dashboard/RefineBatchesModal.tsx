import React, { useEffect, useState, useMemo } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterCategory {
  id: string;
  name: string;
  dbField: "exam_category" | "level" | "subject" | "language" | "branch";
  selectionType: "single" | "multiple";
}

const RefineBatchesModal = ({ isOpen, onClose, onApply }: any) => {
  const [activeTabId, setActiveTabId] = useState("exam_category");
  const [tempSelections, setTempSelections] = useState<Record<string, string[]>>({});
  const [availableOptions, setAvailableOptions] = useState<Record<string, FilterOption[]>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Future-proof hierarchy definition
  const categories: FilterCategory[] = useMemo(() => [
    { id: "exam_category", name: "Exam Goal", dbField: "exam_category", selectionType: "single" },
    { id: "level", name: "Class/Branch", dbField: "level", selectionType: "single" },
    { id: "subject", name: "Subject", dbField: "subject", selectionType: "multiple" },
    { id: "language", name: "Language", dbField: "language", selectionType: "single" }
  ], []);

  const fetchDynamicOptions = async (catId: string) => {
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    // We fetch both 'level' and 'branch' to ensure nothing is missed for Class/Branch choice
    let query = supabase.from('courses').select('exam_category, level, subject, language, branch');

    // Cascade Filtering: Apply existing selections to the query
    Object.entries(tempSelections).forEach(([key, values]) => {
      const cat = categories.find(c => c.id === key);
      if (cat && values.length > 0 && categories.indexOf(cat) < categories.findIndex(c => c.id === catId)) {
        query = query.in(cat.dbField, values);
      }
    });

    const { data, error } = await query;

    if (data && !error) {
      // Logic to merge 'level' and 'branch' if we are on the Class/Branch tab
      let uniqueValues: string[] = [];
      if (catId === "level") {
        const levels = data.map(item => item.level).filter(Boolean);
        const branches = data.map(item => item.branch).filter(Boolean);
        uniqueValues = Array.from(new Set([...levels, ...branches])) as string[];
      } else {
        uniqueValues = Array.from(new Set(data.map(item => (item as any)[category.dbField]).filter(Boolean))) as string[];
      }

      setAvailableOptions(prev => ({
        ...prev,
        [catId]: uniqueValues.map(val => ({ id: val, label: val }))
      }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        if (Object.keys(availableOptions).length === 0) setIsInitialLoading(true);
        await fetchDynamicOptions(activeTabId);
        setIsInitialLoading(false);
      };
      load();
    }
  }, [isOpen, activeTabId, tempSelections]);

  const handleToggleOption = (categoryId: string, optionId: string, type: "single" | "multiple") => {
    setTempSelections((prev) => {
      const updated = { ...prev };
      
      if (type === "single") {
        updated[categoryId] = [optionId];
      } else {
        const current = prev[categoryId] || [];
        updated[categoryId] = current.includes(optionId) 
          ? current.filter(id => id !== optionId) 
          : [...current, optionId];
      }

      // Reset downstream selections to prevent invalid filter states
      const currentIndex = categories.findIndex(c => c.id === categoryId);
      categories.forEach((cat, idx) => {
        if (idx > currentIndex) delete updated[cat.id];
      });

      return updated;
    });
  };

  const currentOptions = availableOptions[activeTabId] || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="p-0 sm:max-w-[450px] border-none h-full flex flex-col gap-0 shadow-2xl z-[200]">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
          <SheetTitle className="text-xl font-bold text-gray-900">Refine Batches</SheetTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-[160px] bg-[#f8f9fa] border-r border-gray-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveTabId(cat.id)}
                className={`px-5 py-5 text-[13px] cursor-pointer border-l-4 transition-all ${
                  activeTabId === cat.id 
                    ? "bg-white text-[#5d54d1] border-[#5d54d1] font-bold" 
                    : "text-gray-500 border-transparent hover:bg-gray-200"
                }`}
              >
                {cat.name}
                {/* Removed Subtitle selection display per requirement */}
              </div>
            ))}
          </div>

          {/* Options List */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {isInitialLoading ? (
               <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded" />)}
               </div>
            ) : (
              currentOptions.map((option) => {
                const isSelected = tempSelections[activeTabId]?.includes(option.id);
                const isSingle = categories.find(c => c.id === activeTabId)?.selectionType === "single";

                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(activeTabId, option.id, isSingle ? "single" : "multiple")}
                    className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer group"
                  >
                    <span className={`text-[15px] transition-colors ${isSelected ? "text-[#5d54d1] font-bold" : "text-gray-700 group-hover:text-black"}`}>
                      {option.label}
                    </span>
                    <div className={`w-5 h-5 flex items-center justify-center border transition-all ${
                      isSingle ? "rounded-full" : "rounded"
                    } ${isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"}`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-4 bg-white">
          <Button variant="outline" className="flex-1 h-12 font-bold" onClick={() => setTempSelections({})}>Reset</Button>
          <Button className="flex-1 bg-[#5d54d1] hover:bg-[#4a43b1] h-12 font-bold text-white" onClick={() => { onApply(tempSelections); onClose(); }}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RefineBatchesModal;
