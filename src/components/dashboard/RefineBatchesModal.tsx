import React, { useEffect, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
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
  dbField: string;
  selectionType: "single" | "multiple";
}

const RefineBatchesModal = ({ isOpen, onClose, onApply }: any) => {
  const [activeTabId, setActiveTabId] = useState("exam_category");
  const [tempSelections, setTempSelections] = useState<Record<string, string[]>>({});
  const [availableOptions, setAvailableOptions] = useState<Record<string, FilterOption[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Define the hierarchy and database mapping
  const categories: FilterCategory[] = [
    { id: "exam_category", name: "Exam Goal", dbField: "exam_category", selectionType: "single" },
    { id: "level", name: "Class/Branch", dbField: "level", selectionType: "single" },
    { id: "subject", name: "Subject", dbField: "subject", selectionType: "multiple" },
    { id: "language", name: "Language", dbField: "language", selectionType: "single" }
  ];

  const fetchOptionsForCategory = async (catId: string) => {
    setIsLoading(true);
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    let query = supabase.from('courses').select(category.dbField);

    // Apply previous selections as filters to the query for dependency
    categories.forEach((prevCat) => {
      const selections = tempSelections[prevCat.id];
      // Only filter by categories that come BEFORE the current one in the hierarchy
      const currentIndex = categories.findIndex(c => c.id === catId);
      const prevIndex = categories.findIndex(c => c.id === prevCat.id);

      if (selections && selections.length > 0 && prevIndex < currentIndex) {
        query = query.in(prevCat.dbField, selections);
      }
    });

    const { data, error } = await query;

    if (data && !error) {
      const uniqueValues = Array.from(new Set(data.map(item => (item as any)[category.dbField]).filter(Boolean))) as string[];
      setAvailableOptions(prev => ({
        ...prev,
        [catId]: uniqueValues.map(val => ({ id: val, label: val }))
      }));
    }
    setIsLoading(false);
  };

  // Fetch options whenever the active tab changes or previous selections change
  useEffect(() => {
    if (isOpen) {
      fetchOptionsForCategory(activeTabId);
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

      // FUTURE PROOF LOGIC: Clear all DOWNSTREAM filters in the hierarchy
      const catIndex = categories.findIndex(c => c.id === categoryId);
      categories.forEach((cat, index) => {
        if (index > catIndex) {
          delete updated[cat.id];
        }
      });

      return updated;
    });
  };

  const activeCategory = categories.find((cat) => cat.id === activeTabId);
  const currentOptions = availableOptions[activeTabId] || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="p-0 sm:max-w-[450px] border-none h-full flex flex-col gap-0 shadow-2xl z-[200]">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
          <SheetTitle className="text-xl font-bold text-gray-900">Refine Batches</SheetTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[160px] bg-[#f8f9fa] border-r border-gray-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveTabId(cat.id)}
                className={`px-5 py-4 text-[13px] cursor-pointer border-l-4 transition-all ${
                  activeTabId === cat.id 
                    ? "bg-white text-[#5d54d1] border-[#5d54d1] font-bold" 
                    : "text-gray-500 border-transparent hover:bg-gray-100"
                }`}
              >
                {cat.name}
                {tempSelections[cat.id]?.length > 0 && (
                  <div className="text-[10px] mt-1 text-gray-400 truncate">
                    {tempSelections[cat.id].join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="flex-1 p-6 overflow-y-auto bg-white relative">
            {isLoading ? (
              <div className="flex justify-center items-center h-20"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : currentOptions.length > 0 ? (
              currentOptions.map((option) => {
                const isSelected = tempSelections[activeTabId]?.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(activeTabId, option.id, activeCategory!.selectionType)}
                    className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer"
                  >
                    <span className={`${isSelected ? "text-[#5d54d1] font-bold" : "text-gray-700"}`}>{option.label}</span>
                    <div className={`w-5 h-5 flex items-center justify-center border ${
                      activeCategory?.selectionType === "single" ? "rounded-full" : "rounded"
                    } ${isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"}`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-400 text-center mt-10">Select a previous category first</div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-4 bg-white">
          <Button variant="outline" className="flex-1" onClick={() => setTempSelections({})}>Reset</Button>
          <Button className="flex-1 bg-[#5d54d1] hover:bg-[#4a43b1]" onClick={() => { onApply(tempSelections); onClose(); }}>Apply</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RefineBatchesModal;
