const assert = require("node:assert/strict") as typeof import("node:assert/strict");

type AsyncTestCase = {
  name: string;
  run: () => Promise<void>;
};

const testCases: AsyncTestCase[] = [
  {
    name: "empty SQL returns blocked execution result",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();

      const result = await queryExecutionService.executeSafeQuery("   ");
      const history = queryHistoryService.getQueryHistoryRecords();

      assert.equal(result.success, false);
      assert.equal(result.safety.isAllowed, false);
      assert.equal(result.safety.violations[0]?.code, "EMPTY_SQL");
      assert.equal("data" in result, false);
      assert.equal("rows" in result, false);
      assert.equal("columns" in result, false);
      assert.equal("rowCount" in result, false);
      assert.equal("caseMilestoneEvaluation" in result, false);
      assert.equal(history.length, 1);
      assert.equal(history[0]?.outcome, "blocked");
      assert.equal(history[0]?.queryText, "   ");
      assert.equal(history[0]?.rowCount, null);
    }
  },
  {
    name: "DELETE statements are blocked without requiring a database connection",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const result = await queryExecutionService.executeSafeQuery(
        "DELETE FROM PersonsOfInterest"
      );

      assert.equal(result.success, false);
      assert.equal(result.safety.isAllowed, false);
      assert.equal(result.safety.normalizedStatementType, "DELETE");
      assert.equal(result.safety.violations[0]?.code, "DISALLOWED_STATEMENT");
      assert.equal("data" in result, false);
      assert.equal("rows" in result, false);
      assert.equal("columns" in result, false);
      assert.equal("rowCount" in result, false);
      assert.equal("caseMilestoneEvaluation" in result, false);
    }
  },
  {
    name: "blocked SQL returns the safety result and blocked message",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const result = await queryExecutionService.executeSafeQuery(
        "DELETE FROM PersonsOfInterest"
      );

      assert.equal(result.success, false);
      assert.equal(result.safety.isAllowed, false);
      assert.match(result.message, /^Query blocked:/);
    }
  },
  {
    name: "restricted student tables are blocked before query execution",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();

      let executorCallCount = 0;
      const result = await queryExecutionService.executeSafeQuery(
        "SELECT * FROM dbo.Solution",
        async () => {
          executorCallCount += 1;
          return [];
        }
      );
      const history = queryHistoryService.getQueryHistoryRecords();

      assert.equal(executorCallCount, 0);
      assert.equal(result.success, false);
      assert.equal(result.safety.isAllowed, false);
      assert.equal(result.safety.normalizedStatementType, "SELECT");
      assert.equal(result.safety.violations[0]?.code, "RESTRICTED_TABLE");
      assert.equal(result.safety.violations[0]?.token, "Solution");
      assert.match(result.message, /^Query blocked:/);
      assert.equal("data" in result, false);
      assert.equal("caseMilestoneEvaluation" in result, false);
      assert.equal(history.length, 1);
      assert.equal(history[0]?.outcome, "blocked");
      assert.equal(history[0]?.rowCount, null);
    }
  },
  {
    name: "restricted student tables are blocked in bracketed joins subqueries and CTEs",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const blockedQueries = [
        "SELECT * FROM [dbo].[CaseAnswerKey]",
        "SELECT p.PersonName FROM PersonsOfInterest p JOIN Solution s ON s.Suspect = p.PersonName",
        "SELECT * FROM PersonsOfInterest WHERE PersonID IN (SELECT SuspectPersonID FROM CaseAnswerKey)",
        "WITH answers AS (SELECT * FROM dbo.Solution) SELECT * FROM answers"
      ];

      for (const sql of blockedQueries) {
        let executorCallCount = 0;
        const result = await queryExecutionService.executeSafeQuery(
          sql,
          async () => {
            executorCallCount += 1;
            return [];
          }
        );

        assert.equal(executorCallCount, 0);
        assert.equal(result.success, false);
        assert.equal(result.safety.violations[0]?.code, "RESTRICTED_TABLE");
        assert.equal("caseMilestoneEvaluation" in result, false);
      }
    }
  },
  {
    name: "successful execution returns the normalized response shape under data",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();
      const occurredAt = new Date("2024-01-02T03:04:05.678Z");
      const recordset = [
        {
          suspectName: "Ada",
          clueCount: 3,
          isSolved: true,
          occurredAt,
          notes: null,
          payload: { area: "North Pier" }
        }
      ] as import("./queryResultNormalizer").QueryRecordset;

      recordset.columns = {
        suspectName: { name: "suspectName" },
        clueCount: { name: "clueCount" },
        isSolved: { name: "isSolved" },
        occurredAt: { name: "occurredAt" },
        notes: { name: "notes" },
        payload: { name: "payload" }
      };

      const result = await queryExecutionService.executeSafeQuery(
        "SELECT suspectName, clueCount, isSolved, occurredAt, notes, payload FROM CaseFiles",
        async () => recordset
      );

      assert.equal(result.success, true);
      assert.equal(result.safety.isAllowed, true);
      assert.ok("data" in result);
      assert.equal("columns" in result, false);
      assert.equal("rows" in result, false);
      assert.equal("rowCount" in result, false);
      assert.equal("caseMilestoneEvaluation" in result, false);
      assert.equal(result.data.rowCount, 1);
      assert.deepEqual(result.data.columns, [
        { name: "suspectName", ordinal: 0, dataType: "string" },
        { name: "clueCount", ordinal: 1, dataType: "number" },
        { name: "isSolved", ordinal: 2, dataType: "boolean" },
        { name: "occurredAt", ordinal: 3, dataType: "date" },
        { name: "notes", ordinal: 4, dataType: "null" },
        { name: "payload", ordinal: 5, dataType: "unknown" }
      ]);
      assert.deepEqual(result.data.rows, [
        {
          values: {
            suspectName: "Ada",
            clueCount: 3,
            isSolved: true,
            occurredAt: occurredAt.toISOString(),
            notes: null,
            payload: null
          },
          displayValues: {
            suspectName: "Ada",
            clueCount: "3",
            isSolved: "true",
            occurredAt: occurredAt.toISOString(),
            notes: "",
            payload: "[object Object]"
          }
        }
      ]);
      assert.equal(result.message, "Query executed successfully.");

      const history = queryHistoryService.getQueryHistoryRecords();
      assert.equal(history.length, 1);
      assert.equal(history[0]?.outcome, "success");
      assert.equal(history[0]?.rowCount, 1);
      assert.equal(history[0]?.errorMessage, null);
    }
  },
  {
    name: "successful execution includes Case 001 metadata only for explicit enabled milestone opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();

      let evaluatorCallCount = 0;
      const result = await queryExecutionService.executeSafeQuery(
        "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
        async () => createClocktowerReportRecordset(),
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            isSkeletonGateEnabled: true
          },
          evaluateCase001Milestone: (request) => {
            evaluatorCallCount += 1;
            assert.equal(request.caseId, "case-001");
            assert.equal(request.milestoneId, "case-001-clocktower-report-located");
            assert.equal(request.isSkeletonGateEnabled, true);
            assert.equal(request.queryResult.rowCount, 1);

            return {
              caseId: "case-001",
              milestoneId: "case-001-clocktower-report-located",
              evidenceTableFamily: "CrimeSceneReport",
              gate: {
                name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
                enabledValue: "true",
                isEnabled: true
              },
              evaluated: true,
              matched: true,
              matchedRowCount: 1,
              runtimeStatus: "evaluated-no-progression",
              milestoneAdvanced: false
            };
          }
        }
      );
      const history = queryHistoryService.getQueryHistoryRecords();

      assert.equal(evaluatorCallCount, 1);
      assert.equal(result.success, true);
      assert.deepEqual(result.caseMilestoneEvaluation, {
        caseId: "case-001",
        milestoneId: "case-001-clocktower-report-located",
        evidenceTableFamily: "CrimeSceneReport",
        gate: {
          name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
          enabledValue: "true",
          isEnabled: true
        },
        evaluated: true,
        matched: true,
        matchedRowCount: 1,
        runtimeStatus: "evaluated-no-progression",
        milestoneAdvanced: false
      });
      assert.equal(history.length, 1);
      assert.equal(
        Object.hasOwn(history[0] ?? {}, "caseMilestoneEvaluation"),
        false
      );
    }
  },
  {
    name: "successful execution includes Case 001 M2 metadata for explicit enabled milestone opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();

      const result = await queryExecutionService.executeSafeQuery(
        "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 11228",
        async () => createClocktowerInterviewRecordset(),
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-report-interviews-located",
            isSkeletonGateEnabled: true
          }
        }
      );
      const history = queryHistoryService.getQueryHistoryRecords();

      assert.equal(result.success, true);
      assert.deepEqual(result.caseMilestoneEvaluation, {
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
      });
      assert.equal(history.length, 1);
      assert.equal(
        Object.hasOwn(history[0] ?? {}, "caseMilestoneEvaluation"),
        false
      );
    }
  },
  {
    name: "successful execution omits Case 001 M3 metadata for deferred milestone opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const result = await queryExecutionService.executeSafeQuery(
        "SELECT p.PersonID, p.PersonName, i.ReportID FROM PersonsOfInterest p JOIN InterviewLog i ON i.PersonID = p.PersonID",
        async () => createClocktowerIdentityRecordset(),
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-witness-identities-resolved",
            isSkeletonGateEnabled: true
          }
        }
      );

      assert.equal(result.success, true);
      assert.equal("caseMilestoneEvaluation" in result, false);
    }
  },
  {
    name: "successful execution omits Case 001 M4 metadata for deferred milestone opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const result = await queryExecutionService.executeSafeQuery(
        "SELECT e.EventID, e.EventDate, e.EventName, r.EventPersonID, p.PersonName FROM EventSchedule e JOIN EventRegistration r ON r.EventID = e.EventID JOIN PersonsOfInterest p ON p.PersonID = r.EventPersonID WHERE e.EventID = 2993",
        async () => createClocktowerCeremonyRosterRecordset(),
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-ceremony-roster-narrowed",
            isSkeletonGateEnabled: true
          }
        }
      );

      assert.equal(result.success, true);
      assert.equal("caseMilestoneEvaluation" in result, false);
    }
  },
  {
    name: "successful execution returns evaluated no-match metadata for enabled Case 001 opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const result = await queryExecutionService.executeSafeQuery(
        "SELECT * FROM CrimeSceneReport WHERE CrimeID = 9999",
        async () => [
          {
            CrimeID: 9999,
            ReportDate: "2023-05-02",
            ReportCity: "Sequel City",
            ReportDescription: "Public theater report after a toast."
          }
        ],
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            isSkeletonGateEnabled: true
          }
        }
      );

      assert.equal(result.success, true);
      assert.equal(result.caseMilestoneEvaluation?.evaluated, true);
      assert.equal(result.caseMilestoneEvaluation?.matched, false);
      assert.equal(result.caseMilestoneEvaluation?.matchedRowCount, 0);
      assert.equal(
        result.caseMilestoneEvaluation?.runtimeStatus,
        "evaluated-no-progression"
      );
      assert.equal(result.caseMilestoneEvaluation?.milestoneAdvanced, false);
    }
  },
  {
    name: "does not call evaluator for disabled gate wrong case wrong milestone or missing opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const guardedRequests = [
        undefined,
        {
          caseId: "case-001",
          milestoneId: "case-001-clocktower-report-located",
          isSkeletonGateEnabled: false
        },
        {
          caseId: "case-004",
          milestoneId: "case-001-clocktower-report-located",
          isSkeletonGateEnabled: true
        },
        {
          caseId: "case-001",
          milestoneId: "case-001-other-milestone",
          isSkeletonGateEnabled: true
        }
      ] as const;

      for (const caseMilestoneEvaluation of guardedRequests) {
        let evaluatorCallCount = 0;
        const result = await queryExecutionService.executeSafeQuery(
          "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
          async () => createClocktowerReportRecordset(),
          {
            caseMilestoneEvaluation,
            evaluateCase001Milestone: () => {
              evaluatorCallCount += 1;
              throw new Error("evaluator should not be called");
            }
          }
        );

        assert.equal(result.success, true);
        assert.equal(evaluatorCallCount, 0);
        assert.equal("caseMilestoneEvaluation" in result, false);
      }
    }
  },
  {
    name: "does not call evaluator for unsupported M2 or M3 adjacent milestone ids",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const unsupportedRequests = [
        {
          caseId: "case-001",
          milestoneId: "case-001-report-interviews-located-extra",
          isSkeletonGateEnabled: true
        },
        {
          caseId: "case-001",
          milestoneId: "case-001-witness-identities-resolved-extra",
          isSkeletonGateEnabled: true
        }
      ];

      for (const caseMilestoneEvaluation of unsupportedRequests) {
        let evaluatorCallCount = 0;
        const result = await queryExecutionService.executeSafeQuery(
          "SELECT * FROM InterviewLog WHERE ReportID = 11228",
          async () => createClocktowerInterviewRecordset(),
          {
            caseMilestoneEvaluation,
            evaluateCase001Milestone: () => {
              evaluatorCallCount += 1;
              throw new Error("evaluator should not be called");
            }
          }
        );

        assert.equal(result.success, true);
        assert.equal(evaluatorCallCount, 0);
        assert.equal("caseMilestoneEvaluation" in result, false);
      }
    }
  },
  {
    name: "blocked and restricted SQL do not call milestone evaluator",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      const blockedRequests = [
        {
          sql: "DELETE FROM CrimeSceneReport",
          milestoneId: "case-001-report-interviews-located"
        },
        {
          sql: "SELECT * FROM dbo.Solution",
          milestoneId: "case-001-clocktower-report-located"
        }
      ];

      for (const { sql, milestoneId } of blockedRequests) {
        let evaluatorCallCount = 0;
        const result = await queryExecutionService.executeSafeQuery(
          sql,
          async () => {
            throw new Error("executor should not be called");
          },
          {
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId,
              isSkeletonGateEnabled: true
            },
            evaluateCase001Milestone: () => {
              evaluatorCallCount += 1;
              throw new Error("evaluator should not be called");
            }
          }
        );

        assert.equal(result.success, false);
        assert.equal(evaluatorCallCount, 0);
        assert.equal("caseMilestoneEvaluation" in result, false);
      }
    }
  },
  {
    name: "execution failures return success false",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");
      const queryHistoryService =
        require("./queryHistoryService.ts") as typeof import("./queryHistoryService");
      queryHistoryService.resetQueryHistoryForTests();
      const result = await queryExecutionService.executeSafeQuery(
        "SELECT 1",
        async () => {
          throw new Error("boom");
        }
      );

      assert.equal(result.success, false);
      assert.equal(result.safety.isAllowed, true);
      assert.equal("data" in result, false);
      assert.equal("rows" in result, false);
      assert.equal("columns" in result, false);
      assert.equal("rowCount" in result, false);
      assert.equal("caseMilestoneEvaluation" in result, false);
      assert.equal(
        result.message,
        "Query execution failed. Verify the SQL and database connection."
      );

      const history = queryHistoryService.getQueryHistoryRecords();
      assert.equal(history.length, 1);
      assert.equal(history[0]?.outcome, "failed");
      assert.equal(history[0]?.rowCount, null);
      assert.equal(history[0]?.errorMessage, "boom");
    }
  },
  {
    name: "execution failures do not call milestone evaluator even with valid opt-in",
    run: async () => {
      const queryExecutionService =
        require("./queryExecutionService.ts") as typeof import("./queryExecutionService");

      let evaluatorCallCount = 0;
      const result = await queryExecutionService.executeSafeQuery(
        "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
        async () => {
          throw new Error("boom");
        },
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            isSkeletonGateEnabled: true
          },
          evaluateCase001Milestone: () => {
            evaluatorCallCount += 1;
            throw new Error("evaluator should not be called");
          }
        }
      );

      assert.equal(result.success, false);
      assert.equal(evaluatorCallCount, 0);
      assert.equal("caseMilestoneEvaluation" in result, false);
    }
  }
];

