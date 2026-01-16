import React from "react";
import { Subject } from "../types/gradeTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ScoreInputFormProps {
  subject: Subject;
  inputValues: Record<string, string>;
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
}

export default function ScoreInputForm({ 
  subject, 
  inputValues, 
  onInputChange, 
  onCalculate
}: ScoreInputFormProps) {
  
  return (
    <div className="mb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end pb-2 border-b border-gray-200 mb-6">
         <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-sans">
           02. Enter Scores
         </Label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
        {subject.fields.map((field) => (
          <div key={field.id} className="space-y-3">
            <Label htmlFor={field.id} className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans">
              {field.label}
            </Label>
            <Input
              id={field.id}
              type="text"
              inputMode="decimal"
              placeholder={`Enter score (<= ${field.max})`}
              value={inputValues[field.id] || ""}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal placeholder:font-normal placeholder:text-gray-300 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Calculate Button - Blue, No Icon */}
      <div className="flex justify-start">
        <Button 
          onClick={onCalculate}
          className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 rounded-sm font-semibold text-base font-sans transition-all shadow-sm"
        >
          Calculate Grade
        </Button>
      </div>
    </div>
  );
}
