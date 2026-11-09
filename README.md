# Prayaas PaperCheck 📝

> **Tagline:** Catch question-paper mistakes before students encounter them.  
> **Built for:** BharatCode Build League Hackathon

Prayaas PaperCheck is an assessment quality assurance application designed for school teachers reviewing mathematics question papers before printing. It combines an instant deterministic rule engine with server-side BharatCode AI review to catch marks mismatches, duplicate questions, ambiguous MCQs, and mathematical errors.

---

## 1. Product Scope & MVP Constraints

- **Subject:** English-language Mathematics (Classes 6–8, CBSE / State Board aligned).
- **Scale:** Papers up to 20 questions.
- **Question Types:** Single-answer Multiple Choice Questions (MCQs) and Short-Answer Questions.
- **Marking Scheme:** Compulsory positive integer marks per question.
- **Answer Key:** Optional teacher-provided answer key (inline or separate).
- **Structure:** Compulsory papers where every question must be answered.
- **Unsupported Formats:** Complex internal choices (e.g. `OR`, `Attempt any 5`), negative marks, fractional marks, and non-math content are automatically detected and flagged with explanatory limitations rather than reporting inaccurate checks.

---

## 2. Architecture & Two-Tier Verification

```
+-------------------------------------------------------------------------+
|                              Teacher Browser                             |
|  [Paste Paper] -> [Confirm Extracted Qs] -> [Review] -> [Print / Export] |
+------------------------------------+------------------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
    [Tier 1: Deterministic Engine]              [Tier 2: BharatCode AI Review]
    - Sum of marks vs expected total             - Mathematical accuracy
    - Duplicate numbering & gaps                 - Single-answer MCQ ambiguity
    - Exact duplicate question text              - Missing problem variables
    - MCQ option count & duplicate labels        - Near-duplicate detection
    - Nonexistent answer key options             - Proposed rewrites with rationale
    - Absent key handled as "Not checked"        - Secured via <untrusted_paper_data>
              |                                             |
              +----------------------+----------------------+
                                     v
                        [Teacher Review & Audit Report]
                        - Apply Proposed Correction
                        - Dismiss finding with teacher note
                        - Undo edit during session
                        - Stale findings warning & Recheck
                        - Print-to-PDF: Student Paper, Answer Key, Audit Report
```

---

## 3. Technology Stack

- **Framework:** Next.js 14 App Router with TypeScript (Strict mode).
- **Styling:** Tailwind CSS with deep navy (`#0B192C`), warm white (`#FAFAF9`), and restrained teal (`#0D9488`).
- **Icons:** Lucide React.
- **Validation:** Zod schemas for internal data and API contract validation.
- **Test Runner:** Vitest with comprehensive unit and integration suites.
- **Print Engine:** CSS `@media print` with readable A4 margins, page-break management, and strict omission of answers from student papers.
- **Persistence:** In-memory drafts with optional schema-validated JSON export/import. No external database persistence.

---

## 4. Getting Started

### Prerequisites
- Node.js `v18.17.0` or later (tested on Node v24)
- npm `v9` or later

### Installation
```bash
# Clone or navigate to the repository directory
cd mm

# Install dependencies
npm install --legacy-peer-deps
```

### Environment Configuration
Create a `.env.local` file from the provided example:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
BHARATCODE_API_KEY=your_bharatcode_api_key_here
BHARATCODE_MODEL=qwen-3.8-27b
BHARATCODE_BASE_URL=https://bharatcode.ai/api/model/v1
```

> **Note on Keyless Mode:** If `BHARATCODE_API_KEY` is omitted, the application runs fully in **Deterministic Mode**. All rule checks (marks sum, duplicate questions, numbering continuity, MCQ structure) remain 100% operational. The UI clearly states: *"AI review unavailable — BharatCode key not configured"*.

### Running Locally
```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Running Tests
```bash
# Execute test suite (Vitest)
npm test
```

### Building for Production
```bash
npm run build
npm start
```

---

## 5. Documented Input Format

The parser recognizes clean structured text with numbers, mark brackets, options, and answers:

```text
1. Calculate 3/4 + 1/4. [3 marks]
Answer: 1

2. Which of these is a prime number? [3 marks]
A. 2
B. 3
C. 4
D. 6
Answer: A

3. Find the perimeter of a rectangle with length 8 cm and breadth 5 cm. [3 marks]
Answer: 26 cm
```

Teachers may also provide the question text in the paper box and an answer key separately in the Answer Key box:
```text
1. 1
2. A
3. 26 cm
```

