import { Level } from "../types/gradeTypes";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Standard Formula for ES Theory: 0.1 GAA + max(0.6F + 0.2max(Qz), 0.4F + 0.2Qz1 + 0.3Qz2)
function calculateESStandardTheory(values: Record<string, number>): number {
  const { GAA = 0, Qz1 = 0, Qz2 = 0, F = 0 } = values;
  const opt1 = 0.6 * F + 0.2 * Math.max(Qz1, Qz2);
  const opt2 = 0.4 * F + 0.2 * Qz1 + 0.3 * Qz2;
  return 0.1 * GAA + Math.max(opt1, opt2);
}

// Standard Formula for DS Foundation (No GAA): max(0.6F + 0.3max(Qz), 0.45F + 0.25Qz1 + 0.3Qz2)
function calculateDSFoundationStandard(values: Record<string, number>): number {
  const { Qz1 = 0, Qz2 = 0, F = 0 } = values;
  const opt1 = 0.6 * F + 0.3 * Math.max(Qz1, Qz2);
  const opt2 = 0.45 * F + 0.25 * Qz1 + 0.3 * Qz2;
  return Math.max(opt1, opt2);
}

// Standard Formula for DS Diploma/Degree: 0.1 GAA + 0.4 F + 0.25 Qz1 + 0.25 Qz2
function calculateDSDiplomaStandard(values: Record<string, number>): number {
  const { GAA = 0, Qz1 = 0, Qz2 = 0, F = 0 } = values;
  return 0.1 * GAA + 0.4 * F + 0.25 * Qz1 + 0.25 * Qz2;
}

// Standard Formula for ES Labs: 0.4 WE + 0.6 ID
function calculateESStandardLab(values: Record<string, number>): number {
  const { WE = 0, ID = 0 } = values;
  return 0.4 * WE + 0.6 * ID;
}

// ==========================================
// FOUNDATION LEVEL LOGIC
// ==========================================

export function calculateFoundationGrade(subjectKey: string, values: Record<string, number>): number {
  const { Qz1 = 0, Qz2 = 0, F = 0, OPPE1 = 0, OPPE2 = 0, Bonus = 0, 
          GAA = 0, NPPE = 0, OPE = 0, BPTA = 0, VMT = 0, 
          GRPA = 0, EXP = 0, RPT = 0, TLA = 0, IL = 0, OL = 0, Viva = 0 } = values;

  // --- Electronic Systems (ES) ---
  if (subjectKey.startsWith("es_")) {
    switch (subjectKey) {
      case "es_english1":
      case "es_math1":
      case "es_estc":
      case "es_english2":
      case "es_digital":
        return calculateESStandardTheory(values);

      case "es_eec": // Electrical & Electronic Circuits
        return calculateESStandardTheory(values) + Bonus;

      case "es_estc_lab":
        // 50% Exp + 50% Report
        return 0.5 * EXP + 0.5 * RPT;

      case "es_intro_c":
        // 0.15 Qz1 + 0.4 F + 0.25 max(OPPE) + 0.2 min(OPPE)
        return 0.15 * Qz1 + 0.4 * F + 0.25 * Math.max(OPPE1, OPPE2) + 0.2 * Math.min(OPPE1, OPPE2);

      case "es_intro_c_lab":
        return 0.5 * TLA + 0.5 * IL;

      case "es_linux":
        // Complex Formula: 0.1 GAA + 0.05 NPPE + 0.2 Qz1 + 0.25 OPE + 0.3 F + 0.05 BPTA + 0.05 VMT
        return 0.1 * GAA + 0.05 * NPPE + 0.2 * Qz1 + 0.25 * OPE + 0.3 * F + 0.05 * BPTA + 0.05 * VMT;

      case "es_linux_lab":
        return 0.5 * OL + 0.5 * IL;

      case "es_electronics_lab":
        return calculateESStandardLab(values);

      case "es_embedded_c":
        // 0.1 GAA + 0.1 GRPA + max((0.5F + 0.2max(Qz)), (0.4F + 0.2Qz1 + 0.2Qz2))
        const embTerm = Math.max(0.5 * F + 0.2 * Math.max(Qz1, Qz2), 0.4 * F + 0.2 * Qz1 + 0.2 * Qz2);
        return 0.1 * GAA + 0.1 * GRPA + embTerm;

      case "es_embedded_c_lab":
        // Assumes full attendance (20) + 0.8 * Viva score
        return 20 + 0.8 * Viva;

      default:
        return 0;
    }
  }

  // --- Data Science (DS) ---
  switch (subjectKey) {
    case "maths1":
    case "english1":
    case "computational":
    case "english2":
      return calculateDSFoundationStandard(values);

    case "statistics1":
    case "statistics2":
      return calculateDSFoundationStandard(values) + Bonus;

    case "maths2":
      return Math.min(100, calculateDSFoundationStandard(values) + Bonus);

    case "python":
      // 0.15 Qz1 + 0.4 F + 0.25 max(OPPE) + 0.2 min(OPPE)
      return 0.15 * Qz1 + 0.4 * F + 0.25 * Math.max(OPPE1, OPPE2) + 0.2 * Math.min(OPPE1, OPPE2);

    default:
      return 0;
  }
}

