vi.mock("./api/client", () => ({
  getFullHealth: vi.fn().mockResolvedValue({
    success: true,
    data: {
      api: "ok",
      database: {
        status: "ok",
        isConnected: true,
        databaseName: "SequelCityCrimesDB",
        serverName: "SEQUELCITY",
        message: "Database connection successful."
      },
      bootstrap: {
        mode: "apply",
        status: "ready",
        migrated: true,
        usedBootstrapCredentials: true,
        canApplyInApp: true,
        applyActionMessage: null,
        message: "The case database was upgraded successfully and is ready for suspect verification.",
        hasSchemaVersionTable: true,
        expectedMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
        currentMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
        pendingMigrationKeys: []
      },
      schema: {
        status: "ok",
        tableCount: 10,
        relationshipCount: 8,
        message: "Schema metadata loaded successfully."
      }
    }
  }),
  getSchemaTables: vi.fn(),
  verifySuspect: vi.fn()
}));

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { getFullHealth, getSchemaTables, verifySuspect } from "./api/client";
import type { QueryRow } from "./api/types";
import { INVESTIGATION_THREADS_STORAGE_KEY } from "./features/investigationThreads";
import { CASE_001_SKELETON_RELEASE_GATE } from "./studentCase001";
import { STUDENT_CASE_STORAGE_KEY, getStudentCaseStorageKey } from "./useStudentCaseState";

vi.mock("./components/HealthStatus", () => ({
  HealthStatus: () => <section><h2>Health Status</h2></section>
}));

vi.mock("./components/SchemaExplorer", () => ({
  SchemaExplorer: () => <section><h2>Schema Explorer</h2></section>
}));

