import { expect, request as playwrightRequest, test, type APIRequestContext } from "@playwright/test";

const CASE_001_LIVE_SMOKE_ENV = "CASE_001_LIVE_SMOKE";
const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";
const EXPLORATORY_STARTER_SQL = "SELECT * FROM CrimeSceneReport;";
const M1_TARGET_SQL =
  "SELECT ReportID, CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';";
const M2_TARGET_SQL =
  "SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID IN (SELECT ReportID FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City') ORDER BY PersonID;";

type PreflightResult =
  | {
      status: "ready";
    }
  | {
      status: "blocked";
      message: string;
    };

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getResponseJson(response: { json: () => Promise<unknown> }): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatBlocker(message: string): string {
  return `WP-274 live smoke blocker: ${message}`;
}

async function classifyLiveStackReadiness(
  apiRequest: APIRequestContext
): Promise<PreflightResult> {
  const healthUrl = `${API_BASE_URL}/api/health/full`;
  let healthResponse;

  try {
    healthResponse = await apiRequest.get(healthUrl, { timeout: 5000 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "request failed";
    return {
      status: "blocked",
      message: formatBlocker(`API unavailable at ${healthUrl}. ${detail}`)
    };
  }

  const healthJson = await getResponseJson(healthResponse);
  if (!healthResponse.ok()) {
    const databaseMessage = isJsonObject(healthJson)
      ? isJsonObject(healthJson.data) && isJsonObject(healthJson.data.database)
        ? healthJson.data.database.message
        : healthJson.message
      : null;
    return {
      status: "blocked",
      message: formatBlocker(
        `API health check returned ${healthResponse.status()} at ${healthUrl}. ${
          typeof databaseMessage === "string" ? databaseMessage : "Database/bootstrap readiness is not confirmed."
        }`
      )
    };
  }

  const queryUrl = `${API_BASE_URL}/api/query/execute`;
  let queryResponse;

  try {
    queryResponse = await apiRequest.post(queryUrl, {
      timeout: 10000,
      data: {
        sql: M2_TARGET_SQL,
        caseMilestoneEvaluation: {
          caseId: "case-001",
          milestoneId: "case-001-report-interviews-located",
          isSkeletonGateEnabled: true
        }
      }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "request failed";
    return {
      status: "blocked",
      message: formatBlocker(`Query execution unavailable at ${queryUrl}. ${detail}`)
    };
  }

  const queryJson = await getResponseJson(queryResponse);
  if (!queryResponse.ok() || !isJsonObject(queryJson) || queryJson.success !== true) {
    return {
      status: "blocked",
      message: formatBlocker(
        `Case 001 fixture query did not execute cleanly. HTTP ${queryResponse.status()}; response message: ${
          isJsonObject(queryJson) && typeof queryJson.message === "string"
            ? queryJson.message
            : "none"
        }`
      )
    };
  }

  const evaluation = queryJson.caseMilestoneEvaluation;
  if (!isJsonObject(evaluation)) {
    return {
      status: "blocked",
      message: formatBlocker(
        "Case 001 milestone metadata was not returned for the fixture query. Restart the local API from current source and rerun; if it still reproduces, the query route is dropping the caseMilestoneEvaluation transport."
      )
    };
  }

  if (evaluation.matched !== true) {
    return {
      status: "blocked",
      message: formatBlocker(
        "Case 001 public clocktower InterviewLog fixture was not detected by the milestone validator. Apply pending database migrations or rebuild the local database from the current base scripts, then rerun."
      )
    };
  }

  if (evaluation.milestoneAdvanced !== false) {
    return {
      status: "blocked",
      message: formatBlocker(
        "Case 001 milestone evaluation advanced progress; this smoke expects non-progressing metadata only."
      )
    };
  }

  return { status: "ready" };
}

test.describe("Case 001 released live-stack smoke", () => {
  test("enters the released shared shell and completes the M1-M2 SQL slice with non-progressing feedback", async ({
    page
  }) => {
    test.skip(
      process.env[CASE_001_LIVE_SMOKE_ENV] !== "1",
      `Set ${CASE_001_LIVE_SMOKE_ENV}=1 to run the opt-in Case 001 live-stack smoke.`
    );


    const apiRequest = await playwrightRequest.newContext();
    const preflight = await classifyLiveStackReadiness(apiRequest);
    await apiRequest.dispose();

    if (preflight.status === "blocked") {
      test.info().annotations.push({
        type: "WP-274 blocker",
        description: preflight.message
      });
      console.warn(preflight.message);
      throw new Error(preflight.message);
    }

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Sequel Detective" })).toBeVisible();
    await page.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" }).click();
    await expect(
      page.getByRole("heading", { name: "Case 001: The Clocktower Poisoning" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Case File" })).toBeEnabled();
    await page.getByRole("button", { name: "Open Case File" }).click();

    await expect(page.getByText("Case 001 Briefing")).toBeVisible();
    await expect(page.getByRole("button", { name: "Query Lab" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Evidence Board" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset Progress" })).toBeVisible();
    await expect(page.getByText("Development skeleton")).toHaveCount(0);

    await page.getByRole("button", { name: "Query Lab" }).click();

    await expect(page.getByRole("heading", { name: "Query Runner" })).toBeVisible();
    await expect(page.getByLabel("Clocktower Evidence Path")).toBeVisible();
    await expect(page.getByLabel("SQL query input")).toHaveValue(EXPLORATORY_STARTER_SQL);
    await expect(page.getByLabel("SQL query input")).not.toHaveValue(M1_TARGET_SQL);
    await page.getByLabel("SQL query input").fill(M1_TARGET_SQL);

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/query/execute") && response.status() === 200
    );
    await page.getByRole("button", { name: "Run Query" }).click();
    const queryResponse = await responsePromise;
    const responseBody = await queryResponse.json();

    expect(responseBody.caseMilestoneEvaluation).toMatchObject({
      caseId: "case-001",
      milestoneId: "case-001-clocktower-report-located",
      matched: true,
      runtimeStatus: "evaluated-no-progression",
      milestoneAdvanced: false
    });
    await expect(page.getByText(/Public report located/i)).toBeVisible();
    await expect(page.getByLabel("SQL query input")).toHaveValue("SELECT * FROM InterviewLog;");
    await expect(page.getByLabel("SQL query input")).not.toHaveValue(M2_TARGET_SQL);
    await expect(page.getByText(/proved ReportID from the clocktower report row/i).first()).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/Public clocktower ceremony report/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Log row 1 as evidence/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Test Theory" })).toHaveCount(0);
    await expect(page.getByText(/matchedRowCount/i)).toHaveCount(0);
    await expect(page.getByText(/milestoneAdvanced/i)).toHaveCount(0);

    const reportId = responseBody.data.rows[0].values.ReportID;
    expect(String(reportId)).toMatch(/^\d+$/);
    const learnerM2Sql = `SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = ${reportId} ORDER BY PersonID;`;
    await page.getByLabel("SQL query input").fill(learnerM2Sql);
    const interviewResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/query/execute") && response.status() === 200
    );
    await page.getByRole("button", { name: "Run Query" }).click();
    const interviewQueryResponse = await interviewResponsePromise;
    const interviewResponseBody = await interviewQueryResponse.json();

    expect(interviewResponseBody.caseMilestoneEvaluation).toMatchObject({
      caseId: "case-001",
      milestoneId: "case-001-report-interviews-located",
      matched: true,
      runtimeStatus: "evaluated-no-progression",
      milestoneAdvanced: false
    });
    await expect(page.getByText(/Report-linked interviews located/i)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/clocktower/i).first()).toBeVisible();
    await expect(page.getByLabel("SQL query input")).toHaveValue(learnerM2Sql);
    await expect(page.getByLabel("SQL query input")).not.toHaveValue("SELECT * FROM PersonsOfInterest;");
    await expect(page.getByText(/matchedRowCount/i)).toHaveCount(0);
    await expect(page.getByText(/milestoneAdvanced/i)).toHaveCount(0);

    if (await page.getByRole("button", { name: "Evidence Board" }).isEnabled()) await page.getByRole("button", { name: "Evidence Board" }).click();
    await expect(page.getByRole("heading", { name: "Evidence Notebook" })).toBeVisible();
    await expect(page.getByText("Completed milestones: 2 / 2")).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Clocktower incident report located" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Report-linked interviews located" }).first()
    ).toBeVisible();

    const case001StorageKeys = await page.evaluate(() =>
      Object.keys(window.localStorage).filter((key) => key.includes("case-001"))
    );
    expect(case001StorageKeys).toEqual(["sequel-city.case-001.student-state.v1"]);
    await page.evaluate(() => { localStorage.setItem("wp274-unrelated", "keep"); localStorage.setItem("sequel-city.case-004.student-state.v1", "case004-sentinel"); });
    await page.reload();
    // Library history may restore entry; explicitly enter if the library is shown.
    if (await page.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" }).isVisible()) {
      await page.getByRole("button", { name: "Select Case 001: The Clocktower Poisoning" }).click();
      await page.getByRole("button", { name: "Open Case File" }).click();
    }
    if (await page.getByRole("button", { name: "Evidence Board" }).isEnabled()) await page.getByRole("button", { name: "Evidence Board" }).click();
    await expect(page.getByText("Completed milestones: 2 / 2")).toBeVisible();
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Reset Progress" }).click();
    await expect(page.getByText("Case 001 Briefing", { exact: true })).toBeVisible();
    if (await page.getByRole("button", { name: "Evidence Board" }).isEnabled()) await page.getByRole("button", { name: "Evidence Board" }).click();
    await expect(page.getByText("Completed milestones: 0 / 2")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("wp274-unrelated"))).toBe("keep");
    expect(await page.evaluate(() => localStorage.getItem("sequel-city.case-004.student-state.v1"))).toBe("case004-sentinel");
  });
});
