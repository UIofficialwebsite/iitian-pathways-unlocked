import { calculateGradeByLevel } from "./gradeCalculations";
import { Level } from "../types/gradeTypes";

// Grading Thresholds (Standard IITM Grading Scale)
export const GRADE_THRESHOLDS: Record<string, number> = {
  "S": 90,
  "A": 80,
  "B": 70,
  "C": 60,
  "D": 50,
  "E": 40
};

/**
 * Iterates from 0 to 100 for the End Term Exam (F) to find the 
 * minimum score required to reach the target grade.
 */
export function predictRequiredScore(
  level: Level,
  subjectKey: string,
  currentValues: Record<string, number>,
  targetGrade: string
): { required: number | null; possible: boolean; finalGrade: number } {
  
  const targetScore = GRADE_THRESHOLDS[targetGrade];
  
  // If target grade is invalid (e.g. "U"), return null
  if (targetScore === undefined) {
    return { required: null, possible: false, finalGrade: 0 };
  }

  // Algorithm: Brute-force check exam scores from 0 to 100
  // This is efficient enough (only 101 iterations) and ensures accuracy 
  // with complex formulas involving max(), min(), and different weightages.
  for (let examScore = 0; examScore <= 100; examScore++) {
    
    // Create a temporary input object adding the test exam score
    const testValues = { ...currentValues, "F": examScore };
    
    // Calculate the total score using the existing formulas
    const calculatedScore = calculateGradeByLevel(level, subjectKey, testValues);

    // If we hit or exceed the target, we found the minimum required score
    if (calculatedScore >= targetScore) {
      return { 
        required: examScore, 
        possible: true, 
        finalGrade: calculatedScore 
      };
    }
  }

  // If the loop finishes and we never reached the target (even with 100 marks)
  return { required: null, possible: false, finalGrade: 0 };
}