vi.mock("./components/QueryRunner", () => ({
  QueryRunner: ({
    audience,
    onExecutionComplete,
    onStudentSqlEdit,
    draftQuery,
    restoredExecution,
    studentEvidencePrompt,
    studentInstruction,
    studentFailureGuidance,
    resetKey,
    queryAssistRequest,
    studentEvidenceFeedback,
    studentEvidenceFeedbackTone,
    onStudentLogRow
  }: {
    audience?: "student" | "developer";
    onExecutionComplete?: (payload: { sql: string; response: unknown; error: string | null }) => void;
    onStudentSqlEdit?: (sql: string) => void;
    draftQuery?: string | null;
    restoredExecution?: { sql: string; response: unknown; error: string | null } | null;
    studentEvidencePrompt?: string | null;
    studentInstruction?: string | null;
    studentFailureGuidance?: string | null;
    resetKey?: number;
    queryAssistRequest?: { id: string; text: string; sourceLabel?: string } | null;
    studentEvidenceFeedback?: string | null;
    studentEvidenceFeedbackTone?: "neutral" | "success" | "error" | "advisory";
    onStudentLogRow?: (row: QueryRow) => unknown;
  }) => (
    <section>
      <h2>Query Runner</h2>
      {draftQuery ? <p>Draft Query: {draftQuery}</p> : null}
      {restoredExecution?.response ? <p>Restored Previous Results</p> : null}
      {studentInstruction ? <p>Student Instruction: {studentInstruction}</p> : null}
      {studentFailureGuidance ? <p>Student Failure Guidance: {studentFailureGuidance}</p> : null}
      <p>Reset Key: {resetKey ?? "none"}</p>
      {studentEvidencePrompt ? <p>Evidence Prompt: {studentEvidencePrompt}</p> : null}
      {queryAssistRequest ? <p>Query Assist: {queryAssistRequest.text}</p> : null}
      {queryAssistRequest?.sourceLabel ? (
        <p>Query Assist Source: {queryAssistRequest.sourceLabel}</p>
      ) : null}
      {studentEvidenceFeedback ? <p>Evidence Feedback: {studentEvidenceFeedback}</p> : null}
      {studentEvidenceFeedbackTone ? <p>Evidence Tone: {studentEvidenceFeedbackTone}</p> : null}
      {audience === "student" ? (
        <div>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM CrimeType",
                response: { success: true },
                error: null
              })
            }
          >
            Simulate First Lead
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM CrimeSceneReport",
                response: { success: true },
                error: null
              })
            }
          >
            Simulate Scene Report Review
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080",
                response: { success: true },
                error: null
              })
            }
          >
            Simulate Case Filter
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportCity = 'SQL City'",
                response: { success: true },
                error: null
              })
            }
          >
            Simulate City Filter
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';",
                response: {
                  success: true,
                  data: { columns: [], rows: [], rowCount: 1 },
                  caseMilestoneEvaluation: {
                    caseId: "case-001",
                    milestoneId: "case-001-clocktower-report-located",
                    matched: true,
                    runtimeStatus: "evaluated-no-progression",
                    milestoneAdvanced: false
                  }
                },
                error: null
              })
            }
          >
            Simulate Case 001 Report Match
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;",
                response: {
                  success: true,
                  data: { columns: [], rows: [], rowCount: 2 },
                  caseMilestoneEvaluation: {
                    caseId: "case-001",
                    milestoneId: "case-001-report-interviews-located",
                    matched: true,
                    runtimeStatus: "evaluated-no-progression",
                    milestoneAdvanced: false
                  }
                },
                error: null
              })
            }
          >
            Simulate Case 001 Interview Match
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "PersonID", ordinal: 0, dataType: "number" },
                      { name: "ReportID", ordinal: 1, dataType: "number" },
                      { name: "LogTranscript", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          PersonID: 14887,
                          ReportID: 10975,
                          LogTranscript:
                            "There was a suspicious-looking red BMW parked outside the Symphony Hall."
                        },
                        displayValues: {
                          PersonID: "14887",
                          ReportID: "10975",
                          LogTranscript:
                            "There was a suspicious-looking red BMW parked outside the Symphony Hall."
                        }
                      },
                      {
                        values: {
                          PersonID: 14887,
                          ReportID: 10975,
                          LogTranscript:
                            'I caught part of the plate - it included "H42W" before the car tore off.'
                        },
                        displayValues: {
                          PersonID: "14887",
                          ReportID: "10975",
                          LogTranscript:
                            'I caught part of the plate - it included "H42W" before the car tore off.'
                        }
                      },
                      {
                        values: {
                          PersonID: 14887,
                          ReportID: 10975,
                          LogTranscript: "I heard a gunshot and then saw a man run out."
                        },
                        displayValues: {
                          PersonID: "14887",
                          ReportID: "10975",
                          LogTranscript: "I heard a gunshot and then saw a man run out."
                        }
                      },
                      {
                        values: {
                          PersonID: 14887,
                          ReportID: 10975,
                          LogTranscript:
                            'He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only gold members have those bags.'
                        },
                        displayValues: {
                          PersonID: "14887",
                          ReportID: "10975",
                          LogTranscript:
                            'He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only gold members have those bags.'
                        }
                      },
                      {
                        values: {
                          PersonID: 16371,
                          ReportID: 10975,
                          LogTranscript: "I saw the murder happen right outside Symphony Hall."
                        },
                        displayValues: {
                          PersonID: "16371",
                          ReportID: "10975",
                          LogTranscript: "I saw the murder happen right outside Symphony Hall."
                        }
                      },
                      {
                        values: {
                          PersonID: 16371,
                          ReportID: 10975,
                          LogTranscript:
                            "I recognized the killer from my gym when I was working out last week on January the 9th."
                        },
                        displayValues: {
                          PersonID: "16371",
                          ReportID: "10975",
                          LogTranscript:
                            "I recognized the killer from my gym when I was working out last week on January the 9th."
                        }
                      },
                      {
                        values: {
                          PersonID: 67318,
                          ReportID: 10975,
                          LogTranscript:
                            "A high-roller dame with deep pockets put out a contract on this guy, and I was the one they called to ice him."
                        },
                        displayValues: {
                          PersonID: "67318",
                          ReportID: "10975",
                          LogTranscript:
                            "A high-roller dame with deep pockets put out a contract on this guy, and I was the one they called to ice him."
                        }
                      }
                    ],
                    rowCount: 6
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Witness Join
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM PersonsOfInterest WHERE PersonID = 14887 OR PersonID = 16371",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "PersonID", ordinal: 0, dataType: "number" },
                      { name: "PersonName", ordinal: 1, dataType: "string" },
                      { name: "AddressStreetName", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          PersonID: 14887,
                          PersonName: "Morty Schapiro",
                          AddressStreetName: "Northwestern Dr"
                        },
                        displayValues: {
                          PersonID: "14887",
                          PersonName: "Morty Schapiro",
                          AddressStreetName: "Northwestern Dr"
                        }
                      },
                      {
                        values: {
                          PersonID: 16371,
                          PersonName: "Annabel Miller",
                          AddressStreetName: "Franklin Ave"
                        },
                        displayValues: {
                          PersonID: "16371",
                          PersonName: "Annabel Miller",
                          AddressStreetName: "Franklin Ave"
                        }
                      }
                    ],
                    rowCount: 2
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Witness Name Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM FitNFlabClub",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "FitMemberID", ordinal: 0, dataType: "string" },
                      { name: "PersonID", ordinal: 1, dataType: "number" },
                      { name: "FitMembershipStatus", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          FitMemberID: "48Z7A",
                          PersonID: 14887,
                          FitMembershipStatus: "gold"
                        },
                        displayValues: {
                          FitMemberID: "48Z7A",
                          PersonID: "14887",
                          FitMembershipStatus: "gold"
                        }
                      },
                      {
                        values: {
                          FitMemberID: "48Z9B",
                          PersonID: 16371,
                          FitMembershipStatus: "gold"
                        },
                        displayValues: {
                          FitMemberID: "48Z9B",
                          PersonID: "16371",
                          FitMembershipStatus: "gold"
                        }
                      },
                      {
                        values: {
                          FitMemberID: "19A2C",
                          PersonID: 67318,
                          FitMembershipStatus: "silver"
                        },
                        displayValues: {
                          FitMemberID: "19A2C",
                          PersonID: "67318",
                          FitMembershipStatus: "silver"
                        }
                      }
                    ],
                    rowCount: 3
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Gym Membership Scan
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM FitNFlabClub WHERE FitMembershipStatus = 'gold' AND FitMemberID LIKE '48Z%'",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "FitMemberID", ordinal: 0, dataType: "string" },
                      { name: "PersonID", ordinal: 1, dataType: "number" },
                      { name: "FitMembershipStatus", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          FitMemberID: "48Z55",
                          PersonID: 67318,
                          FitMembershipStatus: "gold"
                        },
                        displayValues: {
                          FitMemberID: "48Z55",
                          PersonID: "67318",
                          FitMembershipStatus: "gold"
                        }
                      }
                    ],
                    rowCount: 1
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Gym Membership Match
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentSqlEdit?.(
                "SELECT * FROM DriversLicense WHERE CarMake = 'BMW' AND CarModel = 'M8'"
              )
            }
          >
            Simulate Student SQL Edit
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LogID: 5108,
                  PersonID: 14887,
                  ReportID: 10975,
                  LogTranscript:
                    'He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only gold members have those bags.'
                },
                displayValues: {
                  LogID: "5108",
                  PersonID: "14887",
                  ReportID: "10975",
                  LogTranscript:
                    'He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only gold members have those bags.'
                }
              })
            }
          >
            Simulate Witness Row Log 14887
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LogID: 4782,
                  PersonID: 16371,
                  ReportID: 10975,
                  LogTranscript:
                    "I recognized the killer from my gym when I was working out last week on January the 9th."
                },
                displayValues: {
                  LogID: "4782",
                  PersonID: "16371",
                  ReportID: "10975",
                  LogTranscript:
                    "I recognized the killer from my gym when I was working out last week on January the 9th."
                }
              })
            }
          >
            Simulate Witness Row Log 16371
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  PersonID: 14887,
                  PersonName: "Morty Schapiro",
                  AddressStreetName: "Northwestern Dr"
                },
                displayValues: {
                  PersonID: "14887",
                  PersonName: "Morty Schapiro",
                  AddressStreetName: "Northwestern Dr"
                }
              })
            }
          >
            Simulate Witness Name Log 14887
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  PersonID: 16371,
                  PersonName: "Annabel Miller",
                  AddressStreetName: "Franklin Ave"
                },
                displayValues: {
                  PersonID: "16371",
                  PersonName: "Annabel Miller",
                  AddressStreetName: "Franklin Ave"
                }
              })
            }
          >
            Simulate Witness Name Log 16371
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  FitMemberID: "48Z55",
                  PersonID: 67318,
                  FitMembershipStatus: "gold"
                },
                displayValues: {
                  FitMemberID: "48Z55",
                  PersonID: "67318",
                  FitMembershipStatus: "gold"
                }
              })
            }
          >
            Simulate Gym Lead Log
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM PersonsOfInterest WHERE PersonID = 67318",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "PersonID", ordinal: 0, dataType: "number" },
                      { name: "PersonName", ordinal: 1, dataType: "string" },
                      { name: "AddressStreetName", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          PersonID: 67318,
                          PersonName: "Jeremy Bowers",
                          AddressStreetName: "Washington Pl"
                        },
                        displayValues: {
                          PersonID: "67318",
                          PersonName: "Jeremy Bowers",
                          AddressStreetName: "Washington Pl"
                        }
                      }
                    ],
                    rowCount: 1
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Suspect Candidate Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM InterviewLog WHERE PersonID = 67318",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "LogID", ordinal: 0, dataType: "number" },
                      { name: "PersonID", ordinal: 1, dataType: "number" },
                      { name: "ReportID", ordinal: 2, dataType: "number" },
                      { name: "LogTranscript", ordinal: 3, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          LogID: 4423,
                          PersonID: 67318,
                          ReportID: 10975,
                          LogTranscript:
                            "A high-roller dame with deep pockets put out a contract on this guy, and I was the one they called to ice him."
                        },
                        displayValues: {
                          LogID: "4423",
                          PersonID: "67318",
                          ReportID: "10975",
                          LogTranscript:
                            "A high-roller dame with deep pockets put out a contract on this guy, and I was the one they called to ice him."
                        }
                      },
                      {
                        values: {
                          LogID: 4439,
                          PersonID: 67318,
                          ReportID: 88001,
                          LogTranscript:
                            "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. My client wanted that scumbag taken out, so I delivered."
                        },
                        displayValues: {
                          LogID: "4439",
                          PersonID: "67318",
                          ReportID: "88001",
                          LogTranscript:
                            "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. My client wanted that scumbag taken out, so I delivered."
                        }
                      }
                    ],
                    rowCount: 2
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Transcript Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM InterviewLog WHERE PersonID = 67318 AND ReportID = 10975",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "LogID", ordinal: 0, dataType: "number" },
                      { name: "PersonID", ordinal: 1, dataType: "number" },
                      { name: "ReportID", ordinal: 2, dataType: "number" },
                      { name: "LogTranscript", ordinal: 3, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          LogID: 4439,
                          PersonID: 67318,
                          ReportID: 10975,
                          LogTranscript:
                            "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. The lady was a high-roller with deep pockets and the client; she wanted that scumbag taken out, so I delivered."
                        },
                        displayValues: {
                          LogID: "4439",
                          PersonID: "67318",
                          ReportID: "10975",
                          LogTranscript:
                            "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. The lady was a high-roller with deep pockets and the client; she wanted that scumbag taken out, so I delivered."
                        }
                      }
                    ],
                    rowCount: 1
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Filtered Transcript Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM DriversLicense WHERE CarMake = 'BMW' AND CarModel = 'M8' AND Gender = 'female' AND HairColor = 'red' AND Height BETWEEN 65 AND 67",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "LicenseID", ordinal: 0, dataType: "number" },
                      { name: "Age", ordinal: 1, dataType: "number" },
                      { name: "Height", ordinal: 2, dataType: "number" },
                      { name: "EyeColor", ordinal: 3, dataType: "string" },
                      { name: "HairColor", ordinal: 4, dataType: "string" },
                      { name: "Gender", ordinal: 5, dataType: "string" },
                      { name: "PlateNumber", ordinal: 6, dataType: "string" },
                      { name: "CarMake", ordinal: 7, dataType: "string" },
                      { name: "CarModel", ordinal: 8, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: {
                          LicenseID: 202298,
                          Age: 68,
                          Height: 66,
                          EyeColor: "green",
                          HairColor: "red",
                          Gender: "female",
                          PlateNumber: "500123",
                          CarMake: "BMW",
                          CarModel: "M8"
                        },
                        displayValues: {
                          LicenseID: "202298",
                          Age: "68",
                          Height: "66",
                          EyeColor: "green",
                          HairColor: "red",
                          Gender: "female",
                          PlateNumber: "500123",
                          CarMake: "BMW",
                          CarModel: "M8"
                        }
                      },
                      {
                        values: {
                          LicenseID: 857212,
                          Age: 29,
                          Height: 67,
                          EyeColor: "green",
                          HairColor: "red",
                          Gender: "female",
                          PlateNumber: "VFZXF6",
                          CarMake: "BMW",
                          CarModel: "M8"
                        },
                        displayValues: {
                          LicenseID: "857212",
                          Age: "29",
                          Height: "67",
                          EyeColor: "green",
                          HairColor: "red",
                          Gender: "female",
                          PlateNumber: "VFZXF6",
                          CarMake: "BMW",
                          CarModel: "M8"
                        }
                      }
                    ],
                    rowCount: 2
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate DriversLicense Narrowing
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM PersonsOfInterest WHERE LicenseID = 202298 OR LicenseID = 857212",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "PersonID", ordinal: 0, dataType: "number" },
                      { name: "PersonName", ordinal: 1, dataType: "string" },
                      { name: "LicenseID", ordinal: 2, dataType: "number" },
                      { name: "AddressStreetName", ordinal: 3, dataType: "string" },
                      { name: "SSN", ordinal: 4, dataType: "number" }
                    ],
                    rows: [
                      {
                        values: {
                          PersonID: 99716,
                          PersonName: "Miranda Priestly",
                          LicenseID: 202298,
                          AddressStreetName: "Golden Ave",
                          SSN: 987756388
                        },
                        displayValues: {
                          PersonID: "99716",
                          PersonName: "Miranda Priestly",
                          LicenseID: "202298",
                          AddressStreetName: "Golden Ave",
                          SSN: "987756388"
                        }
                      },
                      {
                        values: {
                          PersonID: 14307,
                          PersonName: "Dani Rawley",
                          LicenseID: 857212,
                          AddressStreetName: "Twentyeighth Ave",
                          SSN: 362878596
                        },
                        displayValues: {
                          PersonID: "14307",
                          PersonName: "Dani Rawley",
                          LicenseID: "857212",
                          AddressStreetName: "Twentyeighth Ave",
                          SSN: "362878596"
                        }
                      }
                    ],
                    rowCount: 2
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Identity Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM EventRegistration WHERE EventID IN (2669, 3005, 3257) AND EventPersonID IN (14307, 99716) ORDER BY EventID, EventPersonID",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "RegistrationID", ordinal: 0, dataType: "number" },
                      { name: "EventID", ordinal: 1, dataType: "number" },
                      { name: "EventPersonID", ordinal: 2, dataType: "number" }
                    ],
                    rows: [
                      {
                        values: { RegistrationID: 16502, EventID: 2669, EventPersonID: 14307 },
                        displayValues: { RegistrationID: "16502", EventID: "2669", EventPersonID: "14307" }
                      },
                      {
                        values: { RegistrationID: 15383, EventID: 2669, EventPersonID: 99716 },
                        displayValues: { RegistrationID: "15383", EventID: "2669", EventPersonID: "99716" }
                      },
                      {
                        values: { RegistrationID: 17606, EventID: 3005, EventPersonID: 14307 },
                        displayValues: { RegistrationID: "17606", EventID: "3005", EventPersonID: "14307" }
                      },
                      {
                        values: { RegistrationID: 17607, EventID: 3005, EventPersonID: 99716 },
                        displayValues: { RegistrationID: "17607", EventID: "3005", EventPersonID: "99716" }
                      },
                      {
                        values: { RegistrationID: 17608, EventID: 3257, EventPersonID: 14307 },
                        displayValues: { RegistrationID: "17608", EventID: "3257", EventPersonID: "14307" }
                      },
                      {
                        values: { RegistrationID: 17609, EventID: 3257, EventPersonID: 99716 },
                        displayValues: { RegistrationID: "17609", EventID: "3257", EventPersonID: "99716" }
                      }
                    ],
                    rowCount: 6
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Event Registration
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM Employment WHERE SSN = 987756388 OR SSN = 362878596",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "SSN", ordinal: 0, dataType: "number" },
                      { name: "JobTitle", ordinal: 1, dataType: "string" },
                      { name: "CompanyName", ordinal: 2, dataType: "string" },
                      { name: "Salary", ordinal: 3, dataType: "number" }
                    ],
                    rows: [
                      {
                        values: {
                          SSN: 987756388,
                          JobTitle: "Urban Policy Advisor",
                          CompanyName: "Sub Rosa Strategies",
                          Salary: 310000
                        },
                        displayValues: {
                          SSN: "987756388",
                          JobTitle: "Urban Policy Advisor",
                          CompanyName: "Sub Rosa Strategies",
                          Salary: "310000"
                        }
                      },
                      {
                        values: {
                          SSN: 362878596,
                          JobTitle: "Tattoo Artist",
                          CompanyName: "Urban Mystique Holdings",
                          Salary: 36000
                        },
                        displayValues: {
                          SSN: "362878596",
                          JobTitle: "Tattoo Artist",
                          CompanyName: "Urban Mystique Holdings",
                          Salary: "36000"
                        }
                      }
                    ],
                    rowCount: 2
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Employment Lookup
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  SSN: 987756388,
                  JobTitle: "Urban Policy Advisor",
                  CompanyName: "Sub Rosa Strategies",
                  Salary: 310000
                },
                displayValues: {
                  SSN: "987756388",
                  JobTitle: "Urban Policy Advisor",
                  CompanyName: "Sub Rosa Strategies",
                  Salary: "310000"
                }
              })
            }
          >
            Simulate Mastermind Employment Log 987756388
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  SSN: 362878596,
                  JobTitle: "Tattoo Artist",
                  CompanyName: "Urban Mystique Holdings",
                  Salary: 36000
                },
                displayValues: {
                  SSN: "362878596",
                  JobTitle: "Tattoo Artist",
                  CompanyName: "Urban Mystique Holdings",
                  Salary: "36000"
                }
              })
            }
          >
            Simulate Mastermind Employment Log 362878596
          </button>
          <button
            type="button"
            onClick={() =>
              onExecutionComplete?.({
                sql: "SELECT * FROM EventSchedule WHERE EventDate LIKE '2022-12%' AND EventName LIKE '%Symphony%'",
                response: {
                  success: true,
                  data: {
                    columns: [
                      { name: "EventID", ordinal: 0, dataType: "number" },
                      { name: "EventDate", ordinal: 1, dataType: "string" },
                      { name: "EventName", ordinal: 2, dataType: "string" }
                    ],
                    rows: [
                      {
                        values: { EventID: 2669, EventDate: "2022-12-15", EventName: "Neon Nights Symphony Delights" },
                        displayValues: { EventID: "2669", EventDate: "2022-12-15", EventName: "Neon Nights Symphony Delights" }
                      }
                    ],
                    rowCount: 1
                  },
                  safety: {
                    isAllowed: true,
                    normalizedStatementType: "SELECT",
                    violations: [],
                    message: "Safe."
                  },
                  executionTimeMs: 1,
                  message: "Executed."
                },
                error: null
              })
            }
          >
            Simulate Mastermind Event Schedule
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { EventID: 2669, EventDate: "2022-12-15", EventName: "Neon Nights Symphony Delights" },
                displayValues: { EventID: "2669", EventDate: "2022-12-15", EventName: "Neon Nights Symphony Delights" }
              })
            }
          >
            Simulate Mastermind Event Schedule Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { EventID: 3005, EventDate: "2022-12-09", EventName: "Skyline Symphony Showcase" },
                displayValues: { EventID: "3005", EventDate: "2022-12-09", EventName: "Skyline Symphony Showcase" }
              })
            }
          >
            Simulate Mastermind Event Schedule Log 3005
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { EventID: 3257, EventDate: "2022-12-19", EventName: "Winter Wonderland Symphony" },
                displayValues: { EventID: "3257", EventDate: "2022-12-19", EventName: "Winter Wonderland Symphony" }
              })
            }
          >
            Simulate Mastermind Event Schedule Log 3257
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  PersonID: 99716,
                  PersonName: "Miranda Priestly",
                  LicenseID: 202298,
                  AddressStreetName: "Golden Ave",
                  SSN: 987756388
                },
                displayValues: {
                  PersonID: "99716",
                  PersonName: "Miranda Priestly",
                  LicenseID: "202298",
                  AddressStreetName: "Golden Ave",
                  SSN: "987756388"
                }
              })
            }
          >
            Simulate Mastermind Identity Log 99716
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  PersonID: 14307,
                  PersonName: "Dani Rawley",
                  LicenseID: 857212,
                  AddressStreetName: "Twentyeighth Ave",
                  SSN: 362878596
                },
                displayValues: {
                  PersonID: "14307",
                  PersonName: "Dani Rawley",
                  LicenseID: "857212",
                  AddressStreetName: "Twentyeighth Ave",
                  SSN: "362878596"
                }
              })
            }
          >
            Simulate Mastermind Identity Log 14307
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  PersonID: 67318,
                  PersonName: "Jeremy Bowers",
                  AddressStreetName: "Washington Pl"
                },
                displayValues: {
                  PersonID: "67318",
                  PersonName: "Jeremy Bowers",
                  AddressStreetName: "Washington Pl"
                }
              })
            }
          >
            Simulate Suspect Candidate Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { CrimeID: 1080, Crime: "Murder" },
                displayValues: { CrimeID: "1080", Crime: "Murder" }
              })
            }
          >
            Simulate Crime Evidence Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LogID: 5155,
                  PersonID: 67318,
                  ReportID: 10975,
                  LogTranscript:
                    "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. The lady was a high-roller with deep pockets and the client; she wanted that scumbag taken out, so I delivered."
                },
                displayValues: {
                  LogID: "5155",
                  PersonID: "67318",
                  ReportID: "10975",
                  LogTranscript:
                    "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. The lady was a high-roller with deep pockets and the client; she wanted that scumbag taken out, so I delivered."
                }
              })
            }
          >
            Simulate Confession Row Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LogID: 4439,
                  PersonID: 67318,
                  ReportID: 88001,
                  LogTranscript:
                    "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. My client wanted that scumbag taken out, so I delivered."
                },
                displayValues: {
                  LogID: "4439",
                  PersonID: "67318",
                  ReportID: "88001",
                  LogTranscript:
                    "Listen, dime-store cop, I do not need to justify myself to a flat-foot like you. My client wanted that scumbag taken out, so I delivered."
                }
              })
            }
          >
            Simulate Off Report Confession Row Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LogID: 5156,
                  PersonID: 67318,
                  ReportID: 10975,
                  LogTranscript:
                    "The woman who hired me met up three times last December next to Symphony Hall. She was a redheaded broad in designer stilettos with expensive jewelry, drove a BMW M8, and stood about 5 foot 5 to 5 foot 8."
                },
                displayValues: {
                  LogID: "5156",
                  PersonID: "67318",
                  ReportID: "10975",
                  LogTranscript:
                    "The woman who hired me met up three times last December next to Symphony Hall. She was a redheaded broad in designer stilettos with expensive jewelry, drove a BMW M8, and stood about 5 foot 5 to 5 foot 8."
                }
              })
            }
          >
            Simulate Mastermind Profile Row Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LicenseID: 202298,
                  Age: 68,
                  Height: 66,
                  EyeColor: "green",
                  HairColor: "red",
                  Gender: "female",
                  PlateNumber: "500123",
                  CarMake: "BMW",
                  CarModel: "M8"
                },
                displayValues: {
                  LicenseID: "202298",
                  Age: "68",
                  Height: "66",
                  EyeColor: "green",
                  HairColor: "red",
                  Gender: "female",
                  PlateNumber: "500123",
                  CarMake: "BMW",
                  CarModel: "M8"
                }
              })
            }
          >
            Simulate DriversLicense Candidate Log 202298
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: {
                  LicenseID: 857212,
                  Age: 29,
                  Height: 67,
                  EyeColor: "green",
                  HairColor: "red",
                  Gender: "female",
                  PlateNumber: "VFZXF6",
                  CarMake: "BMW",
                  CarModel: "M8"
                },
                displayValues: {
                  LicenseID: "857212",
                  Age: "29",
                  Height: "67",
                  EyeColor: "green",
                  HairColor: "red",
                  Gender: "female",
                  PlateNumber: "VFZXF6",
                  CarMake: "BMW",
                  CarModel: "M8"
                }
              })
            }
          >
            Simulate DriversLicense Candidate Log 857212
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { CrimeID: 1080, ReportID: "10056", ReportDate: "2022-01-21", ReportCity: "SQL City" },
                displayValues: {
                  CrimeID: "1080",
                  ReportID: "10056",
                  ReportDate: "2022-01-21",
                  ReportCity: "SQL City"
                }
              })
            }
          >
            Simulate Incorrect Report Log
          </button>
          <button
            type="button"
            onClick={() =>
              onStudentLogRow?.({
                values: { CrimeID: 1080, ReportID: "10975", ReportDate: "2023-01-15", ReportCity: "SQL City" },
                displayValues: {
                  CrimeID: "1080",
                  ReportID: "10975",
                  ReportDate: "2023-01-15",
                  ReportCity: "SQL City"
                }
              })
            }
          >
            Simulate Filtered Report Log
          </button>
        </div>
      ) : null}
    </section>
  )
}));

