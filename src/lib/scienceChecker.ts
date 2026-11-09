import {
  Question,
  PaperMetadata,
  Finding,
  CheckReport,
} from "@/types/paper";
import { runDeterministicChecks } from "./checker";

// Common scientific quantities and unit patterns
const SCIENTIFIC_UNITS = [
  "m/s",
  "m/s²",
  "ms^-1",
  "ms^-2",
  "km/h",
  "cm/s",
  "m",
  "cm",
  "mm",
  "km",
  "kg",
  "g",
  "mg",
  "n",
  "newton",
  "newtons",
  "j",
  "joule",
  "joules",
  "w",
  "watt",
  "watts",
  "kw",
  "pa",
  "pascal",
  "kpa",
  "atm",
  "v",
  "volt",
  "volts",
  "a",
  "amp",
  "ampere",
  "amperes",
  "ma",
  "ohm",
  "ohms",
  "ω",
  "hz",
  "khz",
  "mhz",
  "s",
  "sec",
  "second",
  "seconds",
  "min",
  "minutes",
  "h",
  "hr",
  "hours",
  "°c",
  "k",
  "kelvin",
  "g/cm³",
  "kg/m³",
  "g/cm3",
  "kg/m3",
  "mol",
  "moles",
];

// Malformed chemical formula regexes (lowercase elements like co2, h2o, nacl, etc.)
const MALFORMED_FORMULA_REGEX =
  /\b(?:co2|h2o|cacl2|nacl|fe2o3|h2so4|ch4|hcl|naoh|c6h12o6|mgcl2|caco3|kcl|agno3|al2o3|no2|so2)\b/;

// Well-known unbalanced simple equations
const UNBALANCED_EQUATIONS = [
  { raw: /H2\s*\+\s*O2\s*(?:->|→|=)\s*H2O\b/i, balanced: "2H₂ + O₂ → 2H₂O" },
  { raw: /Mg\s*\+\s*O2\s*(?:->|→|=)\s*MgO\b/i, balanced: "2Mg + O₂ → 2MgO" },
  { raw: /Na\s*\+\s*Cl2\s*(?:->|→|=)\s*NaCl\b/i, balanced: "2Na + Cl₂ → 2NaCl" },
  { raw: /C\s*\+\s*O2\s*(?:->|→|=)\s*CO\b/i, balanced: "2C + O₂ → 2CO" },
  { raw: /Fe\s*\+\s*O2\s*(?:->|→|=)\s*Fe2O3\b/i, balanced: "4Fe + 3O₂ → 2Fe₂O₃" },
  { raw: /N2\s*\+\s*H2\s*(?:->|→|=)\s*NH3\b/i, balanced: "N₂ + 3H₂ → 2NH₃" },
];

// Figure / diagram / table citations
const MISSING_DIAGRAM_REGEX =
  /\b(?:in\s+the\s+(?:given\s+)?(?:figure|diagram|circuit|illustration|graph|table)\s+below|as\s+shown\s+in\s+the\s+(?:figure|diagram|circuit|graph|table)|from\s+the\s+(?:figure|diagram|table)\s+below)\b/i;

/**
 * Executes science-specific deterministic rules in addition to standard checks.
 */
