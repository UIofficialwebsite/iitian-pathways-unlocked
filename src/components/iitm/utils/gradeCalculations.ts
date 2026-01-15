import { Level } from "../types/gradeTypes";

function calculateStandardFoundation(values: Record<string, number>): number {
  const { Qz1 = 0, Qz2 = 0, F = 0 } = values;
  const part1 = 0.6 * F + 0.3 * Math.max(Qz1, Qz2);
  const part2 = 0.45 * F + 0.25 * Qz1 + 0.3 * Qz2;
  return Math.max(part1, part2);
}

function calculateStandardDiploma(values: Record<string, number>): number {
  const { GAA = 0, Qz1 = 0, Qz2 = 0, F = 0 } = values;
  return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2;
}

export function calculateFoundationGrade(subjectKey: string, values: Record<string, number>): number {
  const { Qz1 = 0, F = 0, OPPE1 = 0, OPPE2 = 0, Bonus = 0 } = values;

  switch (subjectKey) {
    case "maths1":
    case "english1":
    case "computational":
    case "english2":
      return calculateStandardFoundation(values);

    case "statistics1":
    case "statistics2":
      return calculateStandardFoundation(values) + Bonus;

    case "maths2":
      // Bonus here is the "E" component, capped to 100
      return Math.min(100, calculateStandardFoundation(values) + Bonus);

    case "python":
      return 0.15 * Qz1 + 0.4 * F + 0.25 * Math.max(OPPE1, OPPE2) + 0.2 * Math.min(OPPE1, OPPE2);

    default:
      return 0;
  }
}

export function calculateDiplomaGrade(subjectKey: string, values: Record<string, number>): number {
  const { GAA = 0, GA = 0, Qz1 = 0, Qz2 = 0, F = 0, OPPE1 = 0, OPPE2 = 0, OP = 0, KA = 0, Timed = 0, A = 0, Bonus = 0, GLA = 0, PE1 = 0, PE2 = 0, BPTA = 0, GAA2 = 0, GAA3 = 0 } = values;

  switch (subjectKey) {
    case "machinelearning":
      return calculateStandardDiploma(values);

    case "ml_techniques":
      // T = 0.05 GAA + max(...) + Bonus
      const termEndScore = Math.max(0.6 * F + 0.25 * Math.max(Qz1, Qz2), 0.4 * F + 0.25 * Qz1 + 0.3 * Qz2);
      return 0.05 * GAA + termEndScore + Bonus;

    case "machinelearning_practice":
      return 0.1 * GAA + 0.3 * F + 0.2 * OPPE1 + 0.2 * OPPE2 + 0.2 * KA;

    case "business_data_management":
      return GA + Qz2 + Timed + F;

    case "business_analytics":
      // Qz (20) + A (20) + F (40) + Bonus. 
      // Qz = 0.7 * Max(Qz1, Qz2) + 0.3 * Min(Qz1, Qz2)
      // Assuming Qz inputs are scaled 0-20 effectively if user inputs raw marks, or 
      // if inputs are 0-100, we apply the 20% weight inside.
      // Based on typical calculator usage, we'll assume standard scaling.
      // For precision, let's treat inputs as component marks as requested.
      const qzScore = 0.7 * Math.max(Qz1, Qz2) + 0.3 * Math.min(Qz1, Qz2);
      return qzScore + A + F + Bonus;

    case "programming_python": // PDSA
      return 0.05 * GAA + 0.2 * OP + 0.45 * F + Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2);

    case "databasems":
      return 0.03 * GAA2 + 0.02 * GAA3 + 0.2 * OP + 0.45 * F + Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2);

    case "appdev1":
    case "appdev2":
      // AD1 uses GLA, AD2 uses GAA.
      const scoreComp = (subjectKey === "appdev1" ? GLA : GAA);
      const examComp = Math.max(0.6 * F + 0.25 * Math.max(Qz1, Qz2), 0.4 * F + 0.25 * Qz1 + 0.3 * Qz2);
      return 0.05 * scoreComp + examComp;

    case "java_programming":
      return 0.05 * GAA + 0.2 * Math.max(PE1, PE2) + 0.45 * F + Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2) + 0.1 * Math.min(PE1, PE2);

    case "systemcommands":
      return 0.05 * GAA + 0.25 * Qz1 + 0.3 * (values.OPPE || 0) + 0.3 * F + 0.1 * BPTA;

    case "intro_dl_genai":
      return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2;
    
    case "tools_data_science":
        return 0.1 * GAA + 0.9 * F;

    default:
      return 0;
  }
}