vi.mock("./components/QueryHistoryPanel", () => ({
  QueryHistoryPanel: () => <section><h2>Query History</h2></section>
}));

vi.mock("./components/SuspectVerificationPanel", () => ({
  SuspectVerificationPanel: () => <section><h2>Suspect Verification</h2></section>
}));

function chooseJeremyBowersIfAvailable(): void {
  const jeremyChoice = screen.queryByRole("radio", { name: "Jeremy Bowers" });
  if (jeremyChoice) {
    fireEvent.click(jeremyChoice);
  }
}

function isCrimeSceneReportDraft(_content: string, element: Element | null): boolean {
  return element?.textContent === "Draft Query: SELECT *\nFROM CrimeSceneReport";
}

describe("App", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
    // ensure the getFullHealth mock is being set as expected during tests
    vi.mocked(getFullHealth).mockResolvedValue({
      success: true,
      data: {
        api: "ok",
        database: {
          status: "ok",
          isConnected: true,
          databaseName: "SequelCityCrimesDB",
          serverName: "SEQUELCITY",
          message: "Database connection successful."
        },
        bootstrap: {
          mode: "apply",
          status: "ready",
          identity: {
            status: "ready",
            message: "Database identity is ready.",
            missingFacts: []
          },
          migrated: true,
          usedBootstrapCredentials: true,
          canApplyInApp: true,
          applyActionMessage: null,
          message: "The case database was upgraded successfully and is ready for suspect verification.",
          hasSchemaVersionTable: true,
          expectedMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
          currentMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
          pendingMigrationKeys: []
        },
        schema: {
          status: "ok",
          tableCount: 10,
          relationshipCount: 8,
          message: "Schema metadata loaded successfully."
        }
      }
    });
    vi.mocked(getSchemaTables).mockResolvedValue({
      success: true,
      data: {
        tables: [
          {
            schemaName: "dbo",
            tableName: "crime_scene_report",
            fullName: "dbo.crime_scene_report",
            columns: [
              {
                columnName: "id",
                ordinal: 1,
                dataType: "int",
                isNullable: false,
                maxLength: null,
                numericPrecision: 10,
                numericScale: 0,
                isPrimaryKey: true,
                isForeignKey: false
              },
              {
                columnName: "date",
                ordinal: 2,
                dataType: "date",
                isNullable: false,
                maxLength: null,
                numericPrecision: null,
                numericScale: null,
                isPrimaryKey: false,
                isForeignKey: false
              }
            ],
            primaryKey: {
              name: "PK_crime_scene_report",
              columns: ["id"]
            }
          },
          {
            schemaName: "dbo",
            tableName: "person",
            fullName: "dbo.person",
            columns: [
              {
                columnName: "id",
                ordinal: 1,
                dataType: "int",
                isNullable: false,
                maxLength: null,
                numericPrecision: 10,
                numericScale: 0,
                isPrimaryKey: true,
                isForeignKey: false
              }
            ],
            primaryKey: {
              name: "PK_person",
              columns: ["id"]
            }
          }
        ],
        relationships: []
      }
    });
    vi.mocked(verifySuspect).mockResolvedValue({
      success: true,
      data: {
        suspect: "Jeremy Bowers",
        verdict:
          "Congrats, you found the murderer! But wait, there is more... You found the Trigger Man, now find the Master Mind.",
        caseId: "case-004",
        isCorrect: true,
        solvedRole: "trigger_man",
        nextRole: "mastermind",
        suspectPersonId: 67318
      },
      message: "Suspect verification completed."
    });
  });

  it("renders a bounded text-size control and persists the selected size locally", () => {
    render(<App />);

    expect(screen.getByRole("group", { name: "Text Size" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Text: Default" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    fireEvent.click(screen.getByRole("button", { name: "Text: Larger" }));

    expect(screen.getByRole("main")).toHaveAttribute("data-text-size", "larger");
    expect(screen.getByRole("button", { name: "Text: Larger" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(window.localStorage.getItem("sequel-city.text-size")).toBe("larger");
  });

  it("falls back to default text size when the stored preference is invalid", () => {
    window.localStorage.setItem("sequel-city.text-size", "huge");

    render(<App />);

    expect(screen.getByRole("main")).toHaveAttribute("data-text-size", "default");
    expect(screen.getByRole("button", { name: "Text: Default" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("shows a classroom setup panel instead of student workflow when bootstrap is degraded", async () => {
    vi.mocked(getFullHealth).mockResolvedValueOnce({
      success: true,
      data: {
        api: "ok",
        database: {
          status: "ok",
          isConnected: true,
          databaseName: "SequelCityCrimesDB",
          serverName: "SEQUELCITY",
          message: "Database connection successful."
        },
        bootstrap: {
          mode: "verify",
          status: "degraded",
          identity: {
            status: "missing",
            message: "Database identity is missing required facts.",
            missingFacts: ["case verification objects"]
          },
          migrated: false,
          usedBootstrapCredentials: false,
          canApplyInApp: true,
          applyActionMessage: null,
          message:
            "The case database needs a one-time upgrade before suspect checks and the latest guided case flow are available. Open Admin Mode and use Apply Required Upgrade so Sequel Detective can finish setup on this machine.",
          hasSchemaVersionTable: false,
          expectedMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
          currentMigrationKey: null,
          pendingMigrationKeys: [
            "2026-05-21-001-create-case-answer-key-table.sql",
            "2026-05-21-002-seed-case-answer-key-case-004.sql"
          ]
        },
        schema: {
          status: "ok",
          tableCount: 10,
          relationshipCount: 8,
          message: "Schema metadata loaded successfully."
        }
      }
    });

    render(<App initialStudentCaseEntered />);

    expect(
      await screen.findByRole("heading", { name: "Case Database Upgrade Required" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This case needs a one-time database upgrade before students can use the guided investigation safely."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Admin Mode shows classroom health details/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Open Admin Mode and use Apply Required Upgrade to finish setup from inside the application."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Admin Mode" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Query Runner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "First-Run Guidance" })).not.toBeInTheDocument();
  });

  it("lets a teacher switch from the setup gate into Admin Mode", async () => {
    vi.mocked(getFullHealth).mockResolvedValueOnce({
      success: true,
      data: {
        api: "ok",
        database: {
          status: "ok",
          isConnected: true,
          databaseName: "SequelCityCrimesDB",
          serverName: "SEQUELCITY",
          message: "Database connection successful."
        },
        bootstrap: {
          mode: "verify",
          status: "degraded",
          identity: {
            status: "missing",
            message: "Database identity is missing required facts.",
            missingFacts: ["case verification objects"]
          },
          migrated: false,
          usedBootstrapCredentials: false,
          canApplyInApp: true,
          applyActionMessage: null,
          message:
            "The case database needs a one-time upgrade before suspect checks and the latest guided case flow are available. Open Admin Mode and use Apply Required Upgrade so Sequel Detective can finish setup on this machine.",
          hasSchemaVersionTable: false,
          expectedMigrationKey: "2026-05-21-005-create-case-verification-objects.sql",
          currentMigrationKey: null,
          pendingMigrationKeys: [
            "2026-05-21-001-create-case-answer-key-table.sql",
            "2026-05-21-002-seed-case-answer-key-case-004.sql"
          ]
        },
        schema: {
          status: "ok",
          tableCount: 10,
          relationshipCount: 8,
          message: "Schema metadata loaded successfully."
        }
      }
    });

    render(<App initialStudentCaseEntered />);

    fireEvent.click(await screen.findByRole("button", { name: "Open Admin Mode" }));

    expect(screen.getByRole("heading", { name: "First-Run Guidance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Health Status" })).toBeInTheDocument();
  });

  it("defaults to student mode with minimal story, schema snapshot, and query lab", () => {
    render(<App initialStudentCaseEntered />);

    expect(
      screen.getByRole("heading", { name: "Sequel Detective" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Case 004 · The SQL City Murder · 0/8 clues logged" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Samuel Tupleton Mentor")).toBeInTheDocument();
    expect(screen.queryByText("Mentor")).not.toBeInTheDocument();
    expect(document.querySelector(".samuel-avatar--neutral img")?.getAttribute("src")).toContain(
      "avatar-samuel-mentor-neutral"
    );
    expect(screen.getByText("Case 004 Briefing")).toBeInTheDocument();
    expect(screen.getByText("Samuel's Trust: Building")).toBeInTheDocument();
    expect(screen.getByText("Insight Marks: 0")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The SQL City Murder" })).toBeInTheDocument();
    expect(screen.getByText("Case File Snapshot")).toBeInTheDocument();
    expect(screen.getByText(/The case does not begin with suspects/)).toBeInTheDocument();
    expect(screen.getByText("Opening Query Lead")).toBeInTheDocument();
    expect(screen.getAllByText("Breadcrumbs 0 / 3")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 3, name: "Determine the Crime ID for murder" })
    ).toBeInTheDocument();
    expect(screen.getByText("Next Step")).toBeInTheDocument();
    expect(screen.getByText("Why It Matters")).toBeInTheDocument();
    expect(screen.getByText("Success Looks Like")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Samuel's Briefing" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Samuel's Briefing" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Query Lab" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Evidence Board" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.queryByRole("button", { name: "Start Query" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Evidence Board" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Progress" })).toBeInTheDocument();
    expect(screen.queryByText("Draft Query: SELECT * FROM CrimeType")).not.toBeInTheDocument();
    expect(screen.queryByText(/Evidence Prompt:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Quick Table Clues")).not.toBeInTheDocument();
    expect(screen.queryByText("Evidence Notebook")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Query Runner" })).not.toBeInTheDocument();
    expect(screen.getByText("What this case asks you to prove")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Anchor the case with the murder code, the right report row, and the witness trail before you let any suspect theory take over."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("What to do first")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review the case facts below, then open Query Lab and start with CrimeType."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.queryByText("Samuel's Next Move")).not.toBeInTheDocument();
    expect(screen.getByText("Draft Query: SELECT * FROM CrimeType")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Start with CrimeType. Find the row labeled Murder, then log its CrimeID before you touch the report archive."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Case File" })).toBeInTheDocument();
    expect(screen.queryByText("Quick Table Clues")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    expect(screen.getByRole("heading", { name: "Pinned Facts" })).toBeInTheDocument();
    expect(screen.getByText(/No facts pinned yet/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pinned Facts" })).toBeInTheDocument();
    expect(screen.getByText("Case Facts")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Case Facts" }));
    expect(screen.getByText("January 15th, 2023: a murder was reported in Sequel City.")).toBeInTheDocument();
    expect(screen.getByText(/The case does not begin with suspects/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));
    expect(screen.getByRole("heading", { name: "Pinned Facts" })).toBeInTheDocument();
    expect(screen.getByText(/No facts pinned yet/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Query Runner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Query Lab" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Review Evidence" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue Querying" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    expect(screen.getAllByText("Case Progress").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Add your own note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Note" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current Step")).toBeInTheDocument();
    expect(screen.getByText("Follow Samuel's current instruction.")).toBeInTheDocument();
    expect(screen.getByText("See Samuel's Guidance above for the full direction.")).toBeInTheDocument();
    expect(screen.queryByText("Current Investigation Focus")).not.toBeInTheDocument();
    expect(screen.queryByText("Anchor the crime scene report")).not.toBeInTheDocument();
    expect(screen.queryByText("Witness statement trail")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Review investigation trails/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Later trails \(5\)/)).not.toBeInTheDocument();
    expect(screen.getByText("Samuel's Check-In")).toBeInTheDocument();
    expect(screen.getByText("Optional reasoning check.")).toBeInTheDocument();
    expect(screen.queryByText("Optional Samuel's Check-In")).not.toBeInTheDocument();
    expect(screen.queryByText(/Optional now\./)).not.toBeInTheDocument();
    expect(screen.getAllByText("Insight Marks: 0").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Which CrimeID belongs to Murder." }));
    expect(screen.getAllByText(/Insight Mark earned/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Insight Marks: 1").length).toBeGreaterThan(0);
    expect(screen.queryByText("Emerging Leads")).not.toBeInTheDocument();
    expect(screen.queryByText(/No outside leads yet/)).not.toBeInTheDocument();
    expect(screen.queryByText("Witness 1 File")).not.toBeInTheDocument();
    expect(screen.queryByText("Witness 2 File")).not.toBeInTheDocument();
    expect(screen.queryByText("Gym Lead")).not.toBeInTheDocument();
    expect(screen.queryByText("Case Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Available Leads:")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByText("Story Narration")).not.toBeInTheDocument();
    expect(screen.queryByText("Schema Snapshot")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Student Mode" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Admin Mode" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      screen.queryByRole("heading", { name: "Workspace Context" })
    ).not.toBeInTheDocument();
  });

  it("shows the onboarding entry flow before the student opens Case 004", () => {
    render(<App />);

    expect(screen.queryByText("The Case Library is open")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "I'm Samuel Tupleton." })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Each case moves one verified clue at a time")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select Case 004: The SQL City Murder" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Select Case 004: The SQL City Murder" })
    );

    expect(
      screen.getByRole("heading", { name: "Case 004: The SQL City Murder" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Case File" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Case File" }));

    expect(getStudentCaseStorageKey("case-004")).toBe(STUDENT_CASE_STORAGE_KEY);
    expect(screen.getByRole("button", { name: "Query Lab" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Case Library" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Progress" })).toBeInTheDocument();
    expect(screen.getByText("Case 004 Briefing")).toBeInTheDocument();
  });

  it("cancels Case 004 progress reset without clearing local or in-memory state", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    window.localStorage.setItem(
      STUDENT_CASE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        caseId: "case-004",
        state: {
          studentView: "workbench",
          selectedStudentTable: "dbo.crime_scene_report",
          studentDraftQuery: "SELECT *\nFROM CrimeSceneReport",
          completedMilestones: {
            "crime-type": true
          },
          samuelStage: 1,
          notebookEntries: [
            {
              id: "crime-type-murder",
              detail: "CrimeID = 1080",
              sourceLabel: "Samuel Step 1"
            }
          ],
          pendingEvidenceStep: "crime-scene-filter",
          studentEvidenceFeedback: "Keep filtering.",
          studentEvidenceFeedbackTone: "success",
          studentEvidenceFeedbackVersion: 1,
          manualNotebookDraft: "Do not lose this.",
          caseReviewStatus: "idle",
          caseReviewStatusId: null,
          earnedCaseReviewIds: [],
          studentSuspectTheoryDraft: "",
          studentSuspectTheoryResult: null,
          studentSuspectTheoryError: null
        }
      })
    );
    window.localStorage.setItem(
      INVESTIGATION_THREADS_STORAGE_KEY,
      JSON.stringify([{ id: "thread-crime-scene-report", learnerNotes: "Keep this note." }])
    );

    render(<App initialStudentCaseEntered />);

    await screen.findByText(isCrimeSceneReportDraft);

    fireEvent.click(screen.getByRole("button", { name: "Reset Progress" }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(INVESTIGATION_THREADS_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByText(isCrimeSceneReportDraft)).toBeInTheDocument();
    expect(screen.getByText(/Case 004 .* 1\/8 clues logged/)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("confirms Case 004 progress reset and restores authored defaults without touching other storage", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    window.localStorage.setItem(
      STUDENT_CASE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        caseId: "case-004",
        state: {
          studentView: "workbench",
          selectedStudentTable: "dbo.crime_scene_report",
          studentDraftQuery: "SELECT *\nFROM CrimeSceneReport",
          completedMilestones: {
            "crime-type": true
          },
          samuelStage: 1,
          notebookEntries: [
            {
              id: "crime-type-murder",
              detail: "CrimeID = 1080",
              sourceLabel: "Samuel Step 1"
            }
          ],
          pendingEvidenceStep: "crime-scene-filter",
          studentEvidenceFeedback: "Keep filtering.",
          studentEvidenceFeedbackTone: "success",
          studentEvidenceFeedbackVersion: 1,
          manualNotebookDraft: "Clear this draft.",
          caseReviewStatus: "idle",
          caseReviewStatusId: null,
          earnedCaseReviewIds: [],
          studentSuspectTheoryDraft: "Jeremy Bowers",
          studentSuspectTheoryResult: null,
          studentSuspectTheoryError: null
        }
      })
    );
    window.localStorage.setItem(
      INVESTIGATION_THREADS_STORAGE_KEY,
      JSON.stringify([{ id: "thread-crime-scene-report", learnerNotes: "Clear this note." }])
    );
    window.localStorage.setItem(getStudentCaseStorageKey("case-006"), "future-case-progress");
    window.localStorage.setItem("sequel-city.unrelated", "keep");

    render(<App initialStudentCaseEntered />);

    await screen.findByText(isCrimeSceneReportDraft);

    fireEvent.click(screen.getByRole("button", { name: "Reset Progress" }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INVESTIGATION_THREADS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-006"))).toBe(
      "future-case-progress"
    );
    expect(window.localStorage.getItem("sequel-city.unrelated")).toBe("keep");
    expect(screen.getByText("Case 004 Briefing")).toBeInTheDocument();
    expect(screen.getByText(/Case 004 .* 0\/8 clues logged/)).toBeInTheDocument();
    expect(screen.queryByText(isCrimeSceneReportDraft)).not.toBeInTheDocument();
    expect(screen.queryByText("CrimeID = 1080")).not.toBeInTheDocument();

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INVESTIGATION_THREADS_STORAGE_KEY)).toBeNull();

    confirmSpy.mockRestore();
  });

  it("shows no default case preview, then reveals case details when a spine is hovered", () => {
    render(<App />);

    expect(
      screen.getByText("Hover over a spine to preview the case file here.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "The Widow of Cinder Lane" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Archive Locked")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Case 004" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Select Case 006: The Widow of Cinder Lane" })
    );

    expect(screen.getByRole("heading", { name: "The Widow of Cinder Lane" })).toBeInTheDocument();
    expect(screen.getByText("Archive Locked")).toBeInTheDocument();
    expect(
      screen.getByText(/A darker social-profile case that leans on interview content/i)
    ).toBeInTheDocument();
  });

  it("returns to the case library from Student Mode without relying on refresh", () => {
    render(<App initialStudentCaseEntered />);

    expect(screen.getByRole("button", { name: "Query Lab" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Case Selection" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Case Library" }));

    expect(
      screen.getByRole("heading", { name: "I'm Samuel Tupleton." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select Case 004: The SQL City Murder" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();
  });

  it("opens a themed landing page for locked cases without entering the investigation", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" })
    );

    expect(
      screen.getByRole("heading", { name: "Case 001: The Clocktower Poisoning" })
    ).toBeInTheDocument();
    expect(screen.getByText("Public Spectacle")).toBeInTheDocument();
    expect(
      screen.getByText("One public death. Too many witnesses. Not enough clean timing.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive Locked" })).toBeDisabled();
    expect(screen.queryByText("Development skeleton")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back To Library" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Select Case 006: The Widow of Cinder Lane" })
    );

    expect(
      screen.getByRole("heading", { name: "Case 006: The Widow of Cinder Lane" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive Locked" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-006"))).toBeNull();
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
  });

  it("does not let browser history restore a non-playable case into the investigation", async () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: {
            "student-case-screen": "case",
            "student-case-id": "case-006"
          }
        })
      );
    });

    expect(
      screen.getByRole("heading", { name: "Case 006: The Widow of Cinder Lane" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive Locked" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: {
            "student-case-screen": "case",
            "student-case-id": "case-999"
          }
        })
      );
    });

    expect(
      screen.queryByRole("heading", { name: "Case 006: The Widow of Cinder Lane" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Case 004 Briefing")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-006"))).toBeNull();
    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-999"))).toBeNull();
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
  });

  it("does not let browser history restore Case 001 when the skeleton gate is disabled", async () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: {
            "student-case-screen": "case",
            "student-case-id": "case-001"
          }
        })
      );
    });

    expect(
      screen.getByRole("heading", { name: "Case 001: The Clocktower Poisoning" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive Locked" })).toBeDisabled();
    expect(screen.queryByText("Development skeleton")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Query Lab" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-001"))).toBeNull();
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INVESTIGATION_THREADS_STORAGE_KEY)).toBeNull();
  });

  it("opens gated Case 001 in the shared playable shell without persistence", async () => {
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");

    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" })
    );

    expect(screen.getByRole("button", { name: "Open Case File" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Open Case File" }));

    expect(
      screen.getByRole("heading", { name: /Case 001 .* The Clocktower Poisoning/ })
    ).toBeInTheDocument();
    expect(screen.getByText("Case 001 Briefing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Samuel's Briefing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Query Lab" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evidence Board" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Progress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Clocktower Poisoning" })).toBeInTheDocument();
    expect(screen.getByText(/May 2nd, 2023: a civic clocktower ceremony/i)).toBeInTheDocument();
    expect(screen.queryByText("Case 004 Briefing")).not.toBeInTheDocument();
    expect(screen.getByText("Inspect CrimeSceneReport.")).toBeInTheDocument();
    expect(screen.getByText(/Start by inspecting CrimeSceneReport/i)).toBeInTheDocument();
    expect(screen.getByText(/Look for the public clocktower poisoning report/i)).toBeInTheDocument();
    expect(screen.queryByText(/murder code/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/witness trail/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/suspect theory/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Development skeleton")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Case 001 checkpoint summary")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByRole("heading", { name: "Query Runner" })).toBeInTheDocument();
    expect(screen.getByLabelText("Clocktower Evidence Path")).toBeInTheDocument();
    expect(screen.getByText("Draft Query: SELECT * FROM CrimeSceneReport;")).toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*CrimeID = 1080/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*ReportDate = 20230502/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*ReportCity = 'Sequel City'/i)).not.toBeInTheDocument();


    fireEvent.click(screen.getByRole("button", { name: "Simulate Case 001 Report Match" }));

    expect(screen.getByText(/Public report located/i)).toBeInTheDocument();
    expect(screen.getAllByText(/proved ReportID from the clocktower report row/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Draft Query: SELECT * FROM InterviewLog;")).toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*WHERE ReportID IN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*CrimeID = 1080/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*ReportDate = 20230502/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*ReportCity = 'Sequel City'/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Clocktower Evidence Path")).toHaveTextContent("InterviewLog");
    expect(screen.getByLabelText("Clocktower Evidence Path")).toHaveTextContent("ReportID");

    fireEvent.click(screen.getByRole("button", { name: "Simulate Case 001 Interview Match" }));

    expect(screen.getByText(/Report-linked interviews located/i)).toBeInTheDocument();
    expect(screen.queryByText(/PersonID values you actually observed/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Draft Query: SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Draft Query: SELECT * FROM PersonsOfInterest;")).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*JOIN InterviewLog/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*WHERE i\.ReportID IN/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Clocktower Evidence Path")).toHaveTextContent("InterviewLog");
    expect(screen.getByLabelText("Clocktower Evidence Path")).toHaveTextContent("ReportID");
    expect(screen.getByLabelText("Clocktower Evidence Path")).not.toHaveTextContent("PersonsOfInterest");
    expect(screen.getByLabelText("Clocktower Evidence Path")).not.toHaveTextContent("PersonID");
    expect(screen.queryByText(/Witness identities resolved/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Draft Query: SELECT * FROM EventSchedule;")).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*JOIN EventRegistration/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: .*WHERE e\.EventID = 2993/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Clocktower Evidence Path")).not.toHaveTextContent("EventSchedule");
    expect(screen.getByLabelText("Clocktower Evidence Path")).not.toHaveTextContent("EventRegistration");
    expect(screen.getByLabelText("Clocktower Evidence Path")).not.toHaveTextContent("EventID");

    fireEvent.click(screen.getByRole("button", { name: "Case File" }));

    expect(screen.getByRole("tab", { name: "Pinned Facts" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Case Facts" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    expect(screen.getByRole("heading", { name: "Evidence Notebook" })).toBeInTheDocument();
    expect(document.body).toHaveTextContent(/Completed milestones:\s*2\s*\/\s*2/);
    expect(screen.getByText("Clocktower Incident Report Located")).toBeInTheDocument();
    expect(screen.getByText("Clocktower Report Interviews Located")).toBeInTheDocument();
    expect(screen.queryByText("Witness identities resolved")).not.toBeInTheDocument();
    expect(screen.queryByText("Suspect Theory Check")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Case Library" })).toBeInTheDocument();
    expect(screen.queryByText("Case 004 Briefing")).not.toBeInTheDocument();
    expect(screen.queryByText(/Case 004 .* clues logged/)).not.toBeInTheDocument();

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    expect(window.localStorage.getItem(getStudentCaseStorageKey("case-001"))).toBeNull();
    expect(window.localStorage.getItem(STUDENT_CASE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INVESTIGATION_THREADS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem("sequel-city.text-size")).toBe("default");

    fireEvent.click(screen.getByRole("button", { name: "Case Library" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Open Case File" }));

    expect(screen.getByText("Case 001 Briefing")).toBeInTheDocument();
    expect(screen.queryByLabelText("Case 001 checkpoint summary")).not.toBeInTheDocument();
  });
  it("never renders investigation trail UI in Student Mode after milestone progression", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    expect(screen.queryByText("Current Investigation Focus")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Review investigation trails/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Anchor the crime scene report")).not.toBeInTheDocument();
    expect(screen.queryByText("Witness statement trail")).not.toBeInTheDocument();
    expect(screen.queryByText(/Investigation Trail Diagnostics/i)).not.toBeInTheDocument();
    expect(screen.getByText("Evidence Notebook")).toBeInTheDocument();
    expect(screen.getAllByText("Case Progress").length).toBeGreaterThan(0);
  });

  it("exposes the investigation trail diagnostics panel in Admin Mode", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Admin Mode" }));

    expect(
      screen.getByRole("heading", { name: "Investigation Trail Diagnostics" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Progress" })).not.toBeInTheDocument();
    expect(
      screen.getByText(/Developer-only view of the deterministic trail visibility model/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Primary thread: thread-crime-scene-report/)
    ).toBeInTheDocument();
    expect(screen.getByText("thread-crime-scene-report")).toBeInTheDocument();
    expect(screen.getByText("thread-event-and-employment")).toBeInTheDocument();
  });

  it("switches to developer mode shell content", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Admin Mode" }));

    expect(
      screen.getByRole("heading", { name: "First-Run Guidance" })
    ).toBeInTheDocument();
    expect(screen.getByText("Startup Command")).toBeInTheDocument();
    expect(screen.getByText("Frontend URL")).toBeInTheDocument();
    expect(screen.getByText("Backend API URL")).toBeInTheDocument();
    expect(screen.getByText("First Test Query")).toBeInTheDocument();
    expect(screen.getByText("npm run dev")).toBeInTheDocument();
    expect(screen.getByText("http://127.0.0.1:5173")).toBeInTheDocument();
    expect(screen.getByText("http://127.0.0.1:3001")).toBeInTheDocument();
    expect(screen.getByText("SELECT DB_NAME() AS CurrentDatabase")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Story Narration" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Health Status" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Schema Explorer" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Query Runner" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Suspect Verification" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Query History" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Schema Snapshot" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Student Mode" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Admin Mode" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("keeps scene art visual while moving instructions out of the image overlay", () => {
    render(<App initialStudentCaseEntered />);

    expect(
      screen.getByRole("img", { name: "Crime ledger dossier under a desk lamp with the murder row marked" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Samuel opens the city crime ledger. Find the Murder row before the rest of the file means anything."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "January 15th, 2023. A murder in Sequel City. Follow the evidence trail, test your leads, and identify both suspects."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
  });

  it("progressively reveals new case-note items after student milestones are completed", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.queryByText("Follow the witness trail")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));

    expect(await screen.findByText(/Evidence Prompt:/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Case 004 · The SQL City Murder · 0/8 clues logged" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));

    expect(
      screen.getByRole("heading", { name: "Case 004 · The SQL City Murder · 1/8 clues logged" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Evidence Pinned")).not.toBeInTheDocument();
    expect(screen.getByText(/Good\. CrimeID 1080 is locked in/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Stay in Query Lab and inspect CrimeSceneReport next/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Query Lab" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Query Runner" })).toBeInTheDocument();
    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    // WP-110: avatar now appears in all student views to anchor the visual region without placeholder text.
    expect(document.querySelectorAll(".samuel-avatar").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));
    expect(screen.getByText("CrimeID = 1080")).toBeInTheDocument();
    expect(screen.getByText(/Draft Query: SELECT \* FROM CrimeSceneReport/)).toBeInTheDocument();
    expect(screen.queryByText("Follow the witness trail")).not.toBeInTheDocument();
    expect(screen.queryByText("Track the gym lead")).not.toBeInTheDocument();
    expect(screen.queryByText("Witness 1 File")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    expect(
      screen.getAllByText(/I queued the murder-only filter for you next/).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/WHERE CrimeID = 1080/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    expect(
      screen.getAllByText(/I queued the SQL City filter for you next/).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Evidence Prompt:/)).not.toBeInTheDocument();
    expect(screen.getByText(/AND ReportCity = 'SQL City'/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    expect(await screen.findByText(/Evidence Prompt:/)).toBeInTheDocument();
    expect(screen.getByText(/AND ReportCity = 'SQL City'/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Incorrect Report Log" }));

    expect(
      screen.getByRole("heading", { name: "Case 004 · The SQL City Murder · 1/8 clues logged" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Misread")).not.toBeInTheDocument();
    expect(screen.queryByText("Samuel's Check")).not.toBeInTheDocument();
    expect(screen.queryByText("Skeptical")).not.toBeInTheDocument();
    expect(document.querySelector(".samuel-avatar--skeptical img")?.getAttribute("src")).toContain(
      "avatar-samuel-skeptical-misread"
    );
    // WP-110: wrong-clue feedback is visible both in the mentor header and inline next to the Log Clue action.
    expect(
      screen.getAllByText(/That row is still not the target murder report/).length
    ).toBeGreaterThan(0);
    expect(screen.queryByText("ReportID = 10056")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));

    expect(screen.getByRole("button", { name: "Query Lab" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    expect(screen.getByText("Completed milestones: 2 / 8")).toBeInTheDocument();
    expect(screen.queryByText("Lead Unlocked")).not.toBeInTheDocument();
    expect(screen.getByText("Witness trail unlocked")).toBeInTheDocument();
    // WP-110: avatar appears in all student views to anchor the visual region.
    expect(document.querySelectorAll(".samuel-avatar").length).toBeGreaterThan(0);
    expect(screen.getByText("ReportCity = SQL City")).toBeInTheDocument();
    expect(screen.getByText("ReportDate = 2023-01-15")).toBeInTheDocument();
    expect(screen.getByText("ReportID = 10975")).toBeInTheDocument();
    expect(screen.queryByText("Track the gym lead")).not.toBeInTheDocument();
    expect(screen.queryByText("Gym Lead")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current Step")).toHaveTextContent("Witness Discovery.");
    expect(screen.getByText(/Nice\. The key report row is in your notebook\./)).toBeInTheDocument();
    expect(screen.getByText("Optional reasoning check.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    expect(screen.getByText(/Draft Query: SELECT \* FROM InterviewLog/)).toBeInTheDocument();
    expect(screen.queryByText(/Draft Query: SELECT \* FROM CrimeSceneReport/)).not.toBeInTheDocument();
    expect(screen.getByText("Witness Clue Shortcuts")).toBeInTheDocument();
    expect(screen.queryByText("Training wheels off")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Use the tokens below as query-building hints\. When you need exact proved values, open Case File > Pinned Facts and insert them from there\./)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Instruction: Write your InterviewLog query in the editor using the pinned ReportID, then sort by PersonID."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Failure Guidance: If this query fails, simplify it. Stay with InterviewLog, keep the pinned report ID in your filter, and sort by PersonID. Do not GROUP BY or JOIN yet."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Case Clues")).toBeInTheDocument();
    expect(screen.getByLabelText("Witness Clue Shortcuts")).toHaveTextContent(
      "Two witness leads from the report"
    );
    expect(screen.getByLabelText("Witness Clue Shortcuts")).toHaveTextContent(
      "Query Tokens"
    );
    // WP-110: the artificial "Add one short Evidence Board note" lookup-note step is removed.
    expect(screen.getByLabelText("Witness Clue Shortcuts")).not.toHaveTextContent(
      "Add one short Evidence Board note"
    );
    expect(screen.getByLabelText("Witness Clue Shortcuts")).not.toHaveTextContent(
      "next person or address lookup"
    );
    expect(screen.getByText("InterviewLog")).toBeInTheDocument();
    expect(screen.getByText("ReportID")).toBeInTheDocument();
    expect(screen.getAllByText("PersonID").length).toBeGreaterThan(0);
    expect(screen.getByText(/Draft Query:\s*SELECT \*\s*FROM InterviewLog$/)).toBeInTheDocument();
    expect(screen.queryByText(/Draft Query:\s*SELECT \*\s*FROM InterviewLog\s*WHERE ReportID = 10975/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    expect(
      screen.getByText(
        "Student Instruction: Log one strong row from the first repeated PersonID bundle."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evidence Prompt: Step 2 target: use Log Clue on one strong row from the first repeated PersonID witness bundle."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    // WP-110: wrong-clue feedback is visible both in the mentor header and inline next to the Log Clue action.
    expect(
      screen.getAllByText(/That row sounds like confession or contract detail/).length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.getByText("Witness Checklist")).toBeInTheDocument();
    expect(screen.getByText("Items still needed:")).toBeInTheDocument();
    expect(screen.getByText(/1\. Log the second witness bundle:/)).toBeInTheDocument();
    // WP-110: the artificial lookup-note step is removed from the checklist.
    expect(screen.queryByText(/Add the next lookup note/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Keep ReportID pinned:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Log the first witness bundle:/)).not.toBeInTheDocument();
    expect(screen.getByText("Witness PersonID = 14887")).toBeInTheDocument();
    expect(document.body).toHaveTextContent(/Witness bundle 14887/i);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(
      screen.getByText(
        "Evidence Prompt: Step 3 target: use Log Clue on one strong row from the second repeated PersonID witness bundle."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));

    // WP-110: logging the second witness bundle auto-completes the witness-clues milestone.
    // No artificial "write a lookup note" step is required to open the Gym Lead.
    expect(screen.getByText(/3\/8 clues logged/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));
    expect(screen.getByText("Witness PersonID = 16371")).toBeInTheDocument();
    expect(screen.queryByText(/Add the next lookup note/)).not.toBeInTheDocument();
    expect(screen.queryByText(/which person or address lookup those PersonIDs should be used for next/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Log the second witness bundle:/)).not.toBeInTheDocument();
    expect(screen.getByText("Witness trail unlocked")).toBeInTheDocument();
    expect(
      screen.getByText("Pin the two witness names tied to the PersonIDs you already proved.")
    ).toBeInTheDocument();
    expect(screen.getByText("Draft Query: SELECT * FROM PersonsOfInterest")).toBeInTheDocument();
    expect(screen.queryByText("Restored Previous Results")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Instruction: Run the broad PersonsOfInterest lookup first, then open Case File > Pinned Facts and narrow it with both witness PersonIDs before you log any names."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Failure Guidance: If this query stalls, keep it simple. Stay with PersonsOfInterest, filter by the pinned PersonIDs, and skip JOINs for now."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evidence Prompt: Step 4 target: use Log Clue on both witness-name rows from PersonsOfInterest."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Witness Identity Shortcuts")).toBeInTheDocument();
    expect(screen.getByLabelText("Witness Identity Shortcuts")).toHaveTextContent(
      "Samuel's next step: identify the two witness names first. Start with PersonsOfInterest, then use the pinned witness PersonIDs to narrow the lookup before you log any matching rows."
    );
    expect(screen.getByLabelText("Witness Identity Shortcuts")).toHaveTextContent("Case Clues");
    expect(screen.getByLabelText("Witness Identity Shortcuts")).toHaveTextContent("Query Tokens");
    expect(screen.getByText("PersonsOfInterest")).toBeInTheDocument();
    expect(screen.getAllByText("PersonID").length).toBeGreaterThan(0);
    expect(screen.queryByText("OR")).not.toBeInTheDocument();
    expect(screen.queryByText("=")).not.toBeInTheDocument();
    expect(screen.getByText("Open Case File > Pinned Facts and use the witness PersonIDs for the exact values before you try to log any names.")).toBeInTheDocument();
    expect(screen.queryByText(/WHERE PersonID = 14887/)).not.toBeInTheDocument();
    expect(screen.queryByText(/OR PersonID = 16371/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    expect(document.body).toHaveTextContent(
      /The people table is still too broad on its own\. Open Case File, use both pinned witness PersonIDs to narrow PersonsOfInterest, then log the two matching name rows\./
    );
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    expect(
      screen.getByText(/Witness name logged for PersonID 14887\. Pin the other witness name from this lookup too\./)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(document.body).toHaveTextContent(/Witness Name 14887 = Morty Schapiro/);
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(document.body).toHaveTextContent(/Witness Name 16371 = Annabel Miller/);
    expect(screen.getByText("Samuel's Evidence Review")).toBeInTheDocument();
    expect(screen.getByText("Use the gym bag clue to narrow the membership records.")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Build your next query with FitNFlabClub, then use the gym bag clue that the membership starts with 48Z and only gold members have those bags to narrow the list yourself\./
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    // WP-110: the witness trail guide is no longer shown once witness-clues is complete
    // because the artificial notebook-note gate has been removed.
    expect(screen.queryByText(/Samuel needs one notebook note before opening the next lead/))
      .not.toBeInTheDocument();
    expect(screen.queryByText("One Step Left")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Witness Clue Shortcuts")).not.toBeInTheDocument();
    expect(screen.queryByText("Witness Identity Shortcuts")).not.toBeInTheDocument();
    expect(screen.getByText("Gym Membership Clues")).toBeInTheDocument();
    expect(screen.getByLabelText("Gym Membership Clues")).toHaveTextContent("Case Clues");
    expect(screen.getByLabelText("Gym Membership Clues")).toHaveTextContent("Query Tokens");
    expect(screen.queryByText("Draft Query: SELECT * FROM FitNFlabClub")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Instruction: Build your next query with FitNFlabClub, then use the 48Z clue and gold-status clue to narrow the membership records."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Failure Guidance: If this query stalls, keep it simple. Stay with FitNFlabClub and use the 48Z clue plus gold-status clue as your next filters."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("FitNFlabClub")).toBeInTheDocument();
    expect(screen.getByText("FitMemberID")).toBeInTheDocument();
    expect(screen.getByText("FitMembershipStatus")).toBeInTheDocument();
    expect(screen.getByText("48Z")).toBeInTheDocument();
    expect(screen.getByText("gold")).toBeInTheDocument();
    expect(screen.queryByText(/Witness bundle 14887:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Witness bundle 16371:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Scan" }));
    expect(document.body).toHaveTextContent(
      /Good\. You found the membership table\. Now use the witness clues to narrow it: the gym bag membership starts with 48Z, and only gold members have those bags\./
    );
    expect(screen.getByText(/Draft Query: SELECT \* FROM FitNFlabClub/)).toBeInTheDocument();
    expect(screen.queryByText(/\[x\]\s*Track the gym lead/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.getByLabelText("Current Step")).toHaveTextContent("Gym Membership Lead.");
  });

  it("lets students add their own manual notes to the notebook", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    fireEvent.change(screen.getByLabelText("Add your own note"), {
      target: { value: "Witness 1: Last house on Northwestern Dr" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Note" }));

    expect(screen.getByText("Witness 1: Last house on Northwestern Dr")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove note Witness 1: Last house on Northwestern Dr" })
    );

    expect(
      screen.queryByText("Witness 1: Last house on Northwestern Dr")
    ).not.toBeInTheDocument();
  });

  it("advances Samuel Tupleton's briefing through the opening breadcrumbs", async () => {
    render(<App initialStudentCaseEntered />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Determine the Crime ID for murder" })
    ).toBeInTheDocument();
    expect(screen.getByText("January 15th, 2023: a murder was reported in Sequel City.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.getByText("Draft Query: SELECT * FROM CrimeType")).toBeInTheDocument();
    // WP-110: scene imagery now anchors the workbench scene region too, replacing the removed Case Atmosphere placeholder.
    expect(
      screen.getByRole("img", { name: "Crime ledger dossier under a desk lamp with the murder row marked" })
    ).toBeInTheDocument();
    expect(document.querySelector(".samuel-avatar img")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));

    expect(await screen.findByText(/Evidence Prompt:/)).toBeInTheDocument();
    expect(screen.queryByText("Breadcrumbs 0 / 3")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));

    fireEvent.click(screen.getByRole("button", { name: "Samuel's Briefing" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Look at the Crime Scene Report" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Breadcrumbs 1 / 3")).toHaveLength(1);
    expect(
      screen.getByRole("img", { name: "Glowing evidence board with a confirmed clue pinned at the center" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("What this case asks you to prove")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.getByText(/Draft Query: SELECT \* FROM CrimeSceneReport/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    expect(screen.queryByText("Breadcrumbs 2 / 3")).not.toBeInTheDocument();
    expect(screen.queryByText(/AND ReportCity = 'SQL City'/)).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/I queued the murder-only filter for you next/).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/WHERE CrimeID = 1080/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    expect(
      screen.getAllByText(/I queued the SQL City filter for you next/).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/AND ReportCity = 'SQL City'/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));

    expect(await screen.findByText(/Evidence Prompt:/)).toBeInTheDocument();
    expect(screen.queryByText("Breadcrumbs 2 / 3")).not.toBeInTheDocument();
    // WP-110: scene imagery is always visible across student views; this assertion no longer hides the murder board image.
    expect(
      screen.getByRole("img", { name: "Murder board covered in report scraps, red string, and the highlighted crime ID" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You have the right report table now\. Combine the murder code with SQL City/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));

    fireEvent.click(screen.getByRole("button", { name: "Samuel's Briefing" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Filter down to the murder reports" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Breadcrumbs 3 / 3")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.queryByText("Which evidence chain proves you found the target murder report?")).not.toBeInTheDocument();
    expect(screen.queryByText(/Samuel unlocks the witness trail/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current Step")).toHaveTextContent("Witness Discovery.");
    expect(screen.queryByText("Lead Unlocked")).not.toBeInTheDocument();
    expect(screen.getByText("Witness trail unlocked")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Glowing evidence board with a confirmed clue pinned at the center" })
    ).toBeInTheDocument();
  });

  it("shows concise schema details when a table link is selected", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Quick Table Clues" }));
    expect(await screen.findByRole("button", { name: "dbo.person" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "dbo.person" }));

    expect(screen.getAllByText("dbo.person").length).toBeGreaterThan(0);
    expect(screen.getByText("Column")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("PK")).toBeInTheDocument();
    expect(screen.getByText("FK")).toBeInTheDocument();
  });

  it("lets students click a pinned fact to send a query assist into the editor", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));

    fireEvent.click(screen.getByRole("button", { name: "Add CrimeID = 1080 to query editor" }));

    expect(screen.getByText("Query Assist: CrimeID = 1080")).toBeInTheDocument();
  });

  it("lets students click Samuel's witness clue tokens to send query assist text into the editor", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    fireEvent.click(screen.getByRole("button", { name: "Add Northwestern Dr to query editor" }));
    expect(screen.getByText("Query Assist: 'Northwestern Dr'")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add 10975 to query editor" }));
    expect(screen.getByText("Query Assist: 10975")).toBeInTheDocument();
  });

  it("opens Case File to Pinned Facts by default and closes it when students click back into Query Runner work", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));

    expect(screen.getByRole("heading", { name: "Pinned Facts" })).toBeInTheDocument();
    expect(screen.getByText(/No facts pinned yet/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("heading", { name: "Query Runner" }));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Pinned Facts" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Close Case File" })).not.toBeInTheDocument();
    });
  });

  it("renders single-value pinned facts as one clickable fact line without a duplicate token chip", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));

    const crimeIdFact = screen.getByRole("button", {
      name: "Add CrimeID = 1080 to query editor"
    });

    expect(within(crimeIdFact).getByText("CrimeID = 1080")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add CrimeID from CrimeID = 1080 to query editor" })).not.toBeInTheDocument();
  });

  it("renders Samuel avatar and scene image in Briefing view", () => {
    render(<App initialStudentCaseEntered />);

    const header = document.querySelector(".student-case-header");
    expect(document.querySelector(".samuel-avatar img")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Crime ledger dossier under a desk lamp with the murder row marked" })
    ).toBeInTheDocument();
    expect(header?.getAttribute("data-active-view")).toBe("briefing");
    expect(header?.getAttribute("data-header-variant")).toBe("briefing-full");
    expect(header?.classList.contains("student-case-header--variant-briefing-full")).toBe(true);
    const briefingHeading = header?.querySelector(".student-case-header__heading");
    expect(briefingHeading?.tagName).toBe("H2");
    expect(briefingHeading?.textContent).toBe("Case 004 Briefing");
  });

  it("renders Samuel avatar and scene imagery in Query Lab header with mentor-hero variant (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    const header = document.querySelector(".student-case-header");
    expect(document.querySelector(".samuel-avatar img")).toBeInTheDocument();
    expect(header?.getAttribute("data-active-view")).toBe("workbench");
    expect(header?.getAttribute("data-header-variant")).toBe("workbench-mentor-hero");
    expect(
      header?.classList.contains("student-case-header--variant-workbench-mentor-hero")
    ).toBe(true);
    expect(
      header?.classList.contains("student-case-header--view-workbench")
    ).toBe(true);
    const guidance = header?.querySelector(".student-case-header__region--guidance");
    expect(guidance).not.toBeNull();
    const visualRegion = header?.querySelector(".student-case-header__region--visual");
    expect(visualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
    const workbenchHeading = guidance?.querySelector(".student-case-header__heading");
    expect(workbenchHeading).not.toBeNull();
    expect(workbenchHeading?.getAttribute("data-mentor-strip-role")).toBe("workbench");
    expect(workbenchHeading?.textContent).toBe("Samuel's Guidance");
    expect(guidance?.querySelector(".samuel-avatar-name")).toBeNull();
    expect(guidance?.querySelector(".student-case-header__message")).not.toBeNull();
    expect(guidance?.querySelector(".student-case-header__rewards")).not.toBeNull();
    const sceneRegion = header?.querySelector(".student-case-header__region--scene");
    expect(sceneRegion).not.toBeNull();
    // WP-110: Case Atmosphere placeholder is removed; scene imagery carries atmosphere instead.
    expect(sceneRegion?.querySelector(".student-case-header__atmosphere")).toBeNull();
    expect(sceneRegion?.querySelector(".student-case-header__visual")).not.toBeNull();
    expect(sceneRegion?.querySelector(".noir-scene-frame")).not.toBeNull();
    expect(screen.queryByText("Case Atmosphere")).not.toBeInTheDocument();
  });

  it("renders Samuel avatar and scene imagery in Evidence Board header with scene-hero variant (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    const header = document.querySelector(".student-case-header");
    expect(
      screen.getByRole("img", { name: "Crime ledger dossier under a desk lamp with the murder row marked" })
    ).toBeInTheDocument();
    expect(header?.getAttribute("data-active-view")).toBe("case-board");
    expect(header?.getAttribute("data-header-variant")).toBe("case-board-scene-hero");
    expect(
      header?.classList.contains("student-case-header--variant-case-board-scene-hero")
    ).toBe(true);
    expect(
      header?.classList.contains("student-case-header--view-case-board")
    ).toBe(true);
    const sceneRegion = header?.querySelector(".student-case-header__region--scene");
    expect(sceneRegion).not.toBeNull();
    const visual = sceneRegion?.querySelector(".student-case-header__visual");
    expect(visual).not.toBeNull();
    expect(visual?.querySelector(".noir-scene-frame")).not.toBeNull();
    expect(visual?.querySelector(".noir-scene-frame__image")).not.toBeNull();
    const visualRegion = header?.querySelector(".student-case-header__region--visual");
    expect(visualRegion).not.toBeNull();
    // WP-110: Scene Detail placeholder is removed; the visual region carries the Samuel avatar
    // so the grid stays stable without noisy placeholder text.
    expect(visualRegion?.querySelector(".student-case-header__detail-card")).toBeNull();
    expect(visualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
    expect(screen.queryByText("Scene Detail")).not.toBeInTheDocument();
    const guidance = header?.querySelector(".student-case-header__region--guidance");
    const caseBoardHeading = guidance?.querySelector(".student-case-header__heading");
    expect(caseBoardHeading).not.toBeNull();
    expect(caseBoardHeading?.getAttribute("data-mentor-strip-role")).toBe("case-board");
    expect(caseBoardHeading?.tagName).toBe("H2");
    expect(caseBoardHeading?.textContent).toBe("Samuel's Evidence Review");
    expect(guidance?.querySelector(".samuel-avatar-name")).toBeNull();
    expect(guidance?.querySelector(".student-case-header__message")).not.toBeNull();
    expect(screen.queryByText("Samuel's advice")).not.toBeInTheDocument();
    expect(screen.queryByText("Samuel's nudge")).not.toBeInTheDocument();
    expect(screen.queryByText("Evidence Review")).not.toBeInTheDocument();
  });

  it("exposes a stable shared-grid shell across all three student views", () => {
    render(<App initialStudentCaseEntered />);

    const briefingHeader = document.querySelector(".student-case-header");
    expect(briefingHeader).not.toBeNull();
    expect(briefingHeader?.getAttribute("data-stable-shell")).toBe("student-case-header");
    expect(briefingHeader?.getAttribute("data-shared-grid")).toBe("student-header-grid");
    expect(briefingHeader?.getAttribute("data-active-view")).toBe("briefing");
    const briefingGrid = briefingHeader?.querySelector(".student-case-header__grid");
    expect(briefingGrid?.getAttribute("data-stable-grid")).toBe("student-header-grid");
    expect(
      briefingGrid?.querySelector(
        '[data-stable-region="visual"].student-case-header__region--visual'
      )
    ).not.toBeNull();
    expect(
      briefingGrid?.querySelector(
        '[data-stable-region="guidance"].student-case-header__region--guidance'
      )
    ).not.toBeNull();
    expect(
      briefingGrid?.querySelector(
        '[data-stable-region="scene"].student-case-header__region--scene'
      )
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    const workbenchHeader = document.querySelector(".student-case-header");
    expect(workbenchHeader).not.toBeNull();
    expect(workbenchHeader?.getAttribute("data-stable-shell")).toBe("student-case-header");
    expect(workbenchHeader?.getAttribute("data-shared-grid")).toBe("student-header-grid");
    expect(workbenchHeader?.getAttribute("data-active-view")).toBe("workbench");
    const workbenchGrid = workbenchHeader?.querySelector(".student-case-header__grid");
    expect(
      workbenchGrid?.querySelector('[data-stable-region="visual"]')
    ).not.toBeNull();
    expect(
      workbenchGrid?.querySelector('[data-stable-region="guidance"]')
    ).not.toBeNull();
    expect(
      workbenchGrid?.querySelector('[data-stable-region="scene"]')
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardHeader = document.querySelector(".student-case-header");
    expect(caseBoardHeader).not.toBeNull();
    expect(caseBoardHeader?.getAttribute("data-stable-shell")).toBe("student-case-header");
    expect(caseBoardHeader?.getAttribute("data-shared-grid")).toBe("student-header-grid");
    expect(caseBoardHeader?.getAttribute("data-active-view")).toBe("case-board");
    const caseBoardGrid = caseBoardHeader?.querySelector(".student-case-header__grid");
    expect(
      caseBoardGrid?.querySelector('[data-stable-region="visual"]')
    ).not.toBeNull();
    expect(
      caseBoardGrid?.querySelector('[data-stable-region="guidance"]')
    ).not.toBeNull();
    expect(
      caseBoardGrid?.querySelector('[data-stable-region="scene"]')
    ).not.toBeNull();
  });

  it("renders consistent guidance headings across all three Student Mode views", () => {
    render(<App initialStudentCaseEntered />);

    const briefingHeading = document
      .querySelector(".student-case-header")
      ?.querySelector(".student-case-header__heading");
    expect(briefingHeading?.textContent).toBe("Case 004 Briefing");

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    const workbenchHeading = document
      .querySelector(".student-case-header")
      ?.querySelector(".student-case-header__heading");
    expect(workbenchHeading?.textContent).toBe("Samuel's Guidance");

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardHeading = document
      .querySelector(".student-case-header")
      ?.querySelector(".student-case-header__heading");
    expect(caseBoardHeading?.textContent).toBe("Samuel's Evidence Review");
  });

  it("keeps the Case Status kicker visible while suppressing the removed Scene Detail and Case Atmosphere kickers across views (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    const briefingHeader = document.querySelector(".student-case-header");
    const briefingKicker = briefingHeader?.querySelector(".student-case-header__kicker");
    expect(briefingKicker?.textContent).toBe("Case Status");

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    const workbenchHeader = document.querySelector(".student-case-header");
    expect(
      workbenchHeader?.querySelector(".student-case-header__kicker")?.textContent
    ).toBe("Case Status");
    expect(
      workbenchHeader?.querySelector(".student-case-header__atmosphere-kicker")
    ).toBeNull();
    expect(screen.queryByText("Case Atmosphere")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardHeader = document.querySelector(".student-case-header");
    expect(
      caseBoardHeader?.querySelector(".student-case-header__kicker")?.textContent
    ).toBe("Case Status");
    expect(
      caseBoardHeader?.querySelector(".student-case-header__detail-card-kicker")
    ).toBeNull();
    expect(screen.queryByText("Scene Detail")).not.toBeInTheDocument();
  });

  it("anchors avatar and scene visuals to fill their region across all student views (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    const briefingHeader = document.querySelector(".student-case-header");
    const briefingVisualRegion = briefingHeader?.querySelector(
      ".student-case-header__region--visual"
    );
    expect(briefingVisualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
    expect(briefingVisualRegion?.querySelector(".samuel-avatar")).not.toBeNull();
    const briefingSceneRegion = briefingHeader?.querySelector(
      ".student-case-header__region--scene"
    );
    expect(briefingSceneRegion?.querySelector(".noir-scene-frame")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    const workbenchHeader = document.querySelector(".student-case-header");
    const workbenchVisualRegion = workbenchHeader?.querySelector(
      ".student-case-header__region--visual"
    );
    expect(workbenchVisualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
    expect(workbenchVisualRegion?.querySelector(".samuel-avatar")).not.toBeNull();
    expect(workbenchVisualRegion?.querySelector(".samuel-avatar-name")).toBeNull();
    const workbenchSceneRegion = workbenchHeader?.querySelector(
      ".student-case-header__region--scene"
    );
    // WP-110: Case Atmosphere placeholder removed; scene imagery fills the slot to keep the grid stable.
    expect(workbenchSceneRegion?.querySelector(".student-case-header__atmosphere")).toBeNull();
    expect(workbenchSceneRegion?.querySelector(".noir-scene-frame")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardHeader = document.querySelector(".student-case-header");
    const caseBoardVisualRegion = caseBoardHeader?.querySelector(
      ".student-case-header__region--visual"
    );
    // WP-110: Scene Detail placeholder removed; visual region carries the avatar in case-board too.
    expect(caseBoardVisualRegion?.querySelector(".student-case-header__detail-card")).toBeNull();
    expect(caseBoardVisualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
    expect(caseBoardVisualRegion?.querySelector(".samuel-avatar")).not.toBeNull();
    const caseBoardSceneRegion = caseBoardHeader?.querySelector(
      ".student-case-header__region--scene"
    );
    expect(caseBoardSceneRegion?.querySelector(".noir-scene-frame")).not.toBeNull();
  });

  it("renders Samuel reward badges in the same guidance region across all three views", () => {
    render(<App initialStudentCaseEntered />);

    const briefingRewards = document
      .querySelector(".student-case-header__region--guidance")
      ?.querySelector(".student-case-header__rewards");
    expect(briefingRewards).not.toBeNull();
    expect(briefingRewards?.textContent).toContain("Samuel's Trust:");
    expect(briefingRewards?.textContent).toContain("Insight Marks:");

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    const workbenchRewards = document
      .querySelector(".student-case-header__region--guidance")
      ?.querySelector(".student-case-header__rewards");
    expect(workbenchRewards).not.toBeNull();
    expect(workbenchRewards?.textContent).toContain("Samuel's Trust:");
    expect(workbenchRewards?.textContent).toContain("Insight Marks:");

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardRewards = document
      .querySelector(".student-case-header__region--guidance")
      ?.querySelector(".student-case-header__rewards");
    expect(caseBoardRewards).not.toBeNull();
    expect(caseBoardRewards?.textContent).toContain("Samuel's Trust:");
    expect(caseBoardRewards?.textContent).toContain("Insight Marks:");
  });

  it("uses Samuel's Guidance as the single Query Lab heading", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    const header = document.querySelector(".student-case-header");
    const headings = header?.querySelectorAll(".student-case-header__heading");
    expect(headings?.length).toBe(1);
    const queryLabHeading = headings?.[0];
    expect(queryLabHeading?.tagName).toBe("H2");
    expect(queryLabHeading?.textContent).toBe("Samuel's Guidance");
    expect(header?.querySelector(".samuel-avatar-name")).toBeNull();
    expect(screen.queryByText("Samuel's nudge")).not.toBeInTheDocument();
    expect(screen.queryByText("Samuel's advice")).not.toBeInTheDocument();

    expect(screen.queryByText("No facts pinned yet.")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Run Samuel's opening query and log the clue that matters/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Facts you already proved. Click one to insert it.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));
    expect(screen.getByText("No facts pinned yet.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Facts you already proved. Click one to insert it into the query editor when a direct query fragment is available."
      )
    ).toBeInTheDocument();
  });

  it("puts the required objective and next step in Samuel's header while support panels stay short (WP-111)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByText("What to prove")).toBeInTheDocument();
    expect(screen.getByText("Find both witnesses tied to the pinned report.")).toBeInTheDocument();
    expect(screen.getByText("What to do next")).toBeInTheDocument();
    expect(
      screen.getByText(/Nice\. The key report row is in your notebook\. Head back to the Query Lab/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Instruction: Write your InterviewLog query in the editor using the pinned ReportID, then sort by PersonID."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.getByLabelText("Current Step")).toHaveTextContent("Witness Discovery.");
    expect(screen.getByText("See Samuel's Guidance above for the full direction.")).toBeInTheDocument();
  });

  it("updates Samuel's witness objective after the first witness bundle is pinned", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    expect(screen.getByText("What to prove")).toBeInTheDocument();
    expect(screen.getByText("Find the second witness tied to the pinned report.")).toBeInTheDocument();
    expect(screen.getByLabelText("Current Step")).toHaveTextContent("Witness Discovery.");
  });

  it("matches Evidence Board scene composition to the Briefing scene", () => {
    render(<App initialStudentCaseEntered />);

    const briefingHeader = document.querySelector(".student-case-header");
    expect(briefingHeader?.getAttribute("data-active-view")).toBe("briefing");
    const briefingScene = briefingHeader?.querySelector(
      ".student-case-header__region--scene"
    );
    expect(briefingScene?.querySelector(".student-case-header__visual")).not.toBeNull();
    expect(briefingScene?.querySelector(".noir-scene-frame")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    const caseBoardHeader = document.querySelector(".student-case-header");
    const caseBoardScene = caseBoardHeader?.querySelector(
      ".student-case-header__region--scene"
    );
    expect(caseBoardScene?.querySelector(".student-case-header__visual")).not.toBeNull();
    expect(caseBoardScene?.querySelector(".noir-scene-frame")).not.toBeNull();
    expect(caseBoardScene?.querySelector(".noir-scene-frame__image")).not.toBeNull();
    // WP-110: Avatar stays in the visual region across all views (no Scene Detail placeholder).
    expect(caseBoardHeader?.querySelector(".samuel-avatar")).not.toBeNull();
    expect(caseBoardHeader?.querySelector(".samuel-avatar-frame")).not.toBeNull();
  });

  it("renders larger student navigation tab buttons with stable accessibility hooks", () => {
    render(<App initialStudentCaseEntered />);

    const briefingTab = screen.getByRole("button", { name: "Samuel's Briefing" });
    const queryLabTab = screen.getByRole("button", { name: "Query Lab" });
    const evidenceTab = screen.getByRole("button", { name: "Evidence Board" });
    expect(briefingTab.closest("nav")?.getAttribute("aria-label")).toBe(
      "Student Case Actions"
    );
    expect(briefingTab).toHaveAttribute("aria-pressed", "true");
    expect(briefingTab).toHaveAttribute("aria-current", "page");
    expect(queryLabTab).toHaveAttribute("aria-pressed", "false");
    expect(evidenceTab).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps Case Progress subordinate to Samuel's Guidance and keeps the check-in optional", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    const currentStep = screen.getByLabelText("Current Step");
    expect(currentStep).toHaveTextContent("Follow Samuel's current instruction.");
    expect(currentStep).toHaveTextContent("See Samuel's Guidance above for the full direction.");
    expect(document.querySelector(".student-required-callout")).toBeNull();

    const optionalSection = screen
      .getByText("Samuel's Check-In")
      .closest("section");
    expect(optionalSection).not.toBeNull();
    expect(optionalSection).toHaveClass("student-optional-callout");
    expect(screen.getByText("Optional reasoning check.")).toBeInTheDocument();
    expect(screen.queryByText("Optional Samuel's Check-In")).not.toBeInTheDocument();
  });

  it("never renders the removed Scene Detail or Case Atmosphere placeholders in any Student Mode view (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    expect(screen.queryByText("Scene Detail")).not.toBeInTheDocument();
    expect(screen.queryByText("Case Atmosphere")).not.toBeInTheDocument();
    expect(document.querySelector(".student-case-header__detail-card")).toBeNull();
    expect(document.querySelector(".student-case-header__atmosphere")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.queryByText("Scene Detail")).not.toBeInTheDocument();
    expect(screen.queryByText("Case Atmosphere")).not.toBeInTheDocument();
    expect(document.querySelector(".student-case-header__detail-card")).toBeNull();
    expect(document.querySelector(".student-case-header__atmosphere")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.queryByText("Scene Detail")).not.toBeInTheDocument();
    expect(screen.queryByText("Case Atmosphere")).not.toBeInTheDocument();
    expect(document.querySelector(".student-case-header__detail-card")).toBeNull();
    expect(document.querySelector(".student-case-header__atmosphere")).toBeNull();
  });

  it("keeps the stable shared header grid intact after removing the placeholder cards (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    for (const viewLabel of ["Query Lab", "Evidence Board", "Samuel's Briefing"] as const) {
      fireEvent.click(screen.getByRole("button", { name: viewLabel }));
      const header = document.querySelector(".student-case-header");
      const grid = header?.querySelector(".student-case-header__grid");
      expect(grid?.getAttribute("data-stable-grid")).toBe("student-header-grid");
      expect(
        grid?.querySelector('[data-stable-region="visual"]')
      ).not.toBeNull();
      expect(
        grid?.querySelector('[data-stable-region="guidance"]')
      ).not.toBeNull();
      expect(
        grid?.querySelector('[data-stable-region="scene"]')
      ).not.toBeNull();
      // Each region still anchors meaningful imagery rather than an empty box.
      const visualRegion = grid?.querySelector('[data-stable-region="visual"]');
      const sceneRegion = grid?.querySelector('[data-stable-region="scene"]');
      expect(visualRegion?.querySelector(".samuel-avatar-frame")).not.toBeNull();
      expect(sceneRegion?.querySelector(".noir-scene-frame")).not.toBeNull();
    }
  });

  it("shows visible, supportive, spoiler-safe wrong-clue feedback inline next to Log Clue (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate Incorrect Report Log" }));

    // The mocked QueryRunner exposes the feedback props as plain text nodes
    // so we can assert both the message text and its tone reach the
    // workbench surface where the student just clicked Log Clue.
    expect(
      screen.getByText(/Evidence Feedback:.*That row is still not the target murder report/)
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence Tone: error")).toBeInTheDocument();
    // Wrong-clue feedback must remain spoiler-safe.
    expect(screen.queryByText("ReportID = 10975")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Annabel/i)
    ).not.toBeInTheDocument();
  });

  it("keeps wrong-clue feedback visible while the student edits SQL and waits for the next query run to clear it", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Incorrect Report Log" }));

    expect(
      screen.getByText(/Evidence Feedback:.*That row is still not the target murder report/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Student SQL Edit" }));

    expect(
      screen.getByText(/Evidence Feedback:.*That row is still not the target murder report/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Evidence Tone:\s*error/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Evidence Prompt:.*Possible clue found\. Review the SQL City murder reports and log the row from January 15th, 2023\./
      )
    ).toBeInTheDocument();
  });

  it("keeps the scene image stable when the student edits SQL and only resets it on query execution", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    expect(
      screen.getByAltText(/Crime ledger dossier under a desk lamp with the murder row marked/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Student SQL Edit" }));

    expect(
      screen.getByAltText(/Crime ledger dossier under a desk lamp with the murder row marked/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));

    expect(
      screen.getByAltText(/Glowing evidence board with a confirmed clue pinned at the center/i)
    ).toBeInTheDocument();
  });

  it("keeps wrong-clue feedback visible until the student takes another action (WP-113)", () => {
    vi.useFakeTimers();
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Incorrect Report Log" }));

    expect(
      screen.getByText(/Evidence Feedback:.*That row is still not the target murder report/)
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(
      screen.getByText(/Evidence Feedback:.*That row is still not the target murder report/)
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence Tone: error")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("flows positive clue feedback through the workbench when a correct clue is logged (WP-110)", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));

    expect(
      await screen.findByText(/Good\. CrimeID 1080 is locked in/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    fireEvent.click(screen.getByRole("tab", { name: "Pinned Facts" }));
    expect(screen.getByText("CrimeID = 1080")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Case 004 · The SQL City Murder · 1/8 clues logged" })
    ).toBeInTheDocument();
  });

  it("restores the current CrimeType result while Query Lab queues CrimeSceneReport feedback (WP-112)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByText(/Draft Query:\s*SELECT \*\s*FROM CrimeSceneReport/)).toBeInTheDocument();
    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
  });

  it("keeps the first clue handoff inside Query Lab with the next draft queued and result visible (WP-115)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));

    expect(screen.getByRole("button", { name: "Query Lab" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Query Runner" })).toBeInTheDocument();
    expect(screen.getByText(/Draft Query:\s*SELECT \*\s*FROM CrimeSceneReport/)).toBeInTheDocument();
    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    expect(screen.getByText(/Good\. CrimeID 1080 is locked in/)).toBeInTheDocument();
  });

  it("restores Samuel's progressive queued report-narrowing help in Query Lab (WP-115)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));

    expect(screen.getByText(/WHERE CrimeID = 1080/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/I queued the murder-only filter for you next/).length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));

    expect(screen.getByText(/AND ReportCity = 'SQL City'/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/I queued the SQL City filter for you next/).length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));

    expect(screen.getByText(/AND ReportCity = 'SQL City'/)).toBeInTheDocument();
  });

  it("keeps Samuel's report guidance visible until action supersedes it (WP-113)", () => {
    vi.useFakeTimers();
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/Good\. CrimeID 1080 is locked in/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Query Lab" })).toBeDisabled();
    expect(screen.getByText(/Draft Query:\s*SELECT \*\s*FROM CrimeSceneReport/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps Samuel's next-step guidance visible after the first clue even when an Insight Mark is earned", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    fireEvent.click(screen.getByRole("button", { name: "It identifies Murder as the crime type to filter reports by." }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByText(/Good\. CrimeID 1080 is locked in/)).toBeInTheDocument();
    expect(
      screen.queryByText("Insight Mark earned. Correct. That code is the filter key for the report archive.")
    ).not.toBeInTheDocument();
  });

  it("keeps Samuel's broad-report guidance specific without falsely claiming a queued filter (WP-113)", () => {
    vi.useFakeTimers();
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    expect(screen.getByText("Reset Key: 0")).toBeInTheDocument();

    expect(screen.getByText(/Good\. You opened the report backlog\./)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(
      screen.getByText(
        /Good\. You opened the report backlog\. I queued the murder-only filter for you next/
      )
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps post-witness guidance aligned to the gym-membership opening move without over-scaffolding (WP-114)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));

    expect(
      screen.getByText("Pin the two witness names tied to the PersonIDs you already proved.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Both witness PersonIDs are pinned now\. Use PersonsOfInterest to identify the two witness names first\./
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/follow the gym clue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WHERE PersonID = 14887/)).not.toBeInTheDocument();
    expect(screen.queryByText(/OR PersonID = 16371/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));

    expect(screen.getByText("Use the gym bag clue to narrow the membership records.")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Build your next query with FitNFlabClub, then use the gym bag clue that the membership starts with 48Z and only gold members have those bags to narrow the list yourself\./
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/identify the two witness names first/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.queryByText("Draft Query: SELECT * FROM FitNFlabClub")).not.toBeInTheDocument();
    expect(screen.queryByText(/WHERE FitMemberID/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WHERE FitMembershipStatus/i)).not.toBeInTheDocument();
  });

  it("turns a narrowed gym membership match into a loggable clue step and advances to the next phases (WP-123)", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));

    expect(
      screen.getByText(
        "Student Instruction: You narrowed the gym lead to one row. Use Log Clue to pin that membership before you move on."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evidence Prompt: Step 5 target: use Log Clue on the single FitNFlabClub row that matches both gym clues."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evidence Feedback: Good. One gym membership row matches both clues. Use Log Clue to pin it before you move on."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));

    expect(
      screen.getByText("Identify the gym-linked person's name from the pinned PersonID.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The gym clue is pinned now\. Open Case File, use the pinned gym lead PersonID/)
    ).toBeInTheDocument();
    expect(screen.getByText(/4\/8 clues logged/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(screen.getByText("Gym Suspect Lookup")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Instruction: Use PersonsOfInterest and the pinned gym lead PersonID from Case File > Pinned Facts to identify the gym-linked person before you test any theory."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("PersonName")).toBeInTheDocument();
    expect(screen.queryByText("Solution")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));

    expect(
      screen.getByText(
        "Review what the gym-linked suspect said in his interview log and pin the row that best shows what his own words add to the case."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Review what the gym-linked suspect said in his interview log and pin the row that best shows what his own words add to the case\./
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    expect(
      screen.getByText(
        "Student Instruction: Stay with InterviewLog and use PersonID 67318 to review what the gym-linked suspect said. Read his own words before you decide what they prove."
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Suspect Theory Check" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    expect(
      screen.getByText(/Review the gym-linked suspect's InterviewLog rows and pin the one row/)
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Suspect Theory Check" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    expect(
      screen.getByText(
        "You reviewed the gym-linked suspect's interview. Click the Evidence Board tab now and decide whether the case is strong enough to test your first suspect theory."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(screen.getByRole("heading", { name: "Suspect Theory Check" })).toBeInTheDocument();
    expect(screen.getByText("Test the first suspect theory.")).toBeInTheDocument();
    expect(
      screen.getByText(/Choose which collected name the evidence supports, then press Test Theory/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Collected Names" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Morty Schapiro" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Annabel Miller" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Jeremy Bowers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test Theory" })).toBeDisabled();

    vi.mocked(verifySuspect).mockResolvedValueOnce({
      success: true,
      data: {
        suspect: "Morty Schapiro",
        verdict: "That suspect is not supported by the case evidence.",
        caseId: "case-004",
        isCorrect: false,
        solvedRole: null,
        nextRole: null,
        suspectPersonId: null
      },
      message: "Suspect verification completed."
    });
    fireEvent.click(screen.getByRole("radio", { name: "Morty Schapiro" }));
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));
    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Morty Schapiro");
    });
    expect(
      screen.getByText(/Theory checked: Morty Schapiro is not supported by the evidence/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Jeremy Bowers" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

      expect(
        screen.getByRole("heading", { name: "First Suspect Confirmed" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Jeremy Bowers is confirmed as the hired killer\./i, {
          selector: ".student-suspect-theory-panel__headline"
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Mastermind Profile", {
          selector: ".student-case-header__beat"
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/Samuel's Evidence Review/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Jeremy Bowers is confirmed\. Re-read Jeremy Bowers' murder-report transcript and pin one clue at a time until the hidden client's profile is specific enough to leave InterviewLog\./i, {
          selector: ".student-case-header__message"
        })
      ).toBeInTheDocument();
      expect(
        screen.getByAltText(
          /Glowing evidence board with a confirmed clue pinned at the center|Samuel reviewing a shadowier second layer of evidence after the hired killer has been identified/i
        )
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
      expect(screen.getByText(/Mastermind Transcript Trail/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          "Student Instruction: Stay with InterviewLog and use Jeremy Bowers' pinned PersonID plus ReportID 10975 to isolate the murder-report transcript before you widen the mastermind search."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Evidence Prompt: Step 7 target: use Log Clue on the transcript row where the killer reveals who hired him."
        )
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
      expect(screen.getByText("Confirmed Hired Killer: Jeremy Bowers")).toBeInTheDocument();
      expect(screen.getByText("CrimeID = 1080")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Page 1 keeps the full first-layer case trail\. Review what these notes really prove, then carry forward only the clues you want to test against the hidden client\./i
        )
      ).toBeInTheDocument();
      const carryNoteBtn = await screen.findByRole("button", {
        name: /Carry note Witness bundle 14887/i
      });
        fireEvent.click(carryNoteBtn);
        await screen.findByText(/Witness bundle 14887/i);
  });

  it("guides the student to add the report filter before logging the mastermind clue (WP-128)", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));

    expect(
      screen.getByAltText(
        /Glowing evidence board with a confirmed clue pinned at the center/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Student Failure Guidance: Open Case File > Pinned Facts and use Jeremy Bowers' PersonID plus ReportID 10975\. Once the transcript set is right, look for the row where the killer admits someone else ordered the hit\./i
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Off Report Confession Row Log" }));
    expect(
      screen.getByText(
        /That row is not tied to ReportID 10975\. Keep the murder-report transcript trail in view before you log the mastermind clue\./i
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mastermind Clue: a wealthy woman paid for the hit/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Filtered Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(
      screen.getByText(
        /Mastermind Clue: a wealthy woman paid for the hit/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
  });

  it("keeps the mastermind transcript result active while multiple clue rows are being collected", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));

    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));

    expect(screen.getByRole("button", { name: "Query Lab" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    expect(screen.getByText(/Mastermind clue logged\./i)).toBeInTheDocument();
    expect(screen.getByText(/Keep this transcript open and keep logging any row that adds a new clue thread\./i)).toBeInTheDocument();
  });

  it("keeps the confirmed suspect transcript results available after the theory check when the same InterviewLog trail still matters (WP-134)", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByText("Restored Previous Results")).toBeInTheDocument();
    expect(screen.getByText(/Mastermind Transcript Trail/i)).toBeInTheDocument();
  });

  it("clears the old DriversLicense draft after the mastermind shortlist is pinned", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Narrowing" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 202298" }));
      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
      fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 857212" }));
      fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.queryByText(/Draft Query: SELECT \* FROM DriversLicense/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Restored Previous Results")).not.toBeInTheDocument();
  });

  it("keeps an in-progress cross-check query draft after students return from Evidence Board", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Narrowing" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 202298" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Student SQL Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(
      screen.getByText("Draft Query: SELECT * FROM DriversLicense WHERE CarMake = 'BMW' AND CarModel = 'M8'")
    ).toBeInTheDocument();
  });

  it("shows pinned mastermind clues in Case File and inserts usable query fragments from them", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));

    expect(
      screen.getByRole("button", {
        name: "Add Mastermind Clue: the killer met the woman who hired him three times last December to query editor"
      })
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Mastermind Clue: the killer met the woman who hired him three times last December to query editor"
      })
    );
    await screen.findByText(/Query Assist Source: Mastermind Clue:/i);
  });

  it("pins the two mastermind identities and advances guidance into the event-trail cross-check", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Narrowing" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 202298" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 857212" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Log 99716" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Log 14307" }));

    await waitFor(() =>
      expect(
        screen.getByText(/Find which EventIDs match the killer's December 2022 Symphony Hall meetings\./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getAllByText(/Query EventSchedule with the December 2022 and Symphony clues, then carry the returned EventIDs into EventRegistration\./i).length
      ).toBeGreaterThan(0)
    );
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    await waitFor(() =>
      expect(
        screen.getByText(/Evidence Prompt: Step 8 target: .*EventSchedule/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Student Failure Guidance: Stay with EventSchedule and add the December clue from the killer's statement first\./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Evidence Prompt: Step 8 target: add the December clue in EventSchedule\./i)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    expect(
      screen.getByText("Mastermind Identity: PersonID 99716, PersonName Miranda Priestly, LicenseID 202298, SSN 987756388")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mastermind Identity: PersonID 14307, PersonName Dani Rawley, LicenseID 857212, SSN 362878596")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    expect(
      screen.getByRole("button", {
        name: "Add EventPersonID from Mastermind Identity: PersonID 99716, PersonName Miranda Priestly, LicenseID 202298, SSN 987756388 to query editor"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Add EventPersonID from Mastermind Identity: PersonID 14307, PersonName Dani Rawley, LicenseID 857212, SSN 362878596 to query editor"
      })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close Case File" }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule" }));
    expect(
      screen.getByText(
        "Student Instruction: Good. You found the Symphony event rows that fit the killer's meeting clue. Query EventRegistration next. Use the EventIDs from the pinned Symphony event clues and the EventPersonID tokens from both pinned mastermind identities."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Student Failure Guidance: You have the Symphony event rows that match the killer's clue trail. Query EventRegistration next. Use the EventIDs from the pinned Symphony event clues and the EventPersonID tokens from both pinned mastermind identities."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Evidence Prompt: Step 8 target: Query EventRegistration next. Use the EventIDs from the pinned Symphony event clues and the EventPersonID tokens from both pinned mastermind identities.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/EventID IN \(/)).not.toBeInTheDocument();
    expect(screen.queryByText(/EventPersonID IN \(/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule Log 3005" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule Log 3257" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Registration" }));
    await waitFor(() =>
      expect(
        screen.getByText(/Student Instruction: The Symphony trail keeps both candidates in play\. Use Employment next with the pinned SSNs/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Student Failure Guidance: Stay with Employment and filter by both pinned SSNs/i)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Employment Lookup" }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Employment Log 362878596" }));
    await waitFor(() =>
      expect(
        screen.getByText(
          /That Employment row keeps a candidate in view, but it is not the wealthy paid-hit tie-break/i
        )
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Employment Log 987756388" }));
    await waitFor(() =>
      expect(
        screen.getByText(
          /Employment tie-break logged\. Miranda's much higher income supports the wealthy paid-hit clue/i
        )
      ).toBeInTheDocument()
    );
    expect(screen.getByText("Test Mastermind Theory")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Miranda's Employment row is pinned as the wealthy paid-hit tie-break\. Open Evidence Board, select Miranda Priestly, and test the mastermind theory\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Student Instruction: The Employment tie-break is pinned\. Open Evidence Board, choose Miranda Priestly, and test the mastermind theory\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Evidence Prompt: Step 8 target: open Evidence Board and test Miranda Priestly as the mastermind\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /No more SQL is needed for this branch\. Go to Evidence Board, choose Miranda Priestly, and test the theory\./i
      )
    ).toBeInTheDocument();
  });

  it("removes a mastermind identity from Pinned Facts when the notebook clue is removed", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalledWith("Jeremy Bowers");
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Narrowing" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 202298" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 857212" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Log 99716" }));

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove note Mastermind Identity: PersonID 99716, PersonName Miranda Priestly, LicenseID 202298, SSN 987756388"
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Case File" }));
    expect(
      screen.queryByRole("button", {
        name: "Add EventPersonID from Mastermind Identity: PersonID 99716, PersonName Miranda Priestly, LicenseID 202298, SSN 987756388 to query editor"
      })
    ).not.toBeInTheDocument();
  });

  it("never asks students to write an artificial lookup note as a progression gate (WP-110)", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));

    // The witness-clues milestone now completes deterministically when both
    // witness bundles are logged. No manual note is required to advance.
    expect(screen.getByText(/3\/8 clues logged/)).toBeInTheDocument();
    expect(screen.queryByText(/Add the next lookup note/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/which person or address lookup those PersonIDs should be used for next/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("One Step Left")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Samuel needs one notebook note before opening the next lead/)
    ).not.toBeInTheDocument();

    // Evidence Notebook remains functional: the student can still add notes freely.
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    fireEvent.change(screen.getByLabelText("Add your own note"), {
        target: { value: "Witness IDs may help on the next lookup if I want." }
      });
    fireEvent.click(screen.getByRole("button", { name: "Add Note" }));
    expect(
      screen.getByText("Witness IDs may help on the next lookup if I want.")
    ).toBeInTheDocument();
    // Milestone count is unchanged by a manual note - the note is learner-owned, not a progression gate.
    expect(screen.getByText(/3\/8 clues logged/)).toBeInTheDocument();
  });

  it("preserves the student's in-progress query when switching away from Query Lab and back", () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Student SQL Edit" }));

    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    expect(screen.getByText(`Draft Query: ${
      "SELECT * FROM DriversLicense WHERE CarMake = 'BMW' AND CarModel = 'M8'"
    }`)).toBeInTheDocument();
  });
  });

  it("logs EventSchedule row and upserts mastermind-event notebook entry", async () => {
    render(<App initialStudentCaseEntered />);

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate First Lead" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Crime Evidence Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Scene Report Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Case Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate City Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Filtered Report Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Join" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Row Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 14887" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Witness Name Log 16371" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Membership Match" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Gym Lead Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Suspect Candidate Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));
    chooseJeremyBowersIfAvailable();
    fireEvent.click(screen.getByRole("button", { name: "Test Theory" }));

    await waitFor(() => {
      expect(verifySuspect).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Transcript Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Confession Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Profile Row Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Narrowing" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 202298" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate DriversLicense Candidate Log 857212" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Lookup" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Log 99716" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Identity Log 14307" }));
    fireEvent.click(screen.getByRole("button", { name: "Query Lab" }));

    // run the EventSchedule execution and then log the returned row
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate Mastermind Event Schedule Log" }));

    // Evidence Board should now contain the upserted event entry
    fireEvent.click(screen.getByRole("button", { name: "Evidence Board" }));

    // Event entry should show the event name
    expect(screen.getByText(/Neon Nights Symphony Delights/)).toBeInTheDocument();
  });


