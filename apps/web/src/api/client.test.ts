import {
  API_BASE_URL,
  applyDatabaseUpgrade,
  clearQueryHistory,
  executeQuery,
  getFullHealth,
  getQueryHistory,
  getSchemaTables,
  verifySuspect
} from "./client";

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds the full health request path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), { status: 200 })
    );

    await getFullHealth();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/health/full`,
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
  });

  it("builds the admin bootstrap apply request path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            bootstrap: {
              mode: "apply",
              status: "ready",
              migrated: true,
              usedBootstrapCredentials: true,
              canApplyInApp: true,
              applyActionMessage: null,
              message: "Ready.",
              hasSchemaVersionTable: true,
              expectedMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
              currentMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
              pendingMigrationKeys: []
            }
          },
          message: "Classroom database upgrade completed."
        }),
        { status: 200 }
      )
    );

    await applyDatabaseUpgrade();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/admin/bootstrap/apply`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({})
      })
    );
  });

  it("builds the schema request path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { tables: [], relationships: [] } }),
        { status: 200 }
      )
    );

    await getSchemaTables();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/schema/tables`,
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
  });

  it("builds the query execution request path and body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { columns: [], rows: [], rowCount: 0 },
          safety: {
            isAllowed: true,
            normalizedStatementType: "SELECT",
            violations: [],
            message: "Safe."
          },
          executionTimeMs: 1,
          message: "Executed."
        }),
        { status: 200 }
      )
    );

    await executeQuery("SELECT 1");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/query/execute`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sql: "SELECT 1" })
      })
    );
  });

  it("builds the query execution request body with optional milestone metadata", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { columns: [], rows: [], rowCount: 0 },
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            evidenceTableFamily: "CrimeSceneReport",
            gate: {
              name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
              enabledValue: "true",
              isEnabled: true
            },
            evaluated: true,
            matched: false,
            matchedRowCount: 0,
            runtimeStatus: "evaluated-no-progression",
            milestoneAdvanced: false
          },
          safety: {
            isAllowed: true,
            normalizedStatementType: "SELECT",
            violations: [],
            message: "Safe."
          },
          executionTimeMs: 1,
          message: "Executed."
        }),
        { status: 200 }
      )
    );

    await executeQuery("SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080", {
      caseMilestoneEvaluation: {
        caseId: "case-001",
        milestoneId: "case-001-clocktower-report-located",
        isSkeletonGateEnabled: true
      }
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/query/execute`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          sql: "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            isSkeletonGateEnabled: true
          }
        })
      })
    );
  });

  it("accepts the M2 Case 001 milestone metadata response shape", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { columns: [], rows: [], rowCount: 0 },
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-report-interviews-located",
            evidenceTableFamily: "InterviewLog",
            gate: {
              name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
              enabledValue: "true",
              isEnabled: true
            },
            evaluated: true,
            matched: true,
            matchedRowCount: 3,
            runtimeStatus: "evaluated-no-progression",
            milestoneAdvanced: false
          },
          safety: {
            isAllowed: true,
            normalizedStatementType: "SELECT",
            violations: [],
            message: "Safe."
          },
          executionTimeMs: 1,
          message: "Executed."
        }),
        { status: 200 }
      )
    );

    const response = await executeQuery(
      "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975",
      {
        caseMilestoneEvaluation: {
          caseId: "case-001",
          milestoneId: "case-001-report-interviews-located",
          isSkeletonGateEnabled: true
        }
      }
    );

    expect(response.success).toBe(true);
    if (!response.success) {
      throw new Error("Expected query execution success.");
    }
    expect(response.caseMilestoneEvaluation).toMatchObject({
      milestoneId: "case-001-report-interviews-located",
      evidenceTableFamily: "InterviewLog",
      milestoneAdvanced: false
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/query/execute`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          sql: "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975",
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-report-interviews-located",
            isSkeletonGateEnabled: true
          }
        })
      })
    );
  });

  it("builds the query history request path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { records: [] } }),
        { status: 200 }
      )
    );

    await getQueryHistory();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/query/history`,
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
  });

  it("builds the clear query history request path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { clearedCount: 2 } }),
        { status: 200 }
      )
    );

    await clearQueryHistory();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/query/history`,
      expect.objectContaining({
        method: "DELETE"
      })
    );
  });

  it("builds the case verification request path and body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            suspect: "Ada Lovelace",
            verdict: "Database verdict",
            caseId: "case-004",
            isCorrect: true,
            solvedRole: "trigger_man",
            nextRole: "mastermind",
            suspectPersonId: 67318
          },
          message: "Suspect verification completed."
        }),
        { status: 200 }
      )
    );

    await verifySuspect("Ada Lovelace");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/case/verify-suspect`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ suspect: "Ada Lovelace" })
      })
    );
  });
});
