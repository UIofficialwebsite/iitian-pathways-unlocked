import React from "react";
import { Subject } from "../../types/gradeTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PredictorInputFormProps {
  subject: Subject;
  inputValues: Record<string, string>;
  targetGrade: string;
  onInputChange: (fieldId: string, value: string) => void;
  onTargetChange: (value: string) => void;
  onCalculate: () => void;
}

export default function PredictorInputForm({ 
  subject, 
  inputValues, 
  targetGrade,
  onInputChange, 
  onTargetChange,
  onCalculate
}: PredictorInputFormProps) {
  
  // Filter out the 'F' (End Term) field as that is what we are predicting
  const inputFields = subject.fields.filter(f => f.id !== 'F');

  const handleValueChange = (fieldId: string, value: string, max: number) => {
    if (value === "") { onInputChange(fieldId, value); return; }
    const num = parseFloat(value);
    if (/^\d*\.?\d*$/.test(value)) {
      if (!isNaN(num) && num <= max) onInputChange(fieldId, value);
      else if (isNaN(num)) onInputChange(fieldId, value);
    }
  };

  return (
    <div className="mb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Inter']">
      
      <div className="flex justify-between items-end pb-2 border-b border-gray-200 mb-6">
         <Label className="text-xs font-bold uppercase tracking-wide text-gray-500 font-['Inter']">
           02. Enter Internal Scores
         </Label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
        {/* Dynamic Inputs (Excluding Final) */}
        {inputFields.map((field) => (
          <div key={field.id} className="space-y-3">
            <Label htmlFor={field.id} className="text-xs font-bold uppercase tracking-wide text-gray-600 font-['Inter']">
              {field.label}
            </Label>
            <Input
              id={field.id}
              type="text"
              inputMode="decimal"
              placeholder={`Enter score (<= ${field.max})`}
              value={inputValues[field.id] || ""}
              onChange={(e) => handleValueChange(field.id, e.target.value, field.max)}
              className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-['Inter'] font-normal placeholder:font-normal placeholder:text-gray-300 transition-colors"
            />
          </div>
        ))}

        {/* Target Grade Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wide text-blue-700 font-['Inter']">
            Target Grade
          </Label>
          <Select value={targetGrade} onValueChange={onTargetChange}>
            <SelectTrigger className="h-12 w-full text-lg bg-blue-50 border-2 border-blue-200 focus:border-blue-700 focus:ring-0 rounded-sm font-['Inter'] font-semibold text-blue-900">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {['S', 'A', 'B', 'C', 'D', 'E'].map(g => (
                <SelectItem key={g} value={g} className="font-['Inter'] font-medium cursor-pointer">
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-start">
        <Button 
          onClick={onCalculate}
          className="h-12 px-8 bg-blue-800 text-white hover:bg-blue-900 rounded-sm font-semibold text-base font-['Inter'] transition-all shadow-sm"
        >
          Calculate Required Score
        </Button>
      </div>
      
    </div>
  );
}