// ==========================================
// DIPLOMA LEVEL LOGIC
// ==========================================

export function calculateDiplomaGrade(subjectKey: string, values: Record<string, number>): number {
  const { GAA = 0, GA = 0, Qz1 = 0, Qz2 = 0, F = 0, OPPE1 = 0, OPPE2 = 0, KA = 0, 
          Timed = 0, A = 0, Bonus = 0, GLA = 0, PE1 = 0, PE2 = 0, OP = 0,
          GrPA = 0, GAA1 = 0, GAA2 = 0, LE = 0, LV = 0 } = values;

  // --- Electronic Systems (ES) ---
  if (subjectKey.startsWith("es_")) {
    switch (subjectKey) {
      case "es_math2":
      case "es_analog":
      case "es_sensors":
      case "es_control":
        return calculateESStandardTheory(values);

      case "es_signals":
        // 0.1 GAA + 0.1 GrPA + max(0.5F + 0.2max(Qz), 0.4F + 0.2Qz1 + 0.2Qz2)
        const sigTerm = Math.max(0.5 * F + 0.2 * Math.max(Qz1, Qz2), 0.4 * F + 0.2 * Qz1 + 0.2 * Qz2);
        return 0.1 * GAA + 0.1 * GrPA + sigTerm;

      case "es_python_diploma":
        // 0.1 GAA1 + 0.1 GAA2 + 0.1 Qz1 + 0.4 F + 0.25 max(PE) + 0.15 min(PE)
        return 0.1 * GAA1 + 0.1 * GAA2 + 0.1 * Qz1 + 0.4 * F + 0.25 * Math.max(PE1, PE2) + 0.15 * Math.min(PE1, PE2);

      case "es_dsp":
        // 0.1 GAA + 0.1 LE + 0.05 LV + max(0.55F + 0.1max(Qz), 0.45F + 0.15Qz1 + 0.15Qz2)
        const dspTerm = Math.max(0.55 * F + 0.1 * Math.max(Qz1, Qz2), 0.45 * F + 0.15 * Qz1 + 0.15 * Qz2);
        return 0.1 * GAA + 0.1 * LE + 0.05 * LV + dspTerm;

      case "es_dsd":
        // 0.1 GAA + 0.1 GRPA + max(0.5F + 0.2max(Qz), 0.4F + 0.2Qz1 + 0.2Qz2)
        const dsdTerm = Math.max(0.5 * F + 0.2 * Math.max(Qz1, Qz2), 0.4 * F + 0.2 * Qz1 + 0.2 * Qz2);
        return 0.1 * GAA + 0.1 * GrPA + dsdTerm;

      case "es_analog_lab":
      case "es_sensors_lab":
      case "es_dsd_lab":
        return calculateESStandardLab(values);

      default:
        return 0;
    }
  }

  // --- Data Science (DS) ---
  switch (subjectKey) {
    case "machinelearning":
      return calculateDSDiplomaStandard(values);

    case "ml_techniques":
      // 0.05 GAA + max(0.6F + 0.25max(Qz), 0.4F + 0.25Qz1 + 0.3Qz2) + Bonus
      const mltTerm = Math.max(0.6 * F + 0.25 * Math.max(Qz1, Qz2), 0.4 * F + 0.25 * Qz1 + 0.3 * Qz2);
      return 0.05 * GAA + mltTerm + Bonus;

    case "machinelearning_practice":
      return 0.1 * GAA + 0.3 * F + 0.2 * OPPE1 + 0.2 * OPPE2 + 0.2 * KA;

    case "business_data_management":
      // GA + Qz2 + Timed + F
      return GA + Qz2 + Timed + F;

    case "business_analytics":
      // Qz (scaled to 20) + A + F + Bonus
      // Qz formula: 0.7 * Max + 0.3 * Min. Assuming inputs 0-100, we scale to 20.
      const qzRaw = 0.7 * Math.max(Qz1, Qz2) + 0.3 * Math.min(Qz1, Qz2);
      return (qzRaw * 0.2) + A + F + Bonus;

    case "programming_python": // PDSA
      // 0.05 GAA + 0.2 OP + 0.45 F + max(0.2max(Qz), 0.1Qz1 + 0.2Qz2)
      return 0.05 * GAA + 0.2 * OP + 0.45 * F + Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2);

    case "databasems":
      // 0.03 GAA2 + 0.02 GAA3 + 0.2 OP + 0.45 F + max(0.2max(Qz), 0.1Qz1 + 0.2Qz2)
      const { GAA2 = 0, GAA3 = 0 } = values;
      return 0.03 * GAA2 + 0.02 * GAA3 + 0.2 * OP + 0.45 * F + Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2);

    case "appdev1":
    case "appdev2":
      // 0.05 (GLA or GAA) + max(0.6F + 0.25max(Qz), 0.4F + 0.25Qz1 + 0.3Qz2)
      const scoreComp = (subjectKey === "appdev1" ? GLA : GAA);
      const appTerm = Math.max(0.6 * F + 0.25 * Math.max(Qz1, Qz2), 0.4 * F + 0.25 * Qz1 + 0.3 * Qz2);
      return 0.05 * scoreComp + appTerm;

    case "java_programming":
      // 0.05 GAA + 0.2 max(PE) + 0.45 F + max(0.2max(Qz), 0.1Qz1 + 0.2Qz2) + 0.1 min(PE)
      const termJava = Math.max(0.2 * Math.max(Qz1, Qz2), 0.1 * Qz1 + 0.2 * Qz2);
      return 0.05 * GAA + 0.2 * Math.max(PE1, PE2) + 0.45 * F + termJava + 0.1 * Math.min(PE1, PE2);

    case "systemcommands":
      // 0.05 GAA + 0.25 Qz1 + 0.3 OPPE + 0.3 F + 0.1 BPTA
      const { BPTA = 0 } = values;
      return 0.05 * GAA + 0.25 * Qz1 + 0.3 * (values.OPPE || 0) + 0.3 * F + 0.1 * BPTA;

    case "intro_dl_genai":
      return calculateDSDiplomaStandard(values);

    case "tools_data_science":
      return 0.1 * GAA + 0.9 * F;

    default:
      return 0;
  }
}