void runTests();

async function runTests(): Promise<void> {
  let failedCount = 0;

  for (const testCase of testCases) {
    try {
      await testCase.run();
      console.log(`PASS ${testCase.name}`);
    } catch (error) {
      failedCount += 1;
      console.error(`FAIL ${testCase.name}`);
      console.error(error);
    }
  }

  if (failedCount > 0) {
    process.exitCode = 1;
  } else {
    console.log(
      "NOTE Safe SELECT execution is not covered here; it requires integration testing against a local SQL Server instance."
    );
  }
}

function createClocktowerReportRecordset(): import("./queryResultNormalizer").QueryRecordset {
  const recordset = [
    {
      CrimeID: 1080,
      ReportDate: "2023-05-02",
      ReportCity: "Sequel City",
      ReportDescription:
        "Public clocktower ceremony report: civic official collapsed after a toast during the bell sequence; medical response noted suspected poisoning and clockroom access records held for timeline review."
    }
  ] as import("./queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    CrimeID: { name: "CrimeID" },
    ReportDate: { name: "ReportDate" },
    ReportCity: { name: "ReportCity" },
    ReportDescription: { name: "ReportDescription" }
  };

  return recordset;
}

function createClocktowerInterviewRecordset(): import("./queryResultNormalizer").QueryRecordset {
  const recordset = [
    {
      PersonID: 62764,
      ReportID: 11228,
      LogTranscript:
        "From the crowd rail, I thought the clockroom door stayed closed after the toast. The public sightlines made it look sealed until the bell sequence ended."
    },
    {
      PersonID: 27590,
      ReportID: 11228,
      LogTranscript:
        "The access ledger shows one clockroom access mark after the toast began, before the bell sequence finished. The crowd would not have seen that side stair."
    },
    {
      PersonID: 50417,
      ReportID: 11228,
      LogTranscript:
        "Records staff flagged the PersonID entries tied to the clocktower access window. Match those records back to people before trusting the crowd account."
    }
  ] as import("./queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    PersonID: { name: "PersonID" },
    ReportID: { name: "ReportID" },
    LogTranscript: { name: "LogTranscript" }
  };

  return recordset;
}

function createClocktowerCeremonyRosterRecordset(): import("./queryResultNormalizer").QueryRecordset {
  const recordset = [
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 27412, PersonName: "Les Eskridge" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 27590, PersonName: "Taryn Swoboda" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 50417, PersonName: "Shayla Kehl" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 62764, PersonName: "Herschel Tanious" }
  ] as import("./queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    EventID: { name: "EventID" },
    EventDate: { name: "EventDate" },
    EventName: { name: "EventName" },
    EventPersonID: { name: "EventPersonID" },
    PersonName: { name: "PersonName" }
  };

  return recordset;
}

function createClocktowerIdentityRecordset(): import("./queryResultNormalizer").QueryRecordset {
  const recordset = [
    {
      PersonID: 27590,
      PersonName: "Taryn Swoboda",
      ReportID: 11228
    },
    {
      PersonID: 50417,
      PersonName: "Shayla Kehl",
      ReportID: 11228
    },
    {
      PersonID: 62764,
      PersonName: "Herschel Tanious",
      ReportID: 11228
    }
  ] as import("./queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    PersonID: { name: "PersonID" },
    PersonName: { name: "PersonName" },
    ReportID: { name: "ReportID" }
  };

  return recordset;
}
