import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

// Defining categories and their selection logic
const refineCategories: FilterCategory[] = [
  {
    id: "status",
    name: "Batch Status",
    selectionType: "single", // Single choice = Circle
    options: [
      { id: "ongoing", label: "Ongoing" },
      { id: "upcoming", label: "Upcoming" },
      { id: "completed", label: "Completed" },
    ],
  },
  {
    id: "class",
    name: "Class",
    selectionType: "multiple", // Multiple choice = Square
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
  const [activeTabId, setActiveTabId] = useState(refineCategories[0].id);
  const [tempSelections, setTempSelections] = useState<Record<string, string[]>>({});

  const activeCategory = refineCategories.find((cat) => cat.id === activeTabId);

  const handleToggleOption = (categoryId: string, optionId: string, type: "single" | "multiple") => {
    setTempSelections((prev) => {
      const currentSelections = prev[categoryId] || [];
      
      if (type === "single") {
        // Replace with single selection
        return { ...prev, [categoryId]: [optionId] };
      } else {
        // Toggle multiple selection
        const isSelected = currentSelections.includes(optionId);
        const updated = isSelected 
          ? currentSelections.filter(id => id !== optionId) 
          : [...currentSelections, optionId];
        return { ...prev, [categoryId]: updated };
      }
    });
  };

  const handleReset = () => setTempSelections({});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[450px] p-0 overflow-hidden border-none h-[600px] flex flex-col gap-0 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
          <DialogTitle className="text-lg font-semibold text-gray-800">Refine Batches</DialogTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Sidebar - Navigation */}
          <div className="w-[170px] bg-[#f8f9fa] border-r border-gray-100 flex flex-col">
            {refineCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveTabId(cat.id)}
                className={`px-5 py-4 text-sm cursor-pointer border-l-4 transition-all ${
                  activeTabId === cat.id
                    ? "bg-[#f1f1f1] text-gray-900 border-[#5d54d1] font-bold"
                    : "text-gray-500 border-transparent hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </div>
            ))}
          </div>

          {/* Content Area - Options */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeCategory?.options.map((option) => {
              const isSelected = tempSelections[activeCategory.id]?.includes(option.id);
              const isSingle = activeCategory.selectionType === "single";

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(activeCategory.id, option.id, activeCategory.selectionType)}
                  className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 px-2 -mx-2 rounded-sm transition-colors"
                >
                  <span className={`text-[15px] ${isSelected ? "text-[#5d54d1] font-medium" : "text-gray-700"}`}>
                    {option.label}
                  </span>

                  {isSingle ? (
                    /* Circle for Single Choice */
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-[#5d54d1] bg-[#5d54d1]" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  ) : (
                    /* Square for Multiple Choice */
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
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

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-4 bg-white z-10">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-12 font-bold"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 bg-[#9499a6] hover:bg-[#828896] text-white h-12 font-bold"
            onClick={() => {
              onApply(tempSelections);
              onClose();
            }}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefineBatchesModal;
