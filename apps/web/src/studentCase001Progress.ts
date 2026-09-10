import type { EvidenceNotebookEntry, StudentView } from "./studentCase";
import type { Case001SqlMilestoneId } from "./studentCase001";

export const CASE_001_PROGRESS_KEY = "sequel-city.case-001.student-state.v1";
export const CASE_001_M1 = "case-001-clocktower-report-located";
export const CASE_001_M2 = "case-001-report-interviews-located";
export type Case001Progress = {
  studentView: StudentView;
  studentDraftQuery: string;
  manualNotebookDraft: string;
  notebookEntries: EvidenceNotebookEntry[];
  // References to re-execute, never stored proof of completion.
  evidenceQueries: Partial<Record<Case001SqlMilestoneId, string>>;
};

export function normalizeCase001Progress(raw: unknown): Case001Progress {
  const empty: Case001Progress = { studentView: "briefing", studentDraftQuery: "SELECT * FROM CrimeSceneReport;", manualNotebookDraft: "", notebookEntries: [], evidenceQueries: {} };
  if (!raw || typeof raw !== "object") return empty;
  const envelope = raw as Record<string, unknown>;
  if (envelope.version !== 1 || envelope.caseId !== "case-001" || !envelope.state || typeof envelope.state !== "object") return empty;
  const state = envelope.state as Record<string, unknown>;
  const text = (value: unknown, fallback = "") => typeof value === "string" && value.length <= 20000 ? value : fallback;
  const queries = state.evidenceQueries as Record<string, unknown> | undefined;
  const evidenceQueries: Case001Progress["evidenceQueries"] = {};
  for (const id of [CASE_001_M1, CASE_001_M2] as const) {
    if (queries && text(queries[id])) evidenceQueries[id] = text(queries[id]);
  }
  const notebookEntries: EvidenceNotebookEntry[] = [];
  if (Array.isArray(state.notebookEntries)) {
    for (const entry of state.notebookEntries.slice(0, 100)) {
      // Restore only learner-authored notes. Milestone notes come from fresh API evidence.
      if (entry && entry.isManual === true && typeof entry.id === "string" && entry.id.startsWith("manual-") && text(entry.detail)) {
        notebookEntries.push({ id: entry.id.slice(0, 100), detail: text(entry.detail), isManual: true, sourceLabel: "My notes" });
      }
    }
  }
  return {
    studentView: state.studentView === "workbench" || state.studentView === "case-board" ? state.studentView : "briefing",
    studentDraftQuery: text(state.studentDraftQuery, empty.studentDraftQuery),
    manualNotebookDraft: text(state.manualNotebookDraft), notebookEntries, evidenceQueries
  };
}

export function readCase001Progress(): Case001Progress {
  try {
    const raw = window.localStorage.getItem(CASE_001_PROGRESS_KEY);
    return normalizeCase001Progress(raw && raw.length <= 250000 ? JSON.parse(raw) : null);
  } catch { return normalizeCase001Progress(null); }
}

export function writeCase001Progress(state: Case001Progress): void {
  try { window.localStorage.setItem(CASE_001_PROGRESS_KEY, JSON.stringify({ version: 1, caseId: "case-001", state })); } catch { /* Continue in memory. */ }
}

export function clearCase001Progress(): void {
  try { window.localStorage.removeItem(CASE_001_PROGRESS_KEY); } catch { /* Reset still works in memory. */ }
}