export function runScienceChecks(
  questions: Question[],
  metadata: PaperMetadata,
  unsupportedFeatures: string[] = []
): CheckReport {
  // First run shared base checks (marks arithmetic, duplicate numbers, duplicate text, MCQ options)
  const baseReport = runDeterministicChecks(questions, metadata, unsupportedFeatures);

  const scienceFindings: Finding[] = [];
  const scienceChecksPerformed = [
    "Science: Numerical units and question-answer unit consistency",
    "Science: Chemical formula capitalization and bracket balancing",
    "Science: Chemical equation stoichiometry & balance",
    "Science: Diagram/figure/table citation availability",
  ];

  for (const q of questions) {
    const qText = q.text.trim();
    const ansKey = q.answerKey?.trim() || "";

    // 1. Missing or inconsistent units check
    // If the question is a calculation question with numerical answer or asks for a specific unit
    const asksForUnitMatch = qText.match(
      /\b(?:in\s+([a-zA-Z°Ω/³^]+)|speed|velocity|acceleration|force|work|power|current|resistance|voltage|frequency|pressure|mass|density|temperature)\b/i
    );

    if (q.type === "short_answer" && ansKey) {
      // Check if answer is purely numeric without any units
      const isPureNumber = /^[+-]?\d+(?:\.\d+)?$/.test(ansKey);
      if (isPureNumber && asksForUnitMatch) {
        scienceFindings.push({
          id: `science-missing-unit-${q.id}`,
          questionId: q.id,
          questionNumber: q.number,
          source: "rule",
          severity: "warning",
          title: `Question ${q.number}: Numerical Answer Lacks Physical Units`,
          relevantText: `Answer key: "${ansKey}" (Question asks for physical quantity: "${asksForUnitMatch[0]}")`,
          explanation:
            "Science numerical problems require physical units (e.g. m/s, N, J, Ω, kg) in the answer key. A bare number without units is ambiguous.",
          needsTeacherReview: false,
        });
      }

      // Check for unit inconsistency between question and answer
      // e.g. question asks for answer "in m/s" or "in meters", but answer key provides "km/h" or "cm"
      const questionUnitMatch = qText.match(
        /\bin\s+(m\/s|km\/h|m|cm|km|newtons?|n|joules?|j|watts?|w|ohms?|ω|seconds?|s|hours?|hr)\b/i
      );
      if (questionUnitMatch) {
        const expectedUnit = questionUnitMatch[1].toLowerCase();
        const ansHasUnit = SCIENTIFIC_UNITS.some((u) =>
          ansKey.toLowerCase().includes(u)
        );
        if (ansHasUnit && !ansKey.toLowerCase().includes(expectedUnit)) {
          // Check specific known conflicting pairs (e.g. m/s vs km/h, m vs cm)
          if (
            (expectedUnit === "m/s" && ansKey.toLowerCase().includes("km/h")) ||
            (expectedUnit === "m" && ansKey.toLowerCase().includes("cm")) ||
            (expectedUnit === "km/h" && ansKey.toLowerCase().includes("m/s"))
          ) {
            scienceFindings.push({
              id: `science-unit-mismatch-${q.id}`,
              questionId: q.id,
              questionNumber: q.number,
              source: "rule",
              severity: "error",
              title: `Question ${q.number}: Unit Inconsistency Between Question & Answer Key`,
              relevantText: `Question specifies "in ${expectedUnit}" | Answer key provides "${ansKey}"`,
              explanation: `The question explicitly requests the solution in ${expectedUnit}, but the answer key specifies a different unit.`,
              needsTeacherReview: false,
            });
          }
        }
      }
    }

    // 2. Malformed or ambiguous chemical formulas
    // Check question text, options, subparts, and answer key
    const optionsText = q.options.map((o) => o.text).join(" ");
    const subPartsText = (q.subParts || []).map((sp) => sp.text).join(" ");
    const fullText = `${qText} ${optionsText} ${subPartsText} ${ansKey}`;
    const malformedFormulaMatch = fullText.match(MALFORMED_FORMULA_REGEX);
    if (malformedFormulaMatch) {
      const wrong = malformedFormulaMatch[0];
      const correct = wrong.toUpperCase();
      scienceFindings.push({
        id: `science-formula-casing-${q.id}`,
        questionId: q.id,
        questionNumber: q.number,
        source: "rule",
        severity: "error",
        title: `Question ${q.number}: Malformed Chemical Formula ("${wrong}")`,
        relevantText: `Found lowercase chemical formula: "${wrong}"`,
        explanation: `Element symbols must follow IUPAC capitalization. Chemical symbols cannot be written in all-lowercase (e.g. write "${correct}" instead of "${wrong}").`,
        proposedCorrection: {
          field: "text",
          newValue: qText.replace(new RegExp(`\\b${wrong}\\b`, "g"), correct),
          label: `Capitalize chemical formula to "${correct}"`,
        },
        needsTeacherReview: false,
      });
    }

    // Unbalanced brackets in formulas e.g. Ca(OH2 or (NH4)2SO4)
    const openParenCount = (fullText.match(/\(/g) || []).length;
    const closeParenCount = (fullText.match(/\)/g) || []).length;
    if (openParenCount !== closeParenCount && /\b[A-Z][a-z]?\s*[\(\)]/.test(fullText)) {
      scienceFindings.push({
        id: `science-unbalanced-brackets-${q.id}`,
        questionId: q.id,
        questionNumber: q.number,
        source: "rule",
        severity: "error",
        title: `Question ${q.number}: Unbalanced Parentheses in Chemical Formula`,
        relevantText: `Parentheses count mismatch: ${openParenCount} '(' vs ${closeParenCount} ')'`,
        explanation:
          "A chemical formula or compound notation contains unmatched brackets or parentheses.",
        needsTeacherReview: false,
      });
    }

    // 3. Unbalanced simple chemical equations in answer key
    if (ansKey) {
      for (const eq of UNBALANCED_EQUATIONS) {
        if (eq.raw.test(ansKey)) {
          scienceFindings.push({
            id: `science-unbalanced-equation-${q.id}`,
            questionId: q.id,
            questionNumber: q.number,
            source: "rule",
            severity: "error",
            title: `Question ${q.number}: Unbalanced Chemical Equation in Answer Key`,
            relevantText: `Answer key contains unbalanced equation: "${ansKey}"`,
            explanation: `The chemical equation in the answer key violates conservation of mass and is not balanced. Balanced form: ${eq.balanced}.`,
            proposedCorrection: {
              field: "answerKey",
              newValue: eq.balanced,
              label: `Replace with balanced equation: ${eq.balanced}`,
            },
            needsTeacherReview: false,
          });
          break;
        }
      }
    }

    // 4. Missing diagram / figure citation
    if (MISSING_DIAGRAM_REGEX.test(qText)) {
      scienceFindings.push({
        id: `science-missing-diagram-${q.id}`,
        questionId: q.id,
        questionNumber: q.number,
        source: "rule",
        severity: "warning",
        title: `Question ${q.number}: Missing Diagram / Figure Citation`,
        relevantText: `Question refers to: "${qText.match(MISSING_DIAGRAM_REGEX)?.[0]}"`,
        explanation:
          'The question references a diagram, circuit, or table ("in the figure below") that is not included in the text. Ensure diagrams are attached before printing.',
        needsTeacherReview: false,
      });
    }
  }

  return {
    ...baseReport,
    findings: [...baseReport.findings, ...scienceFindings],
    checksPerformed: [...baseReport.checksPerformed, ...scienceChecksPerformed],
  };
}
