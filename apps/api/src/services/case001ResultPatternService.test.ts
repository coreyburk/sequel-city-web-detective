const assert = require("node:assert/strict") as typeof import("node:assert/strict");
const case001ResultPatternService =
  require("./case001ResultPatternService.ts") as typeof import("./case001ResultPatternService");

import type { QueryExecutionSuccessData, QueryRow } from "../types/query";

type TestCase = {
  name: string;
  run: () => void;
};

const publicClocktowerReportRow = createRow({
  ReportDate: "20230502",
  CrimeID: 1080,
  ReportDescription:
    "Public clocktower ceremony report: civic official collapsed after a toast during the bell sequence; medical response noted suspected poisoning and clockroom access records held for timeline review.",
  ReportCity: "Sequel City"
});
const clocktowerInterviewRows = [
  createRow({
    PersonID: 62764,
    ReportID: 11228,
    LogTranscript:
      "From the crowd rail, I thought the clockroom door stayed closed after the toast. The public sightlines made it look sealed until the bell sequence ended."
  }),
  createRow({
    PersonID: 27590,
    ReportID: 11228,
    LogTranscript:
      "The access ledger shows one clockroom access mark after the toast began, before the bell sequence finished. The crowd would not have seen that side stair."
  }),
  createRow({
    PersonID: 50417,
    ReportID: 11228,
    LogTranscript:
      "Records staff flagged the PersonID entries tied to the clocktower access window. Match those records back to people before trusting the crowd account."
  })
];
const testCases: TestCase[] = [
  {
    name: "matches the public Case 001 clocktower report fixture",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([publicClocktowerReportRow])
        );

      assert.deepEqual(result, {
        caseId: "case-001",
        milestoneId: "case-001-clocktower-report-located",
        evidenceTableFamily: "CrimeSceneReport",
        matched: true,
        matchedRowCount: 1
      });
    }
  },
  {
    name: "matches normalized public fields with case and spacing differences",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              ReportDate: 20230502,
              CrimeID: "1080",
              ReportDescription:
                "Clocktower ceremony notes say the toast happened during the bell sequence and medical response recorded suspected poisoning.",
              ReportCity: "  sequel city  "
            })
          ])
        );

      assert.equal(result.matched, true);
      assert.equal(result.matchedRowCount, 1);
    }
  },
  {
    name: "matches conservative SQL Server column alias casing",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              "report date": "2023-05-02T00:00:00.000Z",
              CRIME_ID: "1080",
              reportDescription:
                "Public clocktower ceremony report after a toast during the bell sequence with suspected poisoning noted.",
              report_city: "Sequel City"
            })
          ])
        );

      assert.equal(result.matched, true);
      assert.equal(result.matchedRowCount, 1);
    }
  },
  {
    name: "returns false for empty query results",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([])
        );

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 0);
    }
  },
  {
    name: "returns false when required fields are missing",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              ReportDate: "20230502",
              ReportDescription:
                "Public clocktower ceremony report after a toast during the bell sequence with suspected poisoning noted.",
              ReportCity: "Sequel City"
            })
          ])
        );

      assert.equal(result.matched, false);
    }
  },
  {
    name: "returns false for correct date and city with wrong crime id",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              ReportDate: "20230502",
              CrimeID: 1099,
              ReportDescription:
                "Public clocktower ceremony report after a toast during the bell sequence with suspected poisoning noted.",
              ReportCity: "Sequel City"
            })
          ])
        );

      assert.equal(result.matched, false);
    }
  },
  {
    name: "returns false for partial public description matches",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              ReportDate: "20230502",
              CrimeID: 1080,
              ReportDescription:
                "Public clocktower ceremony report after a toast.",
              ReportCity: "Sequel City"
            })
          ])
        );

      assert.equal(result.matched, false);
    }
  },
  {
    name: "returns false for SQL text or UI-only payloads without returned rows",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated({
          columns: [],
          rows: [],
          rowCount: 0,
          sql: "select * from CrimeSceneReport",
          selectedSkeletonOption: "clocktower"
        } as QueryExecutionSuccessData);

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 0);
    }
  },
  {
    name: "returns false for unrelated crime scene report rows",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([
            createRow({
              ReportDate: "20230503",
              CrimeID: 1080,
              ReportDescription:
                "Public clocktower ceremony report after a toast during the bell sequence with suspected poisoning noted.",
              ReportCity: "Sequel City"
            }),
            createRow({
              ReportDate: "20230502",
              CrimeID: 1080,
              ReportDescription:
                "Public theater ceremony report after a toast during the bell sequence with suspected poisoning noted.",
              ReportCity: "Sequel City"
            })
          ])
        );

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 0);
    }
  },
  {
    name: "counts duplicate matching rows without exposing row contents",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportLocated(
          createQueryResult([publicClocktowerReportRow, publicClocktowerReportRow])
        );

      assert.equal(result.matched, true);
      assert.equal(result.matchedRowCount, 2);
    }
  },
  {
    name: "matches the Case 001 clocktower report interview bundle",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated(
          createQueryResult(clocktowerInterviewRows)
        );

      assert.deepEqual(result, {
        caseId: "case-001",
        milestoneId: "case-001-report-interviews-located",
        evidenceTableFamily: "InterviewLog",
        matched: true,
        matchedRowCount: 3
      });
    }
  },
  {
    name: "matches interview rows with conservative column aliases",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated(
          createQueryResult([
            createRow({
              person_id: "62764",
              "report id": "11228",
              log_transcript:
                "The crowd believed the clockroom door stayed closed after the toast."
            }),
            createRow({
              PERSONID: "27590",
              REPORTID: "11228",
              LOGTRANSCRIPT:
                "One clockroom access mark appears after the toast began."
            }),
            createRow({
              personId: "50417",
              reportId: "11228",
              logTranscript:
                "The PersonID list in clocktower access records is the useful next check."
            })
          ])
        );

      assert.equal(result.matched, true);
      assert.equal(result.matchedRowCount, 3);
    }
  },
  {
    name: "rejects partial Case 001 interview bundles",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated(
          createQueryResult(clocktowerInterviewRows.slice(0, 1))
        );

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 1);
    }
  },
  {
    name: "rejects Case 004 report interview rows",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated(
          createQueryResult([
            createRow({
              PersonID: 62764,
              ReportID: 10975,
              LogTranscript:
                "The crowd thought the clockroom door stayed closed after the toast."
            }),
            ...clocktowerInterviewRows.slice(1)
          ])
        );

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 2);
    }
  },
  {
    name: "rejects unrelated interview transcripts",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated(
          createQueryResult([
            createRow({
              PersonID: 62764,
              ReportID: 11228,
              LogTranscript: "I saw smoke by the marina."
            }),
            createRow({
              PersonID: 27590,
              ReportID: 11228,
              LogTranscript: "There was noise near the alley."
            }),
            createRow({
              PersonID: 50417,
              ReportID: 11228,
              LogTranscript: "The office door was open."
            })
          ])
        );

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 0);
    }
  },
  {
    name: "rejects interview UI-only payloads without returned rows",
    run: () => {
      const result =
        case001ResultPatternService.validateCase001ClocktowerReportInterviewsLocated({
          columns: [],
          rows: [],
          rowCount: 0,
          sql: "select * from InterviewLog where ReportID = 11228",
          selectedSkeletonOption: "interviews"
        } as QueryExecutionSuccessData);

      assert.equal(result.matched, false);
      assert.equal(result.matchedRowCount, 0);
    }
  }
];

runTests();

function createQueryResult(rows: QueryRow[]): QueryExecutionSuccessData {
  return {
    columns: [],
    rows,
    rowCount: rows.length
  };
}

function createRow(
  values: Record<string, string | number | boolean | null>
): QueryRow {
  return {
    values,
    displayValues: Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === null ? "" : String(value)])
    )
  };
}

function runTests(): void {
  let failedCount = 0;

  for (const testCase of testCases) {
    try {
      testCase.run();
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
