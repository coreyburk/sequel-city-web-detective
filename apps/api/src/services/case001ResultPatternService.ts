import type { QueryExecutionSuccessData, QueryRow } from "../types/query";

export const CASE_001_CLOCKTOWER_CASE_ID = "case-001";
export const CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID =
  "case-001-clocktower-report-located";
export const CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY = "CrimeSceneReport";
export const CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID =
  "case-001-report-interviews-located";
export const CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY =
  "InterviewLog";

export interface Case001ClocktowerReportValidationResult {
  caseId: typeof CASE_001_CLOCKTOWER_CASE_ID;
  milestoneId: typeof CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID;
  evidenceTableFamily: typeof CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY;
  matched: boolean;
  matchedRowCount: number;
}

export interface Case001ClocktowerInterviewsValidationResult {
  caseId: typeof CASE_001_CLOCKTOWER_CASE_ID;
  milestoneId: typeof CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID;
  evidenceTableFamily: typeof CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY;
  matched: boolean;
  matchedRowCount: number;
}

const REQUIRED_FIELD_KEYS = {
  crimeId: "crimeid",
  reportDate: "reportdate",
  reportCity: "reportcity",
  reportDescription: "reportdescription",
  personId: "personid",
  reportId: "reportid",
  logTranscript: "logtranscript"
} as const;

const EXPECTED_CRIME_ID = "1080";
const EXPECTED_REPORT_DATE = "20230502";
const EXPECTED_REPORT_CITY = "sequel city";
const PROTECTED_CASE_004_REPORT_ID = "10975";
const REQUIRED_DESCRIPTION_TOKENS = [
  "clocktower",
  "ceremony",
  "toast",
  "bell sequence",
  "suspected poisoning"
] as const;
const CASE_001_CLOCKTOWER_INTERVIEW_PERSON_IDS = [
  "27590",
  "50417",
  "62764"
] as const;
const INTERVIEW_TOKEN_GROUPS_BY_PERSON_ID = {
  "27590": ["access", "after the toast", "clockroom"],
  "50417": ["personid", "clocktower access", "records"],
  "62764": ["crowd", "door", "stayed closed"]
} as const;

export function validateCase001ClocktowerReportLocated(
  queryResult: QueryExecutionSuccessData
): Case001ClocktowerReportValidationResult {
  const matchedRowCount = queryResult.rows.filter(isClocktowerReportRow).length;

  return {
    caseId: CASE_001_CLOCKTOWER_CASE_ID,
    milestoneId: CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID,
    evidenceTableFamily: CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
    matched: matchedRowCount > 0,
    matchedRowCount
  };
}

export function validateCase001ClocktowerReportInterviewsLocated(
  queryResult: QueryExecutionSuccessData
): Case001ClocktowerInterviewsValidationResult {
  const matchedRows = queryResult.rows.filter(isClocktowerInterviewRow);
  const matchedRowCount = matchedRows.length;

  return {
    caseId: CASE_001_CLOCKTOWER_CASE_ID,
    milestoneId: CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID,
    evidenceTableFamily: CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY,
    matched: containsAllExpectedPersonIds(matchedRows),
    matchedRowCount
  };
}

function isClocktowerReportRow(row: QueryRow): boolean {
  const crimeId = getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.crimeId);
  const reportDate = getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.reportDate);
  const reportCity = getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.reportCity);
  const reportDescription = getNormalizedRowValue(
    row,
    REQUIRED_FIELD_KEYS.reportDescription
  );

  return (
    normalizeIdentifier(crimeId) === EXPECTED_CRIME_ID &&
    normalizeDateKey(reportDate) === EXPECTED_REPORT_DATE &&
    normalizeText(reportCity) === EXPECTED_REPORT_CITY &&
    descriptionContainsRequiredTokens(reportDescription)
  );
}

function isClocktowerInterviewRow(row: QueryRow): boolean {
  const personId = normalizeIdentifier(
    getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.personId)
  );
  const reportId = normalizeIdentifier(
    getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.reportId)
  );
  const logTranscript = normalizeText(
    getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.logTranscript)
  );

  if (
    !isExpectedClocktowerInterviewPersonId(personId) ||
    reportId === "" ||
    reportId === PROTECTED_CASE_004_REPORT_ID
  ) {
    return false;
  }

  return INTERVIEW_TOKEN_GROUPS_BY_PERSON_ID[personId].every((token) =>
    logTranscript.includes(token)
  );
}

function getNormalizedRowValue(row: QueryRow, requiredKey: string): string {
  const value = findFieldValue(row.values, requiredKey);

  if (value !== null) {
    return value;
  }

  return findFieldValue(row.displayValues, requiredKey) ?? "";
}

function findFieldValue(
  fields: Record<string, string | number | boolean | null>,
  requiredKey: string
): string | null {
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (normalizeFieldName(fieldName) !== requiredKey) {
      continue;
    }

    if (fieldValue === null) {
      return null;
    }

    return String(fieldValue);
  }

  return null;
}

function normalizeFieldName(fieldName: string): string {
  return fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeIdentifier(value: string): string {
  return value.trim();
}

function isExpectedClocktowerInterviewPersonId(
  personId: string
): personId is (typeof CASE_001_CLOCKTOWER_INTERVIEW_PERSON_IDS)[number] {
  return CASE_001_CLOCKTOWER_INTERVIEW_PERSON_IDS.includes(
    personId as (typeof CASE_001_CLOCKTOWER_INTERVIEW_PERSON_IDS)[number]
  );
}

function containsAllExpectedPersonIds(rows: QueryRow[]): boolean {
  const matchedPersonIds = new Set(
    rows.map((row) =>
      normalizeIdentifier(getNormalizedRowValue(row, REQUIRED_FIELD_KEYS.personId))
    )
  );

  return CASE_001_CLOCKTOWER_INTERVIEW_PERSON_IDS.every((personId) =>
    matchedPersonIds.has(personId)
  );
}

function normalizeDateKey(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function descriptionContainsRequiredTokens(value: string): boolean {
  const normalizedDescription = normalizeText(value);

  return REQUIRED_DESCRIPTION_TOKENS.every((token) =>
    normalizedDescription.includes(token)
  );
}
