import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StudentPlayableCaseSkeletonView } from "./StudentPlayableCaseSkeletonView";
import { executeQuery } from "../../api/client";
import { CASE_001_PLAYABLE_SKELETON_MODULE } from "../../studentCaseModule";
import { CASE_001_SKELETON_RELEASE_GATE } from "../../studentCase001";
import type {
  Case001GatedEvidenceTableFamily,
  Case001GatedMilestoneId,
  QueryExecutionResponse,
  QueryRow
} from "../../api/types";

vi.mock("../../api/client", () => ({
  executeQuery: vi.fn()
}));

function buildSuccessfulQueryResponse(
  milestoneId: Case001GatedMilestoneId,
  evidenceTableFamily: Case001GatedEvidenceTableFamily,
  rows: QueryRow[] = []
): QueryExecutionResponse {
  return {
    success: true,
    data: {
      columns: [],
      rows,
      rowCount: rows.length
    },
    caseMilestoneEvaluation: {
      caseId: "case-001",
      milestoneId,
      evidenceTableFamily,
      gate: {
        name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
        enabledValue: "true",
        isEnabled: true
      },
      evaluated: true,
      matched: true,
      matchedRowCount: rows.length,
      runtimeStatus: "evaluated-no-progression",
      milestoneAdvanced: false
    },
    safety: {
      isAllowed: true,
      normalizedStatementType: "SELECT",
      violations: [],
      message: "SQL statement is allowed."
    },
    executionTimeMs: 5,
    message: "Query executed successfully."
  };
}

function buildNoMatchQueryResponse(
  milestoneId: Case001GatedMilestoneId,
  evidenceTableFamily: Case001GatedEvidenceTableFamily
): QueryExecutionResponse {
  return {
    success: true,
    data: {
      columns: [],
      rows: [],
      rowCount: 0
    },
    caseMilestoneEvaluation: {
      caseId: "case-001",
      milestoneId,
      evidenceTableFamily,
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
      message: "SQL statement is allowed."
    },
    executionTimeMs: 4,
    message: "Query executed successfully."
  };
}

describe("StudentPlayableCaseSkeletonView", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("submits the first Case 001 SQL query with explicit gated milestone metadata", async () => {
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");
    vi.mocked(executeQuery).mockResolvedValue(
      buildSuccessfulQueryResponse(
        "case-001-clocktower-report-located",
        "CrimeSceneReport",
        [
          {
            values: {
              ReportDescription:
                "Spoiler-safe public report text should not be rendered by this slice."
            },
            displayValues: {
              ReportDescription:
                "Spoiler-safe public report text should not be rendered by this slice."
            }
          }
        ]
      )
    );

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    expect(screen.getByLabelText("Report query")).toHaveValue(
      "SELECT * FROM CrimeSceneReport;"
    );
    expect(screen.getByLabelText("Report query")).not.toHaveValue(
      "SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';"
    );
    fireEvent.change(screen.getByLabelText("Report query"), {
      target: {
        value:
          "SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';"
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Check Report Query" }));

    await waitFor(() => {
      expect(executeQuery).toHaveBeenCalledWith(
        "SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';",
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-clocktower-report-located",
            isSkeletonGateEnabled: true
          }
        }
      );
    });

    expect(await screen.findByText(/Public report located/i)).toBeInTheDocument();
    expect(screen.getByText(/API checks evidence/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Spoiler-safe public report text should not be rendered/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/matchedRowCount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/milestoneAdvanced/i)).not.toBeInTheDocument();
  });

  it("submits the M2 interview query with explicit gated milestone metadata", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");
    vi.mocked(executeQuery).mockResolvedValue(
      buildSuccessfulQueryResponse("case-001-report-interviews-located", "InterviewLog", [
        {
          values: {
            PersonID: 62764,
            LogTranscript: "Clocktower transcript text should not render."
          },
          displayValues: {
            PersonID: "62764",
            LogTranscript: "Clocktower transcript text should not render."
          }
        }
      ])
    );

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    expect(screen.getByLabelText("Interview query")).toHaveValue("SELECT * FROM InterviewLog;");
    expect(screen.getByLabelText("Interview query")).not.toHaveValue(
      "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID IN (SELECT ReportID FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City') ORDER BY PersonID;"
    );
    fireEvent.change(screen.getByLabelText("Interview query"), {
      target: {
        value:
          "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;"
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Check Interview Query" }));

    await waitFor(() => {
      expect(executeQuery).toHaveBeenCalledWith(
        "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;",
        {
          caseMilestoneEvaluation: {
            caseId: "case-001",
            milestoneId: "case-001-report-interviews-located",
            isSkeletonGateEnabled: true
          }
        }
      );
    });

    expect(await screen.findByText(/Report-linked interviews located/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Clocktower transcript text should not render/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("62764")).not.toBeInTheDocument();
    expect(screen.queryByText(/matchedRowCount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/milestoneAdvanced/i)).not.toBeInTheDocument();
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it("shows non-spoiler no-match feedback without rendering query rows", async () => {
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");
    vi.mocked(executeQuery).mockResolvedValue(
      buildNoMatchQueryResponse("case-001-clocktower-report-located", "CrimeSceneReport")
    );

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    fireEvent.change(screen.getByLabelText("Report query"), {
      target: { value: "SELECT * FROM CrimeSceneReport WHERE CrimeID = 9999;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Check Report Query" }));

    expect(await screen.findByText(/No milestone match yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows M2 no-match feedback without rendering query rows", async () => {
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");
    vi.mocked(executeQuery).mockResolvedValueOnce(
      buildNoMatchQueryResponse("case-001-report-interviews-located", "InterviewLog")
    );

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    expect(screen.getByLabelText("Interview query")).toHaveValue("SELECT * FROM InterviewLog;");
    expect(screen.getByLabelText("Interview query")).not.toHaveValue(
      "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID IN (SELECT ReportID FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City') ORDER BY PersonID;"
    );
    fireEvent.change(screen.getByLabelText("Interview query"), {
      target: {
        value:
          "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;"
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Check Interview Query" }));
    expect(await screen.findByText(/No interview milestone match yet/i)).toBeInTheDocument();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows M2 missing-metadata feedback without rendering query rows", async () => {
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");
    vi.mocked(executeQuery).mockResolvedValue({
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
      executionTimeMs: 4,
      message: "Query executed successfully."
    });

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    expect(screen.getByLabelText("Interview query")).toHaveValue("SELECT * FROM InterviewLog;");
    expect(screen.getByLabelText("Interview query")).not.toHaveValue(
      "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID IN (SELECT ReportID FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City') ORDER BY PersonID;"
    );
    fireEvent.change(screen.getByLabelText("Interview query"), {
      target: {
        value:
          "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = 10975 ORDER BY PersonID;"
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Check Interview Query" }));
    expect(
      await screen.findByText(/no gated Case 001 interview metadata was returned/i)
    ).toBeInTheDocument();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("keeps empty query validation local and does not write persistence", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    vi.stubEnv(CASE_001_SKELETON_RELEASE_GATE, "true");

    render(<StudentPlayableCaseSkeletonView module={CASE_001_PLAYABLE_SKELETON_MODULE} />);

    fireEvent.change(screen.getByLabelText("Report query"), {
      target: { value: "   " }
    });
    fireEvent.click(screen.getByRole("button", { name: "Check Report Query" }));

    expect(
      screen.getByText(/Enter a read-only SQL query before checking the report record/i)
    ).toBeInTheDocument();
    expect(executeQuery).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
