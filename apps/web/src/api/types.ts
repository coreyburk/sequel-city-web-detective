export interface HealthFullResponse {
  success: true;
  data: {
    api: "ok";
    database: {
      status: "ok" | "failed";
      isConnected: boolean;
      databaseName: string | null;
      serverName: string | null;
      message: string;
    };
    bootstrap: {
      mode: "verify" | "apply" | "enforce";
      status: "ready" | "degraded";
      identity: {
        status: "ready" | "stale" | "missing" | "invalid";
        message: string;
        missingFacts: string[];
      };
      migrated: boolean;
      usedBootstrapCredentials: boolean;
      canApplyInApp: boolean;
      applyActionMessage: string | null;
      message: string;
      hasSchemaVersionTable: boolean;
      expectedMigrationKey: string | null;
      currentMigrationKey: string | null;
      pendingMigrationKeys: string[];
    };
    schema: {
      status: "ok" | "failed";
      tableCount: number;
      relationshipCount: number;
      message: string;
    };
  };
}

export interface ApiFailureResponse {
  success: false;
  message: string;
}

export interface SchemaColumn {
  columnName: string;
  ordinal: number;
  dataType: string;
  isNullable: boolean;
  maxLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface SchemaTable {
  schemaName: string;
  tableName: string;
  fullName: string;
  columns: SchemaColumn[];
  primaryKey: {
    name: string;
    columns: string[];
  } | null;
}

export interface SchemaRelationship {
  constraintName: string;
  sourceSchema: string;
  sourceTable: string;
  sourceColumn: string;
  targetSchema: string;
  targetTable: string;
  targetColumn: string;
}

export interface SchemaResponse {
  success: true;
  data: {
    tables: SchemaTable[];
    relationships: SchemaRelationship[];
  };
}

export type SchemaApiResponse = SchemaResponse | ApiFailureResponse;

export type NormalizedColumnDataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "null"
  | "unknown";

export interface QueryColumn {
  name: string;
  ordinal: number;
  dataType: NormalizedColumnDataType;
}

export interface QueryRow {
  values: Record<string, string | number | boolean | null>;
  displayValues: Record<string, string>;
}

export interface SqlSafetyViolation {
  code: string;
  message: string;
  token?: string;
}

export interface SqlSafetyValidationResult {
  isAllowed: boolean;
  normalizedStatementType: string;
  violations: SqlSafetyViolation[];
  message: string;
}

export interface QueryExecutionCaseMilestoneEvaluationRequest {
  caseId: string;
  milestoneId: string;
  isSkeletonGateEnabled: boolean;
}

export type Case001GatedMilestoneId =
  | "case-001-clocktower-report-located"
  | "case-001-report-interviews-located"
  | "case-001-witness-identities-resolved"
  | "case-001-ceremony-roster-narrowed";

export type Case001GatedEvidenceTableFamily =
  | "CrimeSceneReport"
  | "InterviewLog"
  | "PersonsOfInterest"
  | "EventRegistration";

export interface Case001GatedMilestoneEvaluationResult {
  caseId: string;
  milestoneId: Case001GatedMilestoneId;
  evidenceTableFamily: Case001GatedEvidenceTableFamily;
  gate: {
    name: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON";
    enabledValue: "true";
    isEnabled: boolean;
  };
  evaluated: boolean;
  matched: boolean;
  matchedRowCount: number;
  runtimeStatus:
    | "not-case-001"
    | "gate-disabled"
    | "unsupported-milestone"
    | "evaluated-no-progression";
  milestoneAdvanced: false;
}

export interface QueryExecutionSuccessResponse {
  success: true;
  data: {
    columns: QueryColumn[];
    rows: QueryRow[];
    rowCount: number;
  };
  caseMilestoneEvaluation?: Case001GatedMilestoneEvaluationResult;
  safety: SqlSafetyValidationResult;
  executionTimeMs: number;
  message: string;
}

export interface QueryExecutionFailureResponse {
  success: false;
  safety: SqlSafetyValidationResult;
  executionTimeMs: number;
  message: string;
}

export type QueryExecutionResponse =
  | QueryExecutionSuccessResponse
  | QueryExecutionFailureResponse;

export interface QueryHistoryRecord {
  id: number;
  timestamp: string;
  queryText: string;
  outcome: "success" | "blocked" | "failed";
  rowCount: number | null;
  executionTimeMs: number | null;
  errorMessage: string | null;
}

export interface QueryHistoryResponse {
  success: true;
  data: {
    records: QueryHistoryRecord[];
  };
}

export interface ClearQueryHistoryResponse {
  success: true;
  data: {
    clearedCount: number;
  };
}

export type QueryHistoryApiResponse = QueryHistoryResponse | ApiFailureResponse;
export type ClearQueryHistoryApiResponse =
  | ClearQueryHistoryResponse
  | ApiFailureResponse;

export interface CaseVerificationSuccessResponse {
  success: true;
  data: {
    suspect: string;
    verdict: string;
    caseId: string;
    isCorrect: boolean;
    solvedRole: "trigger_man" | "mastermind" | null;
    nextRole: "mastermind" | "closed" | null;
    suspectPersonId: number | null;
  };
  message: string;
}

export type CaseVerificationApiResponse =
  | CaseVerificationSuccessResponse
  | ApiFailureResponse;

export interface AdminBootstrapApplySuccessResponse {
  success: true;
  data: {
    bootstrap: HealthFullResponse["data"]["bootstrap"];
  };
  message: string;
}

export interface AdminBootstrapApplyFailureResponse {
  success: false;
  data?: {
    bootstrap: HealthFullResponse["data"]["bootstrap"];
  };
  message: string;
}

export type AdminBootstrapApplyApiResponse =
  | AdminBootstrapApplySuccessResponse
  | AdminBootstrapApplyFailureResponse;