// ==========================================
// DEGREE LEVEL LOGIC
// ==========================================

export function calculateDegreeGrade(subjectKey: string, values: Record<string, number>): number {
  const { GAA = 0, GA = 0, Qz1 = 0, Qz2 = 0, Qz3 = 0, F = 0, Bonus = 0, 
          GP1 = 0, GP2 = 0, PP = 0, CP = 0, GP = 0, 
          OPPE1 = 0, OPPE2 = 0, GPA = 0, NPPE = 0, 
          NPPE1 = 0, NPPE2 = 0, NPPE3 = 0, Prog = 0, P = 0, V = 0, GRPa = 0, Viva = 0 } = values;

  // --- Electronic Systems (ES) ---
  if (subjectKey.startsWith("es_")) {
    switch (subjectKey) {
      case "es_comp_org":
      case "es_em_fields":
        return calculateESStandardTheory(values);

      case "es_epd":
        // T = 3*GAA + 0.5*(Qz1+Qz2) + 0.3*F
        // Inputs must be raw: GAA(10), Qz(40), F(100)
        return (GAA * 3) + 0.5 * (Qz1 + Qz2) + 0.3 * F;

      case "es_strategies":
        // 0.15 GAA + 0.25 GP + 0.25 Qz2 + 0.35 F
        return 0.15 * GAA + 0.25 * GP + 0.25 * Qz2 + 0.35 * F;

      case "es_embedded_linux":
      case "es_testing":
        // 0.2 GAA + max(0.5F + 0.2max(Qz), 0.4F + 0.2Qz1 + 0.2Qz2)
        const embLinTerm = Math.max(0.5 * F + 0.2 * Math.max(Qz1, Qz2), 0.4 * F + 0.2 * Qz1 + 0.2 * Qz2);
        return 0.2 * GAA + embLinTerm;

      case "es_embedded_linux_lab":
        // 20 (Attendance) + 0.8 * Viva
        return 20 + 0.8 * Viva;

      default:
        return 0;
    }
  }

  // --- Data Science (DS) ---
  switch (subjectKey) {
    case "software_engineering":
      // 0.05 GAA + 0.2 Qz2 + 0.4 F + 0.1 GP1 + 0.1 GP2 + 0.1 PP + 0.05 CP
      return 0.05 * GAA + 0.2 * Qz2 + 0.4 * F + 0.1 * GP1 + 0.1 * GP2 + 0.1 * PP + 0.05 * CP;

    case "software_testing":
    case "deep_learning_cv":
    case "corporate_finance":
    case "big_data_bio":
    case "statistical_computing":
    case "theory_computation":
    case "operating_systems":
      return calculateDSDiplomaStandard(values);

    case "deep_learning":
    case "ai_search":
      return calculateDSDiplomaStandard(values) + Bonus;

    case "strat_prof_growth":
      return 0.15 * GAA + 0.25 * GP + 0.25 * Qz2 + 0.35 * F;

    case "int_bigdata":
      // 0.1 GAA + 0.3 F + 0.2 OP1 + 0.4 OP2 + Bonus
      return 0.1 * GAA + 0.3 * F + 0.2 * OPPE1 + 0.4 * OPPE2 + Bonus;

    case "mlops":
      // 0.2 GAA + 0.3 F + 0.25 OP1 + 0.25 OP2 + Bonus
      return Math.min(100, 0.2 * GAA + 0.3 * F + 0.25 * OPPE1 + 0.25 * OPPE2 + Bonus);

    case "c_prog":
      // 0.1 GAA + 0.2 Qz1 + 0.2 OP1 + 0.2 OP2 + 0.3 F
      return 0.10 * GAA + 0.20 * Qz1 + 0.20 * OPPE1 + 0.20 * OPPE2 + 0.30 * F;

    case "deep_learning_practice":
      // 0.05 GA + 0.15 (Qz1+Qz2+Qz3) + 0.25 NPPE_Avg + 0.25 Viva
      const nppeAvg = (NPPE1 + NPPE2 + NPPE3) / 3;
      return 0.05 * GA + 0.15 * Qz1 + 0.15 * Qz2 + 0.15 * Qz3 + 0.25 * nppeAvg + 0.25 * Viva;

    case "special_topics_ml":
      // 0.05 GAA + 0.25 GPA + 0.2 Qz1 + 0.2 Qz2 + 0.3 F + Bonus
      return 0.05 * GAA + 0.25 * GPA + 0.2 * Qz1 + 0.2 * Qz2 + 0.3 * F + Bonus;

    case "computer_networks":
      // 0.1 GAA + 0.3 F + 0.25 Qz1 + 0.25 Qz2 + 0.1 Prog
      return 0.1 * GAA + 0.3 * F + 0.25 * Qz1 + 0.25 * Qz2 + 0.1 * Prog;

    case "ds_ai_lab":
      // 0.15 GAA + 0.2 Qz2 + 0.5 P + 0.15 V + Bonus
      return 0.15 * GAA + 0.2 * Qz2 + 0.5 * P + 0.15 * V + Bonus;

    case "app_dev_lab":
      // 0.2 Qz2 + 0.3 GA + 0.5 V
      return 0.2 * Qz2 + 0.3 * GA + 0.5 * V;

    case "algo_thinking_bio":
      // 0.075 GAA + 0.025 GRPa + 0.25 Qz1 + 0.25 Qz2 + 0.4 F
      return 0.075 * GAA + 0.025 * GRPa + 0.25 * Qz1 + 0.25 * Qz2 + 0.4 * F;

    case "market_research":
      // 0.1 GAA + 0.2 Qz1 + 0.2 Qz2 + 0.25 P + 0.25 F
      return 0.1 * GAA + 0.2 * Qz1 + 0.2 * Qz2 + 0.25 * P + 0.25 * F;

    case "advanced_algorithms":
      // 0.15 GAA + max(0.2Qz1 + 0.2Qz2 + 0.45F, 0.5F + 0.25max(Qz))
      const advTerm = Math.max(0.2 * Qz1 + 0.2 * Qz2 + 0.45 * F, 0.5 * F + 0.25 * Math.max(Qz1, Qz2));
      return 0.15 * GAA + advTerm;

    case "speech_technology":
      // 0.15 GAA + 0.15 V + 0.3 F + 0.2 Qz1 + 0.2 Qz2
      return 0.15 * GAA + 0.15 * V + 0.3 * F + 0.2 * Qz1 + 0.2 * Qz2;

    case "math_foundations_genai":
      // 0.05 GAA + 0.35 F + 0.2 Qz1 + 0.2 Qz2 + 0.2 NPPE
      return 0.05 * GAA + 0.35 * F + 0.2 * Qz1 + 0.2 * Qz2 + 0.2 * NPPE;

    default:
      return 0;
  }
}

// ==========================================
// UTILITIES
// ==========================================

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
