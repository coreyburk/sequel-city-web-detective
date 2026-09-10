import { act, renderHook, waitFor } from "@testing-library/react";
import { executeQuery, getSchemaTables } from "./api/client";
import type { QueryExecutionResponse, QueryRow } from "./api/types";
import { useStudentCaseState } from "./useStudentCaseState";
import { CASE_001_M1, CASE_001_M2, CASE_001_PROGRESS_KEY } from "./studentCase001Progress";

vi.mock("./api/client", () => ({ executeQuery: vi.fn(), getSchemaTables: vi.fn(), verifySuspect: vi.fn() }));
const row: QueryRow = { values: { ReportID: 123, LogTranscript: "arbitrary transcript" }, displayValues: { ReportID: "123", LogTranscript: "arbitrary transcript" } };
function response(id: typeof CASE_001_M1 | typeof CASE_001_M2): Extract<QueryExecutionResponse, { success: true }> {
  return { success: true, data: { rows: [row], columns: [], rowCount: 1 }, safety: { isAllowed: true, normalizedStatementType: "SELECT", violations: [], message: "Allowed" }, executionTimeMs: 1, message: "OK", caseMilestoneEvaluation: { caseId: "case-001", milestoneId: id, evidenceTableFamily: id === CASE_001_M1 ? "CrimeSceneReport" : "InterviewLog", gate: { name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON", enabledValue: "true", isEnabled: true }, evaluated: true, matched: true, matchedRowCount: 1, runtimeStatus: "evaluated-no-progression", milestoneAdvanced: false } };
}

beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks(); vi.stubEnv("VITE_ENABLE_CASE_001_PLAYABLE_SKELETON", "true");
  vi.mocked(getSchemaTables).mockResolvedValue({ success: true, data: { tables: [], relationships: [] } } as never);
});
afterEach(() => vi.unstubAllEnvs());

it("rejects arbitrary row clicks and M2 before the report", async () => {
  const { result } = renderHook(() => useStudentCaseState("student", "case-001"));
  await act(async () => {});
  act(() => { result.current.handleStudentEvidenceLog(row); });
  expect(result.current.completedCount).toBe(0);
  act(() => result.current.handleQueryExecutionComplete({ sql: "SELECT * FROM InterviewLog", response: response(CASE_001_M2), error: null }));
  expect(result.current.completedCount).toBe(0);
  act(() => result.current.handleQueryExecutionComplete({ sql: "SELECT * FROM CrimeSceneReport", response: response(CASE_001_M1), error: null }));
  act(() => result.current.handleQueryExecutionComplete({ sql: "SELECT * FROM InterviewLog", response: response(CASE_001_M2), error: null }));
  expect(result.current.completedCount).toBe(2);
});

it("revalidates saved query references instead of trusting completion flags", async () => {
  localStorage.setItem(CASE_001_PROGRESS_KEY, JSON.stringify({ version: 1, caseId: "case-001", state: { completedMilestones: { [CASE_001_M1]: true, [CASE_001_M2]: true }, evidenceQueries: { [CASE_001_M1]: "SELECT 1" } } }));
  vi.mocked(executeQuery).mockResolvedValue({ ...response(CASE_001_M1), caseMilestoneEvaluation: undefined });
  const { result } = renderHook(() => useStudentCaseState("student", "case-001"));
  await waitFor(() => expect(executeQuery).toHaveBeenCalledOnce());
  expect(result.current.completedCount).toBe(0);
});

it("ignores an in-flight restore response after reset", async () => {
  localStorage.setItem(CASE_001_PROGRESS_KEY, JSON.stringify({ version: 1, caseId: "case-001", state: { evidenceQueries: { [CASE_001_M1]: "SELECT * FROM CrimeSceneReport" } } }));
  let resolve!: (value: QueryExecutionResponse) => void;
  vi.mocked(executeQuery).mockReturnValue(new Promise(done => { resolve = done; }));
  const { result } = renderHook(() => useStudentCaseState("student", "case-001"));
  await waitFor(() => expect(executeQuery).toHaveBeenCalledOnce());
  act(() => result.current.resetStudentCaseProgress());
  await act(async () => resolve(response(CASE_001_M1)));
  expect(result.current.completedCount).toBe(0);
  expect(localStorage.getItem(CASE_001_PROGRESS_KEY)).toBeNull();
});

