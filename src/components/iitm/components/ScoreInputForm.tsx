import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "../types/gradeTypes";

interface ScoreInputFormProps {
  subject: Subject;
  inputValues: Record<string, string>; // Changed to string to support better input handling
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function ScoreInputForm({ 
  subject, 
  inputValues, 
  onInputChange, 
  onCalculate, 
  onReset 
}: ScoreInputFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{subject.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subject.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type="text"
                inputMode="decimal"
                value={inputValues[field.id] || ""}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()} (Max ${field.max})`}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={onCalculate} className="bg-royal hover:bg-royal-dark">
            Calculate Grade
          </Button>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