export function calculateDegreeGrade(subjectKey: string, values: Record<string, number>): number {
  const { GAA = 0, GA = 0, Qz1 = 0, Qz2 = 0, Qz3 = 0, F = 0, Bonus = 0, GP1 = 0, GP2 = 0, PP = 0, CP = 0, GP = 0, OPPE1 = 0, OPPE2 = 0, GPA = 0, NPPE = 0, NPPE1 = 0, NPPE2 = 0, NPPE3 = 0, Prog = 0, P = 0, V = 0, GRPa = 0, Viva = 0 } = values;

  switch (subjectKey) {
    case "software_engineering":
      return 0.05 * GAA + 0.2 * Qz2 + 0.4 * F + 0.1 * GP1 + 0.1 * GP2 + 0.1 * PP + 0.05 * CP;

    case "software_testing":
    case "deep_learning_cv":
    case "corporate_finance":
    case "big_data_bio":
    case "statistical_computing":
    case "theory_computation":
      return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2;

    case "deep_learning":
    case "ai_search":
      return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2 + Bonus;

    case "strat_prof_growth":
      return 0.15 * GAA + 0.25 * GP + 0.25 * Qz2 + 0.35 * F;

    case "int_bigdata":
    case "mlops":
      if (subjectKey === "int_bigdata") {
        return 0.1 * GAA + 0.3 * F + 0.2 * OPPE1 + 0.4 * OPPE2 + Bonus;
      } else {
        return Math.min(100, 0.2 * GAA + 0.3 * F + 0.25 * OPPE1 + 0.25 * OPPE2 + Bonus);
      }

    case "c_prog":
      return 0.10 * GAA + 0.20 * Qz1 + 0.20 * OPPE1 + 0.20 * OPPE2 + 0.30 * F;

    case "deep_learning_practice":
      const nppeAvg = (NPPE1 + NPPE2 + NPPE3) / 3;
      return 0.05 * GA + 0.15 * Qz1 + 0.15 * Qz2 + 0.15 * Qz3 + 0.25 * nppeAvg + 0.25 * Viva;

    case "operating_systems":
      return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2;

    case "special_topics_ml":
      return 0.05 * GAA + 0.25 * GPA + 0.2 * Qz1 + 0.2 * Qz2 + 0.3 * F + Bonus;

    case "computer_networks":
      return 0.1 * GAA + 0.3 * F + 0.25 * Qz1 + 0.25 * Qz2 + 0.1 * Prog;

    case "ds_ai_lab":
      return 0.15 * GAA + 0.2 * Qz2 + 0.5 * P + 0.15 * V + Bonus;

    case "app_dev_lab":
      return 0.2 * Qz2 + 0.3 * GA + 0.5 * V;

    case "algo_thinking_bio":
      return 0.075 * GAA + 0.025 * GRPa + 0.25 * Qz1 + 0.25 * Qz2 + 0.4 * F;

    case "market_research":
      return 0.1 * GAA + 0.2 * Qz1 + 0.2 * Qz2 + 0.25 * P + 0.25 * F;

    case "advanced_algorithms":
      return 0.15 * GAA + Math.max(0.2 * Qz1 + 0.2 * Qz2 + 0.45 * F, 0.5 * F + 0.25 * Math.max(Qz1, Qz2));

    case "speech_technology":
      return 0.15 * GAA + 0.15 * V + 0.3 * F + 0.2 * Qz1 + 0.2 * Qz2;

    case "math_foundations_genai":
      return 0.05 * GAA + 0.35 * F + 0.2 * Qz1 + 0.2 * Qz2 + 0.2 * NPPE;

    default:
      return 0;
  }
}

export function getGradeLetter(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "U";
}

export function getGradePoints(score: number): number {
  if (score >= 90) return 10;
  if (score >= 80) return 9;
  if (score >= 70) return 8;
  if (score >= 60) return 7;
  if (score >= 50) return 6;
  if (score >= 40) return 4;
  return 0;
}

export function calculateGradeByLevel(level: Level, subjectKey: string, values: Record<string, number>): number {
  switch (level) {
    case "foundation":
      return calculateFoundationGrade(subjectKey, values);
    case "diploma":
      return calculateDiplomaGrade(subjectKey, values);
    case "degree":
      return calculateDegreeGrade(subjectKey, values);
    default:
      return 0;
  }
}
