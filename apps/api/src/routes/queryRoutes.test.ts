const assert = require("node:assert/strict") as typeof import("node:assert/strict");

type AsyncTestCase = {
  name: string;
  run: () => Promise<void>;
};

const testCases: AsyncTestCase[] = [
  {
    name: "route handler forwards SQL and explicit milestone evaluation payload",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");

      let receivedSql = "";
      let receivedOptions:
        | import("../services/queryExecutionService").QueryExecutionOptions
        | undefined;
      let replyStatusCode = 200;

      const handler = queryRoutes.createQueryExecutionHandler(
        async (sql, _executeQuery, options) => {
          receivedSql = sql;
          receivedOptions = options;

          return {
            success: true,
            data: {
              columns: [],
              rows: [],
              rowCount: 0
            },
            safety: {
              isAllowed: true,
              normalizedStatementType: "SELECT",
              violations: [],
              message: "SQL statement is allowed."
            },
            executionTimeMs: 1,
            message: "Query executed successfully."
          };
        }
      );

      const response = await handler(
        {
          body: {
            sql: "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-clocktower-report-located",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: (statusCode: number) => {
            replyStatusCode = statusCode;
          }
        }
      );

      assert.equal(replyStatusCode, 200);
      assert.equal(receivedSql, "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080");
      assert.deepEqual(receivedOptions, {
        caseMilestoneEvaluation: {
          caseId: "case-001",
          milestoneId: "case-001-clocktower-report-located",
          isSkeletonGateEnabled: true
        }
      });
      assert.equal(response.success, true);
    }
  },
  {
    name: "route handler returns Case 001 metadata for explicit enabled milestone opt-in",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");
      const queryExecutionService =
        require("../services/queryExecutionService.ts") as typeof import("../services/queryExecutionService");

      const handler = queryRoutes.createQueryExecutionHandler(
        async (sql, _executeQuery, options) =>
          queryExecutionService.executeSafeQuery(
            sql,
            async () => createClocktowerReportRecordset(),
            options
          )
      );

      const response = await handler(
        {
          body: {
            sql: "SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080",
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-clocktower-report-located",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: () => {
            // keep default status
          }
        }
      );

      assert.equal(response.success, true);
      assert.deepEqual(response.caseMilestoneEvaluation, {
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
    }
  },
  {
    name: "route handler returns Case 001 M2 metadata for explicit enabled milestone opt-in",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");
      const queryExecutionService =
        require("../services/queryExecutionService.ts") as typeof import("../services/queryExecutionService");

      const handler = queryRoutes.createQueryExecutionHandler(
        async (sql, _executeQuery, options) =>
          queryExecutionService.executeSafeQuery(
            sql,
            async () => createClocktowerInterviewRecordset(),
            options
          )
      );

      const response = await handler(
        {
          body: {
            sql: "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 11228",
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-report-interviews-located",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: () => {
            // keep default status
          }
        }
      );

      assert.equal(response.success, true);
      assert.deepEqual(response.caseMilestoneEvaluation, {
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
    }
  },
  {
    name: "route handler returns Case 001 M3 metadata for explicit enabled milestone opt-in",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");
      const queryExecutionService =
        require("../services/queryExecutionService.ts") as typeof import("../services/queryExecutionService");

      const handler = queryRoutes.createQueryExecutionHandler(
        async (sql, _executeQuery, options) =>
          queryExecutionService.executeSafeQuery(
            sql,
            async () => createClocktowerIdentityRecordset(),
            options
          )
      );

      const response = await handler(
        {
          body: {
            sql: "SELECT p.PersonID, p.PersonName, i.ReportID FROM PersonsOfInterest p JOIN InterviewLog i ON i.PersonID = p.PersonID",
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-witness-identities-resolved",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: () => {
            // keep default status
          }
        }
      );

      assert.equal(response.success, true);
      assert.deepEqual(response.caseMilestoneEvaluation, {
        caseId: "case-001",
        milestoneId: "case-001-witness-identities-resolved",
        evidenceTableFamily: "PersonsOfInterest",
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
    }
  },
  {
    name: "route handler returns Case 001 M4 metadata for explicit enabled milestone opt-in",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");
      const queryExecutionService =
        require("../services/queryExecutionService.ts") as typeof import("../services/queryExecutionService");

      const handler = queryRoutes.createQueryExecutionHandler(
        async (sql, _executeQuery, options) =>
          queryExecutionService.executeSafeQuery(
            sql,
            async () => createClocktowerCeremonyRosterRecordset(),
            options
          )
      );

      const response = await handler(
        {
          body: {
            sql: "SELECT e.EventID, e.EventDate, e.EventName, r.EventPersonID, p.PersonName FROM EventSchedule e JOIN EventRegistration r ON r.EventID = e.EventID JOIN PersonsOfInterest p ON p.PersonID = r.EventPersonID WHERE e.EventID = 2993",
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-ceremony-roster-narrowed",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: () => {
            // keep default status
          }
        }
      );

      assert.equal(response.success, true);
      assert.deepEqual(response.caseMilestoneEvaluation, {
        caseId: "case-001",
        milestoneId: "case-001-ceremony-roster-narrowed",
        evidenceTableFamily: "EventRegistration",
        gate: {
          name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
          enabledValue: "true",
          isEnabled: true
        },
        evaluated: true,
        matched: true,
        matchedRowCount: 4,
        runtimeStatus: "evaluated-no-progression",
        milestoneAdvanced: false
      });
    }
  },
  {
    name: "route handler preserves malformed request behavior without forwarding payload",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");

      let callCount = 0;
      let replyStatusCode = 200;
      const handler = queryRoutes.createQueryExecutionHandler(async () => {
        callCount += 1;
        throw new Error("executeSafeQuery should not be called");
      });

      const response = await handler(
        {
          body: {
            caseMilestoneEvaluation: {
              caseId: "case-001",
              milestoneId: "case-001-clocktower-report-located",
              isSkeletonGateEnabled: true
            }
          }
        },
        {
          code: (statusCode: number) => {
            replyStatusCode = statusCode;
          }
        }
      );

      assert.equal(callCount, 0);
      assert.equal(replyStatusCode, 400);
      assert.equal(response.success, false);
      assert.equal("caseMilestoneEvaluation" in response, false);
      assert.equal(
        response.message,
        "Request body must include a string `sql` field."
      );
    }
  },
  {
    name: "registered query route uses expected path and method",
    run: async () => {
      const queryRoutes =
        require("./queryRoutes.ts") as typeof import("./queryRoutes");

      let routePath = "";

      await queryRoutes.registerQueryRoutes(
        {
          post: (path: string) => {
            routePath = path;
          }
        } as never,
        () => async () => ({
          success: true,
          data: {
            columns: [],
            rows: [],
            rowCount: 0
          },
          safety: {
            isAllowed: true,
            normalizedStatementType: "SELECT",
            violations: [],
            message: "SQL statement is allowed."
          },
          executionTimeMs: 1,
          message: "Query executed successfully."
        })
      );

      assert.equal(routePath, "/api/query/execute");
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
  }
}

function createClocktowerReportRecordset(): import("../services/queryResultNormalizer").QueryRecordset {
  const recordset = [
    {
      CrimeID: 1080,
      ReportDate: "2023-05-02",
      ReportCity: "Sequel City",
      ReportDescription:
        "Public clocktower ceremony report: civic official collapsed after a toast during the bell sequence; medical response noted suspected poisoning and clockroom access records held for timeline review."
    }
  ] as import("../services/queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    CrimeID: { name: "CrimeID" },
    ReportDate: { name: "ReportDate" },
    ReportCity: { name: "ReportCity" },
    ReportDescription: { name: "ReportDescription" }
  };

  return recordset;
}

function createClocktowerInterviewRecordset(): import("../services/queryResultNormalizer").QueryRecordset {
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
  ] as import("../services/queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    PersonID: { name: "PersonID" },
    ReportID: { name: "ReportID" },
    LogTranscript: { name: "LogTranscript" }
  };

  return recordset;
}

function createClocktowerCeremonyRosterRecordset(): import("../services/queryResultNormalizer").QueryRecordset {
  const recordset = [
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 27412, PersonName: "Les Eskridge" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 27590, PersonName: "Taryn Swoboda" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 50417, PersonName: "Shayla Kehl" },
    { EventID: 2993, EventDate: "2023-05-02", EventName: "Clocktower Civic Ceremony", EventPersonID: 62764, PersonName: "Herschel Tanious" }
  ] as import("../services/queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    EventID: { name: "EventID" },
    EventDate: { name: "EventDate" },
    EventName: { name: "EventName" },
    EventPersonID: { name: "EventPersonID" },
    PersonName: { name: "PersonName" }
  };

  return recordset;
}

function createClocktowerIdentityRecordset(): import("../services/queryResultNormalizer").QueryRecordset {
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
  ] as import("../services/queryResultNormalizer").QueryRecordset;

  recordset.columns = {
    PersonID: { name: "PersonID" },
    PersonName: { name: "PersonName" },
    ReportID: { name: "ReportID" }
  };

  return recordset;
}
