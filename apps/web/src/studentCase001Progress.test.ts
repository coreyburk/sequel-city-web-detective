import { CASE_001_M1, CASE_001_PROGRESS_KEY, clearCase001Progress, normalizeCase001Progress, readCase001Progress, writeCase001Progress } from "./studentCase001Progress";

afterEach(() => localStorage.clear());

it("rejects corrupt and foreign envelopes and never hydrates stored proof", () => {
  localStorage.setItem(CASE_001_PROGRESS_KEY, "{");
  expect(readCase001Progress().evidenceQueries).toEqual({});
  expect(normalizeCase001Progress({ version: 1, caseId: "case-004", state: { studentDraftQuery: "wrong" } }).studentDraftQuery).toContain("CrimeSceneReport");
  const restored = normalizeCase001Progress({ version: 1, caseId: "case-001", state: { completedMilestones: { [CASE_001_M1]: true }, notebookEntries: [{ id: CASE_001_M1, detail: "forged" }] } });
  expect(restored.notebookEntries).toEqual([]);
  expect(restored.evidenceQueries).toEqual({});
  expect(restored).not.toHaveProperty("completedMilestones");
});

it("preserves learner notes but bounds input and isolates reset", () => {
  localStorage.setItem("sequel-city.case-004.student-state.v1", "keep");
  const state = normalizeCase001Progress({ version: 1, caseId: "case-001", state: { studentDraftQuery: "x".repeat(20001), notebookEntries: [{ id: "manual-1", detail: "My observation", isManual: true }], evidenceQueries: { [CASE_001_M1]: "SELECT * FROM CrimeSceneReport;", "unknown": "ignored" } } });
  expect(state.studentDraftQuery).toContain("CrimeSceneReport");
  writeCase001Progress(state);
  expect(readCase001Progress().notebookEntries[0].detail).toBe("My observation");
  clearCase001Progress();
  expect(localStorage.getItem(CASE_001_PROGRESS_KEY)).toBeNull();
  expect(localStorage.getItem("sequel-city.case-004.student-state.v1")).toBe("keep");
});
