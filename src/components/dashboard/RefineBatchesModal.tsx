import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

// Global filter categories including all goals
const globalRefineCategories: FilterCategory[] = [
  {
    id: "goal",
    name: "Exam Goal",
    selectionType: "multiple",
    options: [
      { id: "jee", label: "JEE Main & Advanced" },
      { id: "neet", label: "NEET" },
      { id: "iitm", label: "IITM BS Degree" },
      { id: "foundation", label: "Foundation (8th-10th)" },
    ],
  },
  {
    id: "status",
    name: "Batch Status",
    selectionType: "single",
    options: [
      { id: "ongoing", label: "Ongoing" },
      { id: "upcoming", label: "Upcoming" },
      { id: "completed", label: "Completed" },
    ],
  },
  {
    id: "class",
    name: "Class",
    selectionType: "multiple",
    options: [
      { id: "11", label: "Class 11th" },
      { id: "12", label: "Class 12th" },
      { id: "dropper", label: "Dropper" },
    ],
  },
  {
    id: "subjects",
    name: "Subjects",
    selectionType: "multiple",
    options: [
      { id: "physics", label: "Physics" },
      { id: "chemistry", label: "Chemistry" },
      { id: "maths", label: "Mathematics" },
      { id: "biology", label: "Biology" },
      { id: "stats", label: "Statistics (IITM)" },
      { id: "python", label: "Python (IITM)" },
    ],
  },
  {
    id: "language",
    name: "Language",
    selectionType: "single",
    options: [
      { id: "hinglish", label: "Hinglish" },
      { id: "english", label: "English" },
      { id: "hindi", label: "Hindi" },
    ],
  },
];

interface RefineBatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string[]>) => void;
}

const RefineBatchesModal = ({ isOpen, onClose, onApply }: RefineBatchesModalProps) => {
  const [activeTabId, setActiveTabId] = useState(globalRefineCategories[0].id);
  const [tempSelections, setTempSelections] = useState<Record<string, string[]>>({});

  const activeCategory = globalRefineCategories.find((cat) => cat.id === activeTabId);

  const handleToggleOption = (categoryId: string, optionId: string, type: "single" | "multiple") => {
    setTempSelections((prev) => {
      const currentSelections = prev[categoryId] || [];
      if (type === "single") {
        return { ...prev, [categoryId]: [optionId] };
      } else {
        const isSelected = currentSelections.includes(optionId);
        const updated = isSelected 
          ? currentSelections.filter(id => id !== optionId) 
          : [...currentSelections, optionId];
        return { ...prev, [categoryId]: updated };
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* Side="right" ensures it slides from the right; sm:max-w-md sets width */}
      <SheetContent side="right" className="p-0 sm:max-w-[450px] border-none h-full flex flex-col gap-0 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
          <SheetTitle className="text-xl font-bold text-gray-900">Refine Batches</SheetTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Sidebar Navigation */}
          <div className="w-[160px] bg-[#f8f9fa] border-r border-gray-100">
            {globalRefineCategories.map((cat) => (
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
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">
              Select {activeCategory?.name}
            </h3>
            {activeCategory?.options.map((option) => {
              const isSelected = tempSelections[activeCategory.id]?.includes(option.id);
              const isSingle = activeCategory.selectionType === "single";

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(activeCategory.id, option.id, activeCategory.selectionType)}
                  className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer"
                >
                  <span className={`text-[15px] ${isSelected ? "text-[#5d54d1] font-bold" : "text-gray-700"}`}>
                    {option.label}
                  </span>

                  {isSingle ? (
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  ) : (
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-4 bg-white">
          <Button variant="outline" className="flex-1 h-12 font-bold border-gray-300" onClick={() => setTempSelections({})}>
            Reset
          </Button>
          <Button className="flex-1 bg-[#9499a6] hover:bg-[#828896] h-12 font-bold" onClick={() => { onApply(tempSelections); onClose(); }}>
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RefineBatchesModal;