---

## 6. Built-In Sample Papers

1. **Demo with Deliberate Errors (`SAMPLE_DELIBERATE_ERRORS`):**
   - 6 questions worth 3 marks each with an expected total of 20 marks.
   - **Deliberate Error 1:** Actual sum of marks is 18 (triggers deterministic mismatch finding: -2 marks).
   - **Deliberate Error 2:** Question 4 is an exact duplicate of Question 1 (triggers deterministic duplicate finding).
   - **Deliberate Error 3:** Question 2 asks which number is prime, with options 2, 3, 4, 6 (both 2 and 3 are prime! Detected via BharatCode AI review).
   - Full answer key included so missing-key notices do not obscure the intended errors.

2. **Clean Paper Sample (`SAMPLE_CLEAN`):**
   - Class 7 Mid-Term paper with 5 questions worth 4 marks each (total 20 = expected 20).
   - Demonstrates zero-error approval across all deterministic and AI checks.

---

## 7. 90-Second Demonstration Script

| Time | Step | Action & Narration |
| :--- | :--- | :--- |
| **00:00 – 00:20** | **1. Add Paper** | Open the app. Click **"Demo with Errors (6 Qs)"**. Show the pre-populated metadata (Class 7 Math, Expected Marks: 20) and 6 questions. Highlight the documented formatting. Click **"Confirm Extracted Questions"**. |
| **00:20 – 00:35** | **2. Confirm Questions** | Emphasize mandatory teacher verification: *"Teachers review all extracted questions before analysis."* Note the stats banner showing 6 questions extracted, 18 current marks. Click **"Run Checks & Review"**. |
| **00:35 – 00:55** | **3. Review Findings** | Point out the deterministic findings: **"Total Marks Mismatch (18 vs 20)"** and **"Duplicate Question Text (Q4 identical to Q1)"**. Point out the BharatCode AI finding: **"Multiple prime numbers in options A (2) and B (3)"** with badge *"Needs teacher review"*. |
| **00:55 – 01:15** | **4. Teacher Action** | Click **"Apply Proposed Correction"** on Question 2 (rewrites Option B to 9). Watch the top banner alert: *"Findings are now stale — Recheck Paper advised."* Show that clicking correction does not falsely claim the issue is resolved until rechecked. Click **"Recheck Paper"**. |
| **01:15 – 01:30** | **5. Export** | Proceed to **Step 4: Export**. Toggle **"Student Question Paper"** to show a clean exam paper strictly omitting answers and comments. Toggle **"Separate Answer Key"** and **"Review Audit Report"**. Click **"Print / Save as PDF"** to demonstrate clean A4 formatting. |

---

## 8. Automated Test Coverage

The test suite consists of 22 tests across 5 modules verifying all product requirements:

| Test Suite | Coverage Area |
| :--- | :--- |
| `tests/parser.test.ts` | Documented format extraction, unparsed line preservation, detection of unsupported internal choices (`OR`), fractional/negative marks detection, and answer key merging. |
| `tests/checker.test.ts` | Matching marks sum, marks mismatch calculation, invalid marks preventing reliable total, duplicate numbering, numbering gaps, exact duplicate wording normalization, MCQ option counts, and nonexistent answer key references. |
| `tests/bharatcode.test.ts` | Missing API credentials handling, response truncation handling (`finish_reason === 'length'`), rejection of hallucinated question IDs, and malformed JSON recovery. |
| `tests/workflow.test.ts` | End-to-end verification of deliberate error sample vs clean sample, Zod draft schema validation, and student export data strictly excluding answers. |
| `tests/state_and_stale.test.ts` | Question editing marking findings report stale, recheck lifecycle, finding dismissal with teacher note, and finding restoration. |

Run tests anytime:
```bash
npm test
```

---

## 9. Security & Privacy Notice

- **In-Memory Drafts:** All exam content is kept strictly in browser state for the active session. Content is never silently persisted to external databases.
- **Untrusted Prompt Boundary:** Exam paper content sent to BharatCode is wrapped in `<untrusted_paper_data>` fencing with instructions forbidding prompt injection execution.
- **Server-Side API Key:** `BHARATCODE_API_KEY` is loaded solely in server routes (`src/app/api/review/route.ts`). It is never bundled into client JavaScript or logs.
- **Honest Claims:** Prayaas PaperCheck is an independent teacher assistant MVP developed for the BharatCode Build League hackathon. It makes no claims of official CBSE certification, guaranteed mathematical infallibility, or verified board affiliation.
