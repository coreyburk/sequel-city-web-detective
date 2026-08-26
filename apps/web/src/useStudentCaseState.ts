import { useEffect, useMemo, useRef, useState } from "react";
import { getSchemaTables, verifySuspect } from "./api/client";
import type {
  CaseVerificationSuccessResponse,
  QueryExecutionCaseMilestoneEvaluationRequest,
  QueryColumn,
  QueryExecutionResponse,
  QueryRow,
  SchemaResponse
} from "./api/types";
import {
  deriveInvestigationStage,
  generateReinforcement
} from "./features/queryReinforcement";
import type { ReinforcementSignal } from "./features/queryReinforcement";
import {
  advanceMemoryAfterQuery,
  commitReactionToMemory,
  createInitialMemory,
  generateSamuelReaction
} from "./features/samuelReactions";
import type {
  SamuelReaction,
  SamuelReactionMemory
} from "./features/samuelReactions";
import {
  CASE_001_BRIEF,
  CASE_001_ENTRY_ID,
  CASE_001_FIRST_SQL_MILESTONE_BOUNDARY,
  CASE_001_KNOWN_CASE_FACTS,
  CASE_001_MILESTONES,
  CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE,
  CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY,
  CASE_001_SAMUEL_STEPS,
  CASE_001_SQL_FEEDBACK_SLICES,
  CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE,
  CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY,
  buildCase001MilestoneEvaluationRequest,
  isCase001PlayableSkeletonEnabled,
  type Case001SqlMilestoneId
} from "./studentCase001";
import {
  CASE_004_BRIEF,
  CASE_004_ENTRY_ID,
  CASE_004_MILESTONES,
  EXPECTED_MURDER_REPORT,
  KNOWN_CASE_FACTS,
  type MastermindEndgamePhase,
  SAMUEL_TUPLETON_STEPS,
  SQL_CITY_REPORT_DRAFT,
  WITNESS_INTERVIEW_DRAFT,
  WITNESS_NAME_LOOKUP_DRAFT,
  getCaseMomentum,
  getCaseReviewCheck,
  getCurrentAvailableLeads,
  getLeadBoardCards,
  getMastermindEndgameGuidance,
  getMastermindEndgameObjective,
  getMastermindEndgameTitle,
  getSamuelAvatarSrc,
  getSamuelReaction,
  getSamuelVisualState,
  getStudentObjective,
  getStudentSceneVisual,
  getVisibleMilestones
} from "./studentCase";
import type {
  CaseMilestone,
  CaseReviewChoice,
  CaseReviewStatus,
  EvidenceNotebookEntry,
  MilestoneId,
  PendingEvidenceStep,
  StudentClueLogOutcome,
  StudentEvidenceFeedbackTone,
  StudentView
} from "./studentCase";

type WorkspaceMode = "student" | "developer";
type PlayableStudentCaseId = typeof CASE_004_ENTRY_ID;
type ShellStudentCaseId = typeof CASE_004_ENTRY_ID | typeof CASE_001_ENTRY_ID;

export type QueryRunnerExecutionPayload = {
  sql: string;
  response: QueryExecutionResponse | null;
  error: string | null;
};

export type WitnessChecklistItem = {
  label: string;
  detail: string;
};

export const STUDENT_CASE_STORAGE_KEY = "sequel-city.case-004.student-state.v1";

export function getStudentCaseStorageKey(caseId: string): string {
  return `sequel-city.${caseId}.student-state.v1`;
}

function getPlayableStudentCaseId(caseId: string | null | undefined): PlayableStudentCaseId | null {
  return caseId === CASE_004_ENTRY_ID ? CASE_004_ENTRY_ID : null;
}

function getShellStudentCaseId(caseId: string | null | undefined): ShellStudentCaseId | null {
  if (caseId === CASE_004_ENTRY_ID) {
    return CASE_004_ENTRY_ID;
  }

  if (caseId === CASE_001_ENTRY_ID && isCase001PlayableSkeletonEnabled()) {
    return CASE_001_ENTRY_ID;
  }

  return null;
}

type StudentCasePersistedState = {
  studentView: StudentView;
  selectedStudentTable: string | null;
  studentDraftQuery: string | null;
  studentLastQueryExecution: QueryRunnerExecutionPayload | null;
  studentPreservedTranscriptExecution: QueryRunnerExecutionPayload | null;
  completedMilestones: Record<MilestoneId, boolean>;
  samuelStage: number;
  notebookEntries: EvidenceNotebookEntry[];
  pendingEvidenceStep: PendingEvidenceStep;
  studentEvidenceFeedback: string | null;
  studentEvidenceFeedbackTone: StudentEvidenceFeedbackTone;
  studentEvidenceFeedbackVersion: number;
  manualNotebookDraft: string;
  caseReviewStatus: CaseReviewStatus;
  caseReviewStatusId: string | null;
  earnedCaseReviewIds: string[];
  studentSuspectTheoryDraft: string;
  studentSuspectTheoryResult: CaseVerificationSuccessResponse | null;
  studentSuspectTheoryError: string | null;
};

type StudentCaseStorageEnvelope = {
  version: 1;
  caseId: PlayableStudentCaseId;
  state: StudentCasePersistedState;
};

const INITIAL_COMPLETED_MILESTONES: Record<MilestoneId, boolean> = {
  "crime-type": false,
  "crime-scene-filter": false,
  "witness-clues": false,
  "gym-chain": false,
  "suspect-interview": false,
  "trigger-check": false,
  "mastermind-profile": false,
  "mastermind-trace": false
};

const VALID_STUDENT_VIEWS = new Set<StudentView>(["briefing", "workbench", "case-board"]);
const VALID_PENDING_EVIDENCE_STEPS = new Set<Exclude<PendingEvidenceStep, null>>([
  "crime-type",
  "crime-scene-filter",
  "witness-names",
  "gym-lead",
  "suspect-candidate",
  "suspect-interview"
]);
const VALID_FEEDBACK_TONES = new Set<StudentEvidenceFeedbackTone>([
  "neutral",
  "success",
  "error",
  "advisory"
]);
const VALID_CASE_REVIEW_STATUSES = new Set<CaseReviewStatus>(["idle", "correct", "error"]);
const VALID_QUERY_COLUMN_TYPES = new Set([
  "string",
  "number",
  "boolean",
  "date",
  "null",
  "unknown"
]);

function createDefaultStudentCasePersistedState(): StudentCasePersistedState {
  return {
    studentView: "briefing",
    selectedStudentTable: null,
    studentDraftQuery: SAMUEL_TUPLETON_STEPS[0].queryDraft,
    studentLastQueryExecution: null,
    studentPreservedTranscriptExecution: null,
    completedMilestones: { ...INITIAL_COMPLETED_MILESTONES },
    samuelStage: 0,
    notebookEntries: [],
    pendingEvidenceStep: null,
    studentEvidenceFeedback: null,
    studentEvidenceFeedbackTone: "neutral",
    studentEvidenceFeedbackVersion: 0,
    manualNotebookDraft: "",
    caseReviewStatus: "idle",
    caseReviewStatusId: null,
    earnedCaseReviewIds: [],
    studentSuspectTheoryDraft: "",
    studentSuspectTheoryResult: null,
    studentSuspectTheoryError: null
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNullableString(value: unknown): string | null {
  return value === null || typeof value === "undefined" ? null : readString(value);
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeCompletedMilestones(value: unknown): Record<MilestoneId, boolean> {
  const defaults = { ...INITIAL_COMPLETED_MILESTONES };
  if (!isRecord(value)) {
    return defaults;
  }

  for (const milestone of CASE_004_MILESTONES) {
    const milestoneId = milestone.id as MilestoneId;
    const storedValue = value[milestoneId];
    if (typeof storedValue === "boolean") {
      defaults[milestoneId] = storedValue;
    }
  }

  return defaults;
}

function sanitizeNotebookEntries(value: unknown): EvidenceNotebookEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => {
      const id = readString(entry.id);
      const detail = readString(entry.detail);
      if (!id || !detail) {
        return null;
      }

      const notebookEntry: EvidenceNotebookEntry = {
        id,
        detail
      };

      const sourceLabel = readString(entry.sourceLabel);
      if (sourceLabel) {
        notebookEntry.sourceLabel = sourceLabel;
      }

      if (typeof entry.isManual === "boolean") {
        notebookEntry.isManual = entry.isManual;
      }

      if (entry.notebookPage === "mastermind") {
        notebookEntry.notebookPage = "mastermind";
      }

      const clueTags = readStringArray(entry.clueTags);
      if (clueTags.length > 0) {
        notebookEntry.clueTags = clueTags;
      }

      return notebookEntry;
    })
    .filter((entry): entry is EvidenceNotebookEntry => entry !== null);
}

function sanitizeQueryRows(value: unknown): QueryRow[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const rows: QueryRow[] = [];
  for (const row of value) {
    if (!isRecord(row) || !isRecord(row.values) || !isRecord(row.displayValues)) {
      return null;
    }

    const values: QueryRow["values"] = {};
    for (const [key, rawValue] of Object.entries(row.values)) {
      if (
        typeof rawValue === "string" ||
        typeof rawValue === "number" ||
        typeof rawValue === "boolean" ||
        rawValue === null
      ) {
        values[key] = rawValue;
      } else {
        return null;
      }
    }

    const displayValues: QueryRow["displayValues"] = {};
    for (const [key, rawValue] of Object.entries(row.displayValues)) {
      if (typeof rawValue !== "string") {
        return null;
      }
      displayValues[key] = rawValue;
    }

    rows.push({ values, displayValues });
  }

  return rows;
}

function sanitizeQueryResponse(value: unknown): QueryExecutionResponse | null {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return null;
  }

  const safety = isRecord(value.safety) ? value.safety : null;
  if (
    !safety ||
    typeof safety.isAllowed !== "boolean" ||
    typeof safety.normalizedStatementType !== "string" ||
    !Array.isArray(safety.violations) ||
    typeof safety.message !== "string" ||
    typeof value.executionTimeMs !== "number" ||
    typeof value.message !== "string"
  ) {
    return null;
  }

  const sanitizedSafety = {
    isAllowed: safety.isAllowed,
    normalizedStatementType: safety.normalizedStatementType,
    violations: safety.violations
      .filter((violation): violation is Record<string, unknown> => isRecord(violation))
      .map((violation) => ({
        code: readString(violation.code) ?? "",
        message: readString(violation.message) ?? "",
        ...(typeof violation.token === "string" ? { token: violation.token } : {})
      }))
      .filter((violation) => violation.code && violation.message),
    message: safety.message
  };

  if (!value.success) {
    return {
      success: false,
      safety: sanitizedSafety,
      executionTimeMs: value.executionTimeMs,
      message: value.message
    };
  }

  if (!isRecord(value.data) || !Array.isArray(value.data.columns)) {
    return null;
  }

  const columns = value.data.columns
    .filter((column): column is Record<string, unknown> => isRecord(column))
    .map((column) => {
      const name = readString(column.name);
      const ordinal = readFiniteNumber(column.ordinal, -1);
      const dataType = readString(column.dataType);

      if (!name || ordinal < 0 || !dataType || !VALID_QUERY_COLUMN_TYPES.has(dataType)) {
        return null;
      }

      return {
        name,
        ordinal,
        dataType: dataType as QueryColumn["dataType"]
      };
    })
    .filter((column): column is NonNullable<typeof column> => column !== null);

  const rows = sanitizeQueryRows(value.data.rows);
  const rowCount = readFiniteNumber(value.data.rowCount, -1);
  if (!rows || rowCount < 0) {
    return null;
  }

  return {
    success: true,
    data: {
      columns,
      rows,
      rowCount
    },
    safety: sanitizedSafety,
    executionTimeMs: value.executionTimeMs,
    message: value.message
  };
}

function sanitizeQueryExecutionPayload(value: unknown): QueryRunnerExecutionPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const sql = readString(value.sql);
  const error = readNullableString(value.error);
  if (sql === null) {
    return null;
  }

  const response = value.response === null ? null : sanitizeQueryResponse(value.response);
  if (value.response !== null && response === null) {
    return null;
  }

  return { sql, response, error };
}

function sanitizeCaseVerificationResult(value: unknown): CaseVerificationSuccessResponse | null {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    return null;
  }

  const suspect = readString(value.data.suspect);
  const verdict = readString(value.data.verdict);
  const caseId = readString(value.data.caseId);
  const message = readString(value.message);
  const solvedRole = value.data.solvedRole;
  const nextRole = value.data.nextRole;
  const suspectPersonId = value.data.suspectPersonId;

  if (
    !suspect ||
    !verdict ||
    !caseId ||
    !message ||
    typeof value.data.isCorrect !== "boolean" ||
    !(solvedRole === "trigger_man" || solvedRole === "mastermind" || solvedRole === null) ||
    !(nextRole === "mastermind" || nextRole === "closed" || nextRole === null) ||
    !(typeof suspectPersonId === "number" || suspectPersonId === null)
  ) {
    return null;
  }

  return {
    success: true,
    data: {
      suspect,
      verdict,
      caseId,
      isCorrect: value.data.isCorrect,
      solvedRole,
      nextRole,
      suspectPersonId
    },
    message
  };
}

function hydrateStudentCaseState(
  value: unknown,
  expectedCaseId: PlayableStudentCaseId
): StudentCasePersistedState | null {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.caseId !== "string" ||
    value.caseId !== expectedCaseId ||
    !isRecord(value.state)
  ) {
    return null;
  }

  // This payload stores common learner-owned frontend progress, but the
  // validators below are still Case 004-specific until future case modules
  // define their own milestones, views, evidence steps, and verdict shapes.
  const defaults = createDefaultStudentCasePersistedState();
  const state = value.state;
  const studentView = readString(state.studentView);
  const pendingEvidenceStep = state.pendingEvidenceStep;
  const feedbackTone = readString(state.studentEvidenceFeedbackTone);
  const caseReviewStatus = readString(state.caseReviewStatus);

  return {
    ...defaults,
    studentView:
      studentView && VALID_STUDENT_VIEWS.has(studentView as StudentView)
        ? (studentView as StudentView)
        : defaults.studentView,
    selectedStudentTable: readNullableString(state.selectedStudentTable),
    studentDraftQuery: readNullableString(state.studentDraftQuery),
    studentLastQueryExecution: sanitizeQueryExecutionPayload(state.studentLastQueryExecution),
    studentPreservedTranscriptExecution: sanitizeQueryExecutionPayload(
      state.studentPreservedTranscriptExecution
    ),
    completedMilestones: sanitizeCompletedMilestones(state.completedMilestones),
    samuelStage: Math.max(0, Math.floor(readFiniteNumber(state.samuelStage, defaults.samuelStage))),
    notebookEntries: sanitizeNotebookEntries(state.notebookEntries),
    pendingEvidenceStep:
      pendingEvidenceStep === null ||
      (typeof pendingEvidenceStep === "string" &&
        VALID_PENDING_EVIDENCE_STEPS.has(pendingEvidenceStep as Exclude<PendingEvidenceStep, null>))
        ? (pendingEvidenceStep as PendingEvidenceStep)
        : defaults.pendingEvidenceStep,
    studentEvidenceFeedback: readNullableString(state.studentEvidenceFeedback),
    studentEvidenceFeedbackTone:
      feedbackTone && VALID_FEEDBACK_TONES.has(feedbackTone as StudentEvidenceFeedbackTone)
        ? (feedbackTone as StudentEvidenceFeedbackTone)
        : defaults.studentEvidenceFeedbackTone,
    studentEvidenceFeedbackVersion: Math.max(
      0,
      Math.floor(readFiniteNumber(state.studentEvidenceFeedbackVersion, 0))
    ),
    manualNotebookDraft: readString(state.manualNotebookDraft) ?? defaults.manualNotebookDraft,
    caseReviewStatus:
      caseReviewStatus && VALID_CASE_REVIEW_STATUSES.has(caseReviewStatus as CaseReviewStatus)
        ? (caseReviewStatus as CaseReviewStatus)
        : defaults.caseReviewStatus,
    caseReviewStatusId: readNullableString(state.caseReviewStatusId),
    earnedCaseReviewIds: readStringArray(state.earnedCaseReviewIds),
    studentSuspectTheoryDraft:
      readString(state.studentSuspectTheoryDraft) ?? defaults.studentSuspectTheoryDraft,
    studentSuspectTheoryResult: sanitizeCaseVerificationResult(state.studentSuspectTheoryResult),
    studentSuspectTheoryError: readNullableString(state.studentSuspectTheoryError)
  };
}

function readPersistedStudentCaseState(
  activeCaseId: string | null | undefined
): StudentCasePersistedState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const playableCaseId = getPlayableStudentCaseId(activeCaseId);
  if (!playableCaseId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStudentCaseStorageKey(playableCaseId));
    return raw ? hydrateStudentCaseState(JSON.parse(raw) as unknown, playableCaseId) : null;
  } catch {
    return null;
  }
}

function writePersistedStudentCaseState(
  activeCaseId: string | null | undefined,
  state: StudentCasePersistedState
): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const playableCaseId = getPlayableStudentCaseId(activeCaseId);
  if (!playableCaseId) {
    return;
  }

  const envelope: StudentCaseStorageEnvelope = {
    version: 1,
    caseId: playableCaseId,
    state
  };

  try {
    window.localStorage.setItem(getStudentCaseStorageKey(playableCaseId), JSON.stringify(envelope));
  } catch {
    // Storage is convenience-only; gameplay continues in memory when unavailable.
  }
}

function removePersistedStudentCaseState(activeCaseId: string | null | undefined): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const playableCaseId = getPlayableStudentCaseId(activeCaseId);
  if (!playableCaseId) {
    return;
  }

  try {
    window.localStorage.removeItem(getStudentCaseStorageKey(playableCaseId));
  } catch {
    // Local storage is convenience-only; reset still updates the active in-memory state.
  }
}

type MastermindClueCategory =
  | "paid-hit"
  | "female"
  | "money"
  | "december"
  | "symphony"
  | "stilettos"
  | "jewelry"
  | "red-hair"
  | "bmw"
  | "height";

const MASTERMIND_PROFILE_TARGETS: { category: MastermindClueCategory; label: string }[] = [
  { category: "paid-hit", label: "someone else paid for the hit" },
  { category: "female", label: "the person who hired him is a woman" },
  { category: "money", label: "she has serious money" },
  { category: "december", label: "they met three times last December" },
  { category: "symphony", label: "their meetings were next to 'Symphony' venues" },
  { category: "stilettos", label: "she wore designer stilettos" },
  { category: "jewelry", label: "she wore expensive jewelry" },
  { category: "red-hair", label: "she is redheaded" },
  { category: "bmw", label: "she drives a BMW M8" },
  { category: "height", label: "she is about 5'5\" to 5'8\"" }
];

function formatPossessiveName(name: string | null | undefined): string {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return "the confirmed suspect's";
  }

  return trimmedName.endsWith("s") ? `${trimmedName}'` : `${trimmedName}'s`;
}

export function useStudentCaseState(
  mode: WorkspaceMode,
  activeCaseId: string | null = CASE_004_ENTRY_ID
) {
  const persistedStudentStateRef = useRef<StudentCasePersistedState | null>(
    mode === "student" ? readPersistedStudentCaseState(activeCaseId) : null
  );
  const persistedStudentState = persistedStudentStateRef.current;
  const [studentView, setStudentView] = useState<StudentView>(
    () => persistedStudentState?.studentView ?? "briefing"
  );
  const [studentSchema, setStudentSchema] = useState<SchemaResponse | null>(null);
  const [studentSchemaLoading, setStudentSchemaLoading] = useState(false);
  const [studentSchemaError, setStudentSchemaError] = useState<string | null>(null);
  const [selectedStudentTable, setSelectedStudentTable] = useState<string | null>(
    () => persistedStudentState?.selectedStudentTable ?? null
  );
  const [studentDraftQuery, setStudentDraftQuery] = useState<string | null>(
    () =>
      persistedStudentState?.studentDraftQuery ??
      (activeCaseId === CASE_001_ENTRY_ID
        ? CASE_001_SAMUEL_STEPS[0].queryDraft
        : SAMUEL_TUPLETON_STEPS[0].queryDraft)
  );
  const [studentLastQueryExecution, setStudentLastQueryExecution] =
    useState<QueryRunnerExecutionPayload | null>(
      () => persistedStudentState?.studentLastQueryExecution ?? null
    );
  const [studentPreservedTranscriptExecution, setStudentPreservedTranscriptExecution] =
    useState<QueryRunnerExecutionPayload | null>(
      () => persistedStudentState?.studentPreservedTranscriptExecution ?? null
    );
  const [studentQueryRunnerResetKey, setStudentQueryRunnerResetKey] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState<Record<MilestoneId, boolean>>(
    () => persistedStudentState?.completedMilestones ?? { ...INITIAL_COMPLETED_MILESTONES }
  );
  const [case001CompletedMilestones, setCase001CompletedMilestones] = useState<
    Record<Case001SqlMilestoneId, boolean>
  >(() => ({
    [CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id]: false,
    [CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id]: false,
    [CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id]: false
  }));
  const [samuelStage, setSamuelStage] = useState(() => persistedStudentState?.samuelStage ?? 0);
  const [notebookEntries, setNotebookEntries] = useState<EvidenceNotebookEntry[]>(
    () => persistedStudentState?.notebookEntries ?? []
  );
  const [pendingEvidenceStep, setPendingEvidenceStep] = useState<PendingEvidenceStep>(
    () => persistedStudentState?.pendingEvidenceStep ?? null
  );
  const [studentEvidenceFeedback, setStudentEvidenceFeedback] = useState<string | null>(
    () => persistedStudentState?.studentEvidenceFeedback ?? null
  );
  const [studentEvidenceFeedbackTone, setStudentEvidenceFeedbackTone] =
    useState<StudentEvidenceFeedbackTone>(
      () => persistedStudentState?.studentEvidenceFeedbackTone ?? "neutral"
    );
  const [studentEvidenceFeedbackVersion, setStudentEvidenceFeedbackVersion] = useState(
    () => persistedStudentState?.studentEvidenceFeedbackVersion ?? 0
  );
  const [studentSceneFeedbackTone, setStudentSceneFeedbackTone] =
    useState<StudentEvidenceFeedbackTone>(
      () => persistedStudentState?.studentEvidenceFeedbackTone ?? "neutral"
    );
  const [highlightedNotebookEntryId, setHighlightedNotebookEntryId] = useState<string | null>(null);
  const [manualNotebookDraft, setManualNotebookDraft] = useState(
    () => persistedStudentState?.manualNotebookDraft ?? ""
  );
  const [caseReviewStatus, setCaseReviewStatus] = useState<CaseReviewStatus>(
    () => persistedStudentState?.caseReviewStatus ?? "idle"
  );
  const [caseReviewStatusId, setCaseReviewStatusId] = useState<string | null>(
    () => persistedStudentState?.caseReviewStatusId ?? null
  );
  const [earnedCaseReviewIds, setEarnedCaseReviewIds] = useState<string[]>(
    () => persistedStudentState?.earnedCaseReviewIds ?? []
  );
  const [studentSamuelReaction, setStudentSamuelReaction] =
    useState<SamuelReaction | null>(null);
  const [studentSuspectTheoryDraft, setStudentSuspectTheoryDraft] = useState(
    () => persistedStudentState?.studentSuspectTheoryDraft ?? ""
  );
  const [studentSuspectTheoryResult, setStudentSuspectTheoryResult] =
    useState<CaseVerificationSuccessResponse | null>(
      () => persistedStudentState?.studentSuspectTheoryResult ?? null
    );
  const [studentSuspectTheoryError, setStudentSuspectTheoryError] = useState<string | null>(
    () => persistedStudentState?.studentSuspectTheoryError ?? null
  );
  const [studentSuspectTheoryLoading, setStudentSuspectTheoryLoading] = useState(false);
  const studentCaseHeaderRef = useRef<HTMLElement>(null);
  const samuelReactionMemoryRef = useRef<SamuelReactionMemory>(createInitialMemory());
  const samuelReactionSnapshotRef = useRef<{
    executionId: number;
    milestoneCount: number;
    notebookCount: number;
    broadRun: number;
  }>({
    executionId: 0,
    milestoneCount: 0,
    notebookCount: 0,
    broadRun: 0
  });
  const executionCounterRef = useRef(0);
  const previousExecutionRef = useRef<QueryRunnerExecutionPayload | null>(null);
  const studentCasePersistTimerRef = useRef<number | null>(null);
  const hydratedStudentCaseIdRef = useRef<string | null>(
    mode === "student" && getPlayableStudentCaseId(activeCaseId) ? activeCaseId : null
  );
  const skipNextStudentCasePersistRef = useRef(false);

  useEffect(() => {
    const playableCaseId = mode === "student" ? getPlayableStudentCaseId(activeCaseId) : null;
    if (!playableCaseId || hydratedStudentCaseIdRef.current === playableCaseId) {
      return;
    }

    const persistedState = readPersistedStudentCaseState(playableCaseId);
    hydratedStudentCaseIdRef.current = playableCaseId;
    skipNextStudentCasePersistRef.current = true;

    if (!persistedState) {
      return;
    }

    setStudentView(persistedState.studentView);
    setSelectedStudentTable(persistedState.selectedStudentTable);
    setStudentDraftQuery(persistedState.studentDraftQuery);
    setStudentLastQueryExecution(persistedState.studentLastQueryExecution);
    setStudentPreservedTranscriptExecution(persistedState.studentPreservedTranscriptExecution);
    setCompletedMilestones(persistedState.completedMilestones);
    setSamuelStage(persistedState.samuelStage);
    setNotebookEntries(persistedState.notebookEntries);
    setPendingEvidenceStep(persistedState.pendingEvidenceStep);
    setStudentEvidenceFeedback(persistedState.studentEvidenceFeedback);
    setStudentEvidenceFeedbackTone(persistedState.studentEvidenceFeedbackTone);
    setStudentEvidenceFeedbackVersion(persistedState.studentEvidenceFeedbackVersion);
    setStudentSceneFeedbackTone(persistedState.studentEvidenceFeedbackTone);
    setManualNotebookDraft(persistedState.manualNotebookDraft);
    setCaseReviewStatus(persistedState.caseReviewStatus);
    setCaseReviewStatusId(persistedState.caseReviewStatusId);
    setEarnedCaseReviewIds(persistedState.earnedCaseReviewIds);
    setStudentSuspectTheoryDraft(persistedState.studentSuspectTheoryDraft);
    setStudentSuspectTheoryResult(persistedState.studentSuspectTheoryResult);
    setStudentSuspectTheoryError(persistedState.studentSuspectTheoryError);
  }, [activeCaseId, mode]);

  useEffect(() => {
    if (mode !== "student" || getShellStudentCaseId(activeCaseId) !== CASE_001_ENTRY_ID) {
      return;
    }

    hydratedStudentCaseIdRef.current = CASE_001_ENTRY_ID;
    skipNextStudentCasePersistRef.current = true;
    setStudentView("briefing");
    setSelectedStudentTable(null);
    setStudentDraftQuery(CASE_001_SAMUEL_STEPS[0].queryDraft);
    setStudentLastQueryExecution(null);
    setStudentPreservedTranscriptExecution(null);
    setNotebookEntries([]);
    setPendingEvidenceStep(null);
    setStudentEvidenceFeedback(null);
    setStudentEvidenceFeedbackTone("neutral");
    setStudentEvidenceFeedbackVersion(0);
    setStudentSceneFeedbackTone("neutral");
    setHighlightedNotebookEntryId(null);
    setManualNotebookDraft("");
    setStudentSamuelReaction(null);
    setCase001CompletedMilestones({
      [CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id]: false,
      [CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id]: false,
      [CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id]: false
    });
    resetStudentQueryRunner();
  }, [activeCaseId, mode]);

  useEffect(() => {
    if (mode !== "student") {
      return;
    }

    let active = true;
    setStudentSchemaLoading(true);

    async function loadSchema(): Promise<void> {
      try {
        const response = await getSchemaTables();

        if (!active) {
          return;
        }

        setStudentSchema(response);
        setSelectedStudentTable((current) => current ?? response?.data?.tables[0]?.fullName ?? null);
        setStudentSchemaError(null);
      } catch {
        if (!active) {
          return;
        }

        setStudentSchema(null);
        setSelectedStudentTable(null);
        setStudentSchemaError("Schema is unavailable right now.");
      } finally {
        if (active) {
          setStudentSchemaLoading(false);
        }
      }
    }

    void loadSchema();

    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    const playableCaseId = mode === "student" ? getPlayableStudentCaseId(activeCaseId) : null;
    if (!playableCaseId || typeof window === "undefined") {
      return;
    }

    if (skipNextStudentCasePersistRef.current) {
      skipNextStudentCasePersistRef.current = false;
      return;
    }

    if (studentCasePersistTimerRef.current !== null) {
      window.clearTimeout(studentCasePersistTimerRef.current);
    }

    studentCasePersistTimerRef.current = window.setTimeout(() => {
      writePersistedStudentCaseState(
        playableCaseId,
        {
          studentView,
          selectedStudentTable,
          studentDraftQuery,
          studentLastQueryExecution,
          studentPreservedTranscriptExecution,
          completedMilestones,
          samuelStage,
          notebookEntries,
          pendingEvidenceStep,
          studentEvidenceFeedback,
          studentEvidenceFeedbackTone,
          studentEvidenceFeedbackVersion,
          manualNotebookDraft,
          caseReviewStatus,
          caseReviewStatusId,
          earnedCaseReviewIds,
          studentSuspectTheoryDraft,
          studentSuspectTheoryResult,
          studentSuspectTheoryError
        }
      );
      studentCasePersistTimerRef.current = null;
    }, 120);

    return () => {
      if (studentCasePersistTimerRef.current !== null) {
        window.clearTimeout(studentCasePersistTimerRef.current);
        studentCasePersistTimerRef.current = null;
      }
    };
  }, [
    activeCaseId,
    mode,
    studentView,
    selectedStudentTable,
    studentDraftQuery,
    studentLastQueryExecution,
    studentPreservedTranscriptExecution,
    completedMilestones,
    samuelStage,
    notebookEntries,
    pendingEvidenceStep,
    studentEvidenceFeedback,
    studentEvidenceFeedbackTone,
    studentEvidenceFeedbackVersion,
    manualNotebookDraft,
    caseReviewStatus,
    caseReviewStatusId,
    earnedCaseReviewIds,
    studentSuspectTheoryDraft,
    studentSuspectTheoryResult,
    studentSuspectTheoryError
  ]);

  useEffect(() => {
    if (mode !== "student" || !studentEvidenceFeedback) {
      return;
    }

    if (typeof studentCaseHeaderRef.current?.scrollIntoView !== "function") {
      return;
    }

    // Wrong-clue feedback now renders inline next to the Log Clue action
    // (StudentEvidenceFeedback panel in QueryRunner). Only scroll to the
    // mentor header for success events that hand the student off to a new
    // view, where the inline panel is not visible.
    const shouldRevealSamuelFeedback =
      studentEvidenceFeedbackTone === "success" && studentView === "case-board";

    if (!shouldRevealSamuelFeedback) {
      return;
    }

    studentCaseHeaderRef.current.focus({ preventScroll: true });
    studentCaseHeaderRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [mode, studentEvidenceFeedback, studentEvidenceFeedbackTone, studentView]);

  useEffect(() => {
    if (!studentEvidenceFeedback || studentEvidenceFeedbackTone === "neutral") {
      return;
    }

    setStudentSceneFeedbackTone(studentEvidenceFeedbackTone);
  }, [studentEvidenceFeedback, studentEvidenceFeedbackTone]);

  const selectedTableDetails =
    studentSchema?.data.tables.find((table) => table.fullName === selectedStudentTable) ?? null;
  const completedCount = CASE_004_MILESTONES.filter(
    (milestone) => completedMilestones[milestone.id as MilestoneId]
  ).length;
  const visibleMilestones = getVisibleMilestones(completedMilestones);
  const activeLeads = getCurrentAvailableLeads(completedMilestones, pendingEvidenceStep);
  const shouldShowCrimeReportHandoff =
    completedMilestones["crime-type"] && !completedMilestones["crime-scene-filter"];
  const activeSamuelStep =
    SAMUEL_TUPLETON_STEPS[Math.min(samuelStage, SAMUEL_TUPLETON_STEPS.length - 1)];
  const samuelCompletedCount = Math.min(samuelStage, SAMUEL_TUPLETON_STEPS.length);
  const samuelStatus =
    completedMilestones["mastermind-trace"]
      ? {
          title: "Case Closed",
          detail:
            "The contract chain is complete. The final suspect is pinned, and the full story of the crime now holds together."
        }
      : completedMilestones["trigger-check"]
        ? {
            title: "Mastermind chapter opened",
            detail:
              "The hired killer is confirmed. The next chapter is no longer about proving the shooter - it is about tracing the hidden client behind the hit."
          }
    : samuelStage >= SAMUEL_TUPLETON_STEPS.length
      ? {
          title: "Witness trail unlocked",
          detail:
            "You found the key report row. Use it to inspect the witness records next; the rest of the case can wait until those facts are earned."
        }
      : samuelStage === 0
        ? {
            title: "Samuel's nudge",
            detail:
              "Run the first draft exactly as written. This opening move is about finding the code word the rest of the case depends on."
          }
        : samuelStage === 1
          ? {
              title: "Samuel's advice",
              detail:
                "Good. You found the crime catalog. Now broaden your view and inspect the scene reports before you start filtering."
            }
          : {
              title: "Samuel's advice",
              detail:
                "Now tighten the evidence. Add the murder filter and city filter together so the right report row moves into view."
            };
  const caseMomentum = getCaseMomentum({
    studentView,
    pendingEvidenceStep,
    studentEvidenceFeedbackTone,
    completedMilestones
  });
  const samuelVisualState = getSamuelVisualState({
    studentEvidenceFeedbackTone,
    completedMilestones
  });
  const samuelAvatarSrc = getSamuelAvatarSrc(samuelVisualState);
  const caseStatus = `Case ${CASE_004_BRIEF.caseNumber} · ${CASE_004_BRIEF.caseName} · ${completedCount}/${CASE_004_MILESTONES.length} clues logged`;
  const shouldShowWitnessTrailGuide =
    completedMilestones["crime-scene-filter"] && !completedMilestones["witness-clues"];
  const shouldShowWitnessIdentityGuide = pendingEvidenceStep === "witness-names";
  const shouldShowGymLeadGuide = pendingEvidenceStep === "gym-lead";
  const shouldShowSuspectCandidateGuide = pendingEvidenceStep === "suspect-candidate";
  const shouldShowSuspectInterviewGuide = pendingEvidenceStep === "suspect-interview";
  const shouldShowTriggerCheckGuide =
    completedMilestones["suspect-interview"] &&
    !completedMilestones["trigger-check"] &&
    pendingEvidenceStep === null;
  const shouldShowMastermindHandoffGuide =
    completedMilestones["trigger-check"] &&
    !completedMilestones["mastermind-trace"] &&
    pendingEvidenceStep === null;
  const gymLeadPersonId =
    notebookEntries
      .map((entry) => {
        const match = entry.detail.match(/^Gym Lead PersonID\s*=\s*(.+)$/i);
        return match ? match[1].trim() : null;
      })
      .find((personId): personId is string => Boolean(personId)) ?? null;
  const gymLeadName =
    notebookEntries
      .map((entry) => {
        const match = entry.detail.match(/^Gym Lead Name\s+.+?\s*=\s*(.+)$/i);
        return match ? match[1].trim() : null;
      })
      .find((personName): personName is string => Boolean(personName)) ?? null;
  const collectedSuspectTheoryNames = Array.from(
    new Set(
      notebookEntries
        .map((entry) => {
          const witnessNameMatch = entry.detail.match(/^Witness Name\s+.+?\s*=\s*(.+)$/i);
          if (witnessNameMatch) {
            return witnessNameMatch[1].trim();
          }

          const gymLeadNameMatch = entry.detail.match(/^Gym Lead Name\s+.+?\s*=\s*(.+)$/i);
          if (gymLeadNameMatch) {
            return gymLeadNameMatch[1].trim();
          }

          const mastermindIdentityNameMatch = entry.detail.match(
            /^Mastermind Identity:\s*PersonID\s+\d+,\s*PersonName\s+(.+?),\s*LicenseID\s+\d+/i
          );
          if (mastermindIdentityNameMatch) {
            return mastermindIdentityNameMatch[1].trim();
          }

          return null;
        })
        .filter((name): name is string => Boolean(name))
    )
  );
  const pinnedReportId =
    notebookEntries
      .map((entry) => {
        const match = entry.detail.match(/^ReportID\s*=\s*(.+)$/i);
        return match ? match[1].trim() : null;
      })
      .find((reportId): reportId is string => Boolean(reportId)) ??
    EXPECTED_MURDER_REPORT.reportId;
  const confirmedTriggerSuspectName =
    gymLeadName ??
    (studentSuspectTheoryResult?.data.solvedRole === "trigger_man"
      ? studentSuspectTheoryResult.data.suspect
      : null);
  const confirmedTriggerPossessiveLabel = formatPossessiveName(
    confirmedTriggerSuspectName
  );
  const confirmedTriggerSuspectPersonId =
    gymLeadPersonId ??
    (studentSuspectTheoryResult?.data.solvedRole === "trigger_man" &&
    studentSuspectTheoryResult.data.suspectPersonId !== null
      ? String(studentSuspectTheoryResult.data.suspectPersonId)
      : null);
  const normalizedLastStudentSql = studentLastQueryExecution
    ? normalizeSqlForMilestones(studentLastQueryExecution.sql)
    : "";
  const normalizedDraftStudentSql = studentDraftQuery
    ? normalizeSqlForMilestones(studentDraftQuery)
    : "";
  const preferredTranscriptExecution =
    getPreservedTranscriptExecutionForCurrentChapter({
      execution:
        studentLastQueryExecution ?? studentPreservedTranscriptExecution,
      gymLeadPersonId,
      confirmedTriggerSuspectPersonId,
      shouldShowSuspectInterviewGuide,
      shouldShowTriggerCheckGuide,
      shouldShowMastermindHandoffGuide
    }) ?? null;
  const isWitnessInterviewScanActive =
    shouldShowWitnessTrailGuide &&
    normalizedLastStudentSql.includes("from interviewlog");
  const isBroadWitnessNameLookupActive =
    pendingEvidenceStep === "witness-names" &&
    normalizedLastStudentSql.includes("from personsofinterest") &&
    !normalizedLastStudentSql.includes("where");
  const isBroadGymLeadLookupActive =
    pendingEvidenceStep === "gym-lead" &&
    normalizedLastStudentSql.includes("from fitnflabclub") &&
    !normalizedLastStudentSql.includes("where");
  const isNarrowedGymLeadMatchActive =
    pendingEvidenceStep === "gym-lead" &&
    normalizedLastStudentSql.includes("from fitnflabclub") &&
    normalizedLastStudentSql.includes("where") &&
    studentLastQueryExecution?.response?.success === true &&
    studentLastQueryExecution.response.data.rowCount === 1;
  const isSuspectInterviewLookupActive =
    pendingEvidenceStep === "suspect-interview" &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from interviewlog");
  const hasSuspectInterviewPersonIdFilter =
    isSuspectInterviewLookupActive &&
    gymLeadPersonId !== null &&
    normalizedLastStudentSql.includes("personid") &&
    normalizedLastStudentSql.includes(normalizeComparableValue(gymLeadPersonId));
  const suspectInterviewRows =
    isSuspectInterviewLookupActive && studentLastQueryExecution?.response?.success
      ? studentLastQueryExecution.response.data.rows
      : [];
  const suspectInterviewRowsIncludeCaseSupport =
    suspectInterviewRows.length > 0 &&
    suspectInterviewRows.some((row) => {
      const transcript =
        getRowValue(row, "LogTranscript") ??
        getRowValue(row, "logtranscript") ??
        getRowValue(row, "Transcript") ??
        getRowValue(row, "transcript");
      return transcript !== null && isConfessionHeavyTranscript(transcript);
    });
  const isBroadMastermindTranscriptLookupActive =
    shouldShowMastermindHandoffGuide &&
    normalizedLastStudentSql.includes("from interviewlog") &&
    !normalizedLastStudentSql.includes("where");
  const isMastermindTranscriptLookupActive =
    shouldShowMastermindHandoffGuide &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from interviewlog");
  const hasMastermindPersonIdFilter =
    isMastermindTranscriptLookupActive &&
    confirmedTriggerSuspectPersonId !== null &&
    normalizedLastStudentSql.includes("personid") &&
    normalizedLastStudentSql.includes(
      normalizeComparableValue(confirmedTriggerSuspectPersonId)
    );
  const hasMastermindReportIdFilter =
    isMastermindTranscriptLookupActive &&
    normalizedLastStudentSql.includes("reportid") &&
    normalizedLastStudentSql.includes(normalizeComparableValue(pinnedReportId));
  const mastermindRows =
    isMastermindTranscriptLookupActive && studentLastQueryExecution?.response?.success
      ? studentLastQueryExecution.response.data.rows
      : [];
  const mastermindRowsAreReportLinked =
    mastermindRows.length > 0 &&
    mastermindRows.every((row) => {
      const reportId =
        getRowValue(row, "ReportID") ??
        getRowValue(row, "reportid") ??
        getRowValue(row, "ReportId") ??
        getRowValue(row, "reportId");
      return normalizeComparableValue(reportId) === normalizeComparableValue(pinnedReportId);
    });
  const mastermindRowsIncludeLead =
    mastermindRows.length > 0 &&
    mastermindRows.some((row) => {
      const transcript =
        getRowValue(row, "LogTranscript") ??
        getRowValue(row, "logtranscript") ??
        getRowValue(row, "Transcript") ??
        getRowValue(row, "transcript");
      return transcript !== null && isMastermindLeadTranscript(transcript);
    });
  const mastermindTrailReadyForClueLog =
    isMastermindTranscriptLookupActive &&
    hasMastermindPersonIdFilter &&
    (hasMastermindReportIdFilter || mastermindRowsAreReportLinked) &&
    mastermindRowsIncludeLead;
  const mastermindClueEntries = notebookEntries.filter((entry) =>
    entry.id.startsWith("mastermind-clue-")
  );
  const mastermindClueCount = mastermindClueEntries.length;
  const loggedMastermindClueTags = Array.from(
    new Set(mastermindClueEntries.flatMap((entry) => entry.clueTags ?? []))
  );
  const collectedMastermindProfileCount = MASTERMIND_PROFILE_TARGETS.filter((target) =>
    loggedMastermindClueTags.includes(target.category)
  ).length;
  const totalMastermindProfileCount = MASTERMIND_PROFILE_TARGETS.length;
  const mastermindProfileComplete =
    collectedMastermindProfileCount === totalMastermindProfileCount;
  const isMastermindDriversLicenseLookupActive =
    shouldShowMastermindHandoffGuide &&
    mastermindProfileComplete &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from driverslicense");
  const hasMastermindVehicleFilters =
    isMastermindDriversLicenseLookupActive &&
    normalizedLastStudentSql.includes("carmake") &&
    normalizedLastStudentSql.includes("bmw") &&
    normalizedLastStudentSql.includes("carmodel") &&
    normalizedLastStudentSql.includes("m8");
  const hasMastermindGenderFilter =
    isMastermindDriversLicenseLookupActive &&
    normalizedLastStudentSql.includes("gender") &&
    normalizedLastStudentSql.includes("female");
  const hasMastermindHairFilter =
    isMastermindDriversLicenseLookupActive &&
    normalizedLastStudentSql.includes("haircolor") &&
    normalizedLastStudentSql.includes("red");
  const hasMastermindHeightFilter =
    isMastermindDriversLicenseLookupActive &&
    normalizedLastStudentSql.includes("height") &&
    ((normalizedLastStudentSql.includes("between") &&
      normalizedLastStudentSql.includes("65") &&
      normalizedLastStudentSql.includes("67")) ||
      (normalizedLastStudentSql.includes(">=") &&
        normalizedLastStudentSql.includes("65") &&
        normalizedLastStudentSql.includes("<=") &&
        normalizedLastStudentSql.includes("67")));
  const mastermindDriversLicenseRows =
    isMastermindDriversLicenseLookupActive && studentLastQueryExecution?.response?.success
      ? studentLastQueryExecution.response.data.rows
      : [];
  const mastermindCandidateCount = mastermindDriversLicenseRows.length;
  const loggedMastermindCandidateEntries = notebookEntries.filter((entry) =>
    entry.id.startsWith("mastermind-candidate-")
  );
  const loggedMastermindCandidateCount = loggedMastermindCandidateEntries.length;
  const loggedMastermindCandidateLicenseIds = loggedMastermindCandidateEntries
    .map((entry) => {
      const match = entry.detail.match(/^Mastermind Candidate:\s*LicenseID\s+(\d+)/i);
      return match ? match[1].trim().toLowerCase() : null;
    })
    .filter((licenseId): licenseId is string => Boolean(licenseId));
  const shouldPivotToSymphonyHallTrail =
    mastermindProfileComplete && loggedMastermindCandidateCount >= 2;
  const shouldSuppressMastermindDriversLicenseCarryover =
    shouldPivotToSymphonyHallTrail &&
    ((studentDraftQuery !== null && normalizedDraftStudentSql.includes("from driverslicense")) ||
      (studentLastQueryExecution !== null &&
        normalizedLastStudentSql.includes("from driverslicense")));
  const visibleStudentDraftQuery = shouldSuppressMastermindDriversLicenseCarryover
    ? null
    : studentDraftQuery;
  const shouldCarryLastExecutionAcrossQueuedDraft =
    studentView === "workbench" &&
    studentEvidenceFeedbackTone === "success" &&
    studentLastQueryExecution?.response?.success === true &&
    studentDraftQuery !== null;
  const defaultRestoredExecution =
    !shouldPivotToSymphonyHallTrail &&
    !shouldSuppressMastermindDriversLicenseCarryover &&
    studentLastQueryExecution &&
    (studentDraftQuery === null ||
      normalizedDraftStudentSql === normalizedLastStudentSql ||
      shouldCarryLastExecutionAcrossQueuedDraft)
      ? studentLastQueryExecution
      : null;
  const studentRestoredExecution =
    shouldPivotToSymphonyHallTrail || shouldSuppressMastermindDriversLicenseCarryover
      ? null
      : defaultRestoredExecution ??
      (preferredTranscriptExecution &&
      (studentDraftQuery === null ||
        normalizeSqlForMilestones(preferredTranscriptExecution.sql) ===
          normalizedDraftStudentSql)
        ? preferredTranscriptExecution
      : null);
  const hasWitnessVehicleClue = notebookEntries.some((entry) =>
    normalizeComparableValue(entry.detail).includes("red bmw")
  );
  const isMastermindIdentityLookupActive =
    shouldPivotToSymphonyHallTrail &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from personsofinterest");
  const hasMastermindIdentityLicenseFilters =
    isMastermindIdentityLookupActive &&
    loggedMastermindCandidateLicenseIds.length > 0 &&
    loggedMastermindCandidateLicenseIds.every((licenseId) =>
      normalizedLastStudentSql.includes(licenseId)
    );
  const mastermindIdentityRows =
    isMastermindIdentityLookupActive && studentLastQueryExecution?.response?.success
      ? studentLastQueryExecution.response.data.rows
      : [];
  const mastermindIdentityRowsAreResolved =
    mastermindIdentityRows.length >= 2 &&
    mastermindIdentityRows.every((row) => {
      const personId =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personName =
        getRowValue(row, "PersonName") ??
        getRowValue(row, "personname");
      const licenseId =
        getRowValue(row, "LicenseID") ??
        getRowValue(row, "licenseid") ??
        getRowValue(row, "LicenseId") ??
        getRowValue(row, "licenseId");
      return Boolean(personId && personName && licenseId);
    });
  const loggedMastermindIdentityEntries = notebookEntries.filter((entry) =>
    entry.id.startsWith("mastermind-identity-")
  );
  const loggedMastermindIdentityPersonIds = loggedMastermindIdentityEntries
    .map((entry) => {
      const match = entry.detail.match(/^Mastermind Identity:\s*PersonID\s+(\d+)/i);
      return match ? match[1].trim().toLowerCase() : null;
    })
    .filter((personId): personId is string => Boolean(personId));
  const loggedMastermindIdentitySsns = loggedMastermindIdentityEntries
    .map((entry) => {
      const match = entry.detail.match(/,\s*SSN\s+(\d+)/i);
      return match ? match[1].trim().toLowerCase() : null;
    })
    .filter((ssn): ssn is string => Boolean(ssn));
  const loggedMastermindIdentityCount = loggedMastermindIdentityEntries.length;
  const hasPinnedMastermindIdentities =
    shouldPivotToSymphonyHallTrail && loggedMastermindIdentityCount >= 2;
  const hasLoggedMastermindEmploymentTieBreak = notebookEntries.some(
    (entry) => entry.id === "mastermind-employment-987756388"
  );
  const loggedMastermindSymphonyEventEntries = notebookEntries.filter((entry) =>
    entry.id.startsWith("mastermind-event-")
  );
  const loggedMastermindSymphonyEventIds = loggedMastermindSymphonyEventEntries
    .map((entry) => {
      const match = entry.detail.match(/^EventID\s*=\s*(\d+)/i);
      return match ? match[1].trim() : null;
    })
    .filter((eventId): eventId is string => Boolean(eventId));
  const hasPinnedMastermindSymphonyEvents = loggedMastermindSymphonyEventIds.length >= 3;
  const isMastermindEventRegistrationLookupActive =
    hasPinnedMastermindIdentities &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from eventregistration");
  const hasMastermindEventRegistrationFilters =
    isMastermindEventRegistrationLookupActive &&
    loggedMastermindSymphonyEventIds.length >= 3 &&
    normalizedLastStudentSql.includes("eventid") &&
    loggedMastermindSymphonyEventIds.every((eventId) =>
      normalizedLastStudentSql.includes(eventId)
    ) &&
    loggedMastermindIdentityPersonIds.length > 0 &&
    normalizedLastStudentSql.includes("eventpersonid") &&
    loggedMastermindIdentityPersonIds.every((personId) =>
      normalizedLastStudentSql.includes(personId)
    );
  const mastermindEventRegistrationRows =
    isMastermindEventRegistrationLookupActive && studentLastQueryExecution?.response?.success
      ? studentLastQueryExecution.response.data.rows
      : [];
  const mastermindSharedEventIds = (() => {
    if (!hasMastermindEventRegistrationFilters || loggedMastermindIdentityPersonIds.length < 2) {
      return [];
    }

    const eventIdToPeople = new Map<string, Set<string>>();

    for (const row of mastermindEventRegistrationRows) {
      const eventIdValue =
        getRowValue(row, "EventID") ??
        getRowValue(row, "eventid") ??
        getRowValue(row, "EventId") ??
        getRowValue(row, "eventId");
      const eventPersonIdValue =
        getRowValue(row, "EventPersonID") ??
        getRowValue(row, "eventpersonid") ??
        getRowValue(row, "EventPersonId") ??
        getRowValue(row, "eventPersonId");
      const eventId = eventIdValue === null ? null : String(eventIdValue).trim();
      const eventPersonId =
        eventPersonIdValue === null ? null : String(eventPersonIdValue).trim().toLowerCase();

      if (!eventId || !eventPersonId) {
        continue;
      }

      const people = eventIdToPeople.get(eventId) ?? new Set<string>();
      people.add(eventPersonId);
      eventIdToPeople.set(eventId, people);
    }

    return Array.from(eventIdToPeople.entries())
      .filter(([, people]) =>
        loggedMastermindIdentityPersonIds.every((personId) => people.has(personId))
      )
      .map(([eventId]) => eventId);
  })();
  const isMastermindEventJoinLookupActive =
    hasPinnedMastermindIdentities &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("eventregistration") &&
    normalizedLastStudentSql.includes("eventschedule") &&
    normalizedLastStudentSql.includes(" join ");
  const isMastermindEventScheduleLookupActive =
    hasPinnedMastermindIdentities &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from eventschedule");
  const hasStartedMastermindEventTrailAttempt =
    shouldPivotToSymphonyHallTrail &&
    (normalizedLastStudentSql.includes("from eventregistration") ||
      normalizedLastStudentSql.includes("from eventschedule"));
  const hasMastermindEventScheduleFilters =
    isMastermindEventScheduleLookupActive &&
    normalizedLastStudentSql.includes("eventid");
  const hasMastermindDecemberEventFilter =
    isMastermindEventScheduleLookupActive &&
    normalizedLastStudentSql.includes("eventdate") &&
    normalizedLastStudentSql.includes("2022-12");
  const hasMastermindSymphonyEventFilter =
    isMastermindEventScheduleLookupActive &&
    normalizedLastStudentSql.includes("eventname") &&
    normalizedLastStudentSql.includes("symphony");
  const isMastermindEmploymentLookupActive =
    hasPinnedMastermindIdentities &&
    studentLastQueryExecution?.response?.success === true &&
    normalizedLastStudentSql.includes("from employment");
  const hasMastermindEmploymentFilters =
    isMastermindEmploymentLookupActive &&
    loggedMastermindIdentitySsns.length >= 2 &&
    normalizedLastStudentSql.includes("ssn") &&
    loggedMastermindIdentitySsns.every((ssn) => normalizedLastStudentSql.includes(ssn));
  const isMastermindEmploymentReady =
    hasMastermindEmploymentFilters || hasLoggedMastermindEmploymentTieBreak;
  const mastermindEventRegistrationQueryHint =
    "Query EventRegistration next. Use the EventIDs from the pinned Symphony event clues and the EventPersonID tokens from both pinned mastermind identities.";
  const mastermindEventRegistrationComparisonHint =
    "If both EventPersonIDs remain tied to the same Symphony event set, use Employment and the paid-hit wealth clue as the tie-break.";
  const hasSolvedMastermindTheory =
    studentSuspectTheoryResult?.data.isCorrect === true &&
    studentSuspectTheoryResult.data.solvedRole === "mastermind";
  const mastermindEndgamePhase: MastermindEndgamePhase = (() => {
    if (!completedMilestones["trigger-check"] && !hasSolvedMastermindTheory) {
      return "inactive";
    }

    if (completedMilestones["mastermind-trace"] || hasSolvedMastermindTheory) {
      return "confirmed";
    }

    if (isMastermindEmploymentLookupActive || hasMastermindEventRegistrationFilters) {
      return "employment-cross-check";
    }

    if (hasPinnedMastermindIdentities) {
      if (
        hasPinnedMastermindSymphonyEvents ||
        isMastermindEventRegistrationLookupActive ||
        isMastermindEventJoinLookupActive
      ) {
        return "event-registration-cross-check";
      }

      return "event-schedule-lookup";
    }

    if (shouldPivotToSymphonyHallTrail || isMastermindIdentityLookupActive) {
      return "identity-lookup";
    }

    if (mastermindProfileComplete || isMastermindDriversLicenseLookupActive) {
      return "candidate-narrowing";
    }

    return "profile";
  })();
  const shouldCrossCheckWitnessVehicle =
    hasWitnessVehicleClue &&
    (loggedMastermindClueTags.includes("bmw") ||
      loggedMastermindClueTags.includes("symphony") ||
      loggedMastermindClueTags.includes("red-hair") ||
      loggedMastermindClueTags.includes("stilettos") ||
      loggedMastermindClueTags.includes("jewelry"));
  const loggedWitnessPersonIds = getLoggedWitnessPersonIds(notebookEntries);
  const loggedWitnessNameIds = notebookEntries
    .filter((entry) => entry.id.startsWith("witness-name-"))
    .map((entry) => entry.id.replace("witness-name-", ""));
  const hasPinnedWitnessNames = loggedWitnessNameIds.length >= 2;
  const witnessBundleCount = loggedWitnessPersonIds.length;
  const hasPinnedWitnessReportId = notebookEntries.some(
    (entry) => normalizeComparableValue(entry.detail) === `reportid = ${EXPECTED_MURDER_REPORT.reportId}`
  );
  const witnessChecklistItems: WitnessChecklistItem[] = [];
  if (!hasPinnedWitnessReportId) {
    witnessChecklistItems.push({
      label: "Keep ReportID pinned",
      detail: "stay tied to the report row that started the trail."
    });
  }
  if (witnessBundleCount === 0) {
    witnessChecklistItems.push(
      {
        label: "Log the first witness bundle",
        detail: "one repeated PersonID and its strongest clue snippet."
      },
      {
        label: "Log the second witness bundle",
        detail: "the other repeated PersonID and its strongest clue snippet."
      }
    );
  } else if (witnessBundleCount === 1) {
    witnessChecklistItems.push({
      label: "Log the second witness bundle",
      detail: "the other repeated PersonID and its strongest clue snippet."
    });
  }
  // WP-111: Query Runner helper text is short and functional. The full
  // next-step instruction lives in Samuel's Guidance (header). This text only
  // names the immediate action so the editor area stays focused on doing.
  const studentQueryRunnerInstruction = (() => {
    if (isWitnessInterviewScanActive) {
      return witnessBundleCount === 0
        ? "Log one strong row from the first repeated PersonID bundle."
        : "Log one strong row from the second repeated PersonID bundle.";
    }

    if (shouldShowMastermindHandoffGuide) {
      switch (mastermindEndgamePhase) {
        case "profile":
          if (isBroadMastermindTranscriptLookupActive) {
            return `Good start. Now narrow InterviewLog with ${confirmedTriggerPossessiveLabel} pinned PersonID and ReportID ${pinnedReportId}, then read for the row where the killer admits someone else ordered the hit.`;
          }

          if (mastermindTrailReadyForClueLog) {
            return mastermindClueCount === 0
              ? "You have the right transcript set. Log the one row where the killer first reveals a hidden client behind the hit."
              : `Keep this narrowed transcript open and log one fresh mastermind clue at a time. ${getOutstandingMastermindCluePrompt(
                  loggedMastermindClueTags
                )}`;
          }

          if (isMastermindTranscriptLookupActive && hasMastermindPersonIdFilter) {
            return `Good. You isolated ${confirmedTriggerPossessiveLabel} transcript trail. If the report is not pinned in the query yet, add ReportID ${pinnedReportId}; otherwise stay here and decide which single clue belongs in the mastermind notebook next.`;
          }

          return `Stay with InterviewLog and use ${confirmedTriggerPossessiveLabel} pinned PersonID plus ReportID ${pinnedReportId} to isolate the murder-report transcript before you widen the mastermind search.`;

        case "candidate-narrowing":
          if (!hasMastermindVehicleFilters) {
            return "Good. You left InterviewLog. Query DriversLicense next and start with the BMW M8 clue.";
          }

          if (!hasMastermindGenderFilter || !hasMastermindHairFilter) {
            return "The vehicle clue is in place. Add the transcript clues that the mastermind is a woman with red hair.";
          }

          if (!hasMastermindHeightFilter) {
            return "You still need the height clue. Narrow the shortlist to people between 65 and 67 inches tall.";
          }

          return shouldPivotToSymphonyHallTrail
            ? "The shortlist is ready. Log the candidate rows you want to keep, then use their LicenseIDs in PersonsOfInterest."
            : "The shortlist is ready. Compare those remaining rows against your notebook before you move on.";

        case "identity-lookup":
          if (hasStartedMastermindEventTrailAttempt && !hasPinnedMastermindIdentities) {
            return "You reached for the event tables too early. Go back to PersonsOfInterest and log both women first.";
          }

          if (!hasMastermindIdentityLicenseFilters) {
            return "Use the pinned candidate LicenseIDs in PersonsOfInterest next so both women resolve into real identities.";
          }

          if (mastermindIdentityRowsAreResolved) {
            return "Good. You identified both women. Log both identity rows so their PersonIDs are ready for the Symphony Hall event trail.";
          }

          return "Stay with PersonsOfInterest until both candidate LicenseIDs resolve into real women you can compare.";

        case "event-schedule-lookup":
          if (!hasMastermindDecemberEventFilter) {
            return "Stay with EventSchedule and start with the killer's December meeting clue.";
          }

          if (!hasMastermindSymphonyEventFilter) {
            return "The December filter is in place. Add the 'Symphony' clue next (for example: EventName LIKE '%Symphony%').";
          }

          return `Good. You found the Symphony event rows that fit the killer's meeting clue. ${mastermindEventRegistrationQueryHint}`;

        case "event-registration-cross-check":
          if (!hasMastermindEventRegistrationFilters) {
            return "Stay with EventRegistration and use the Symphony EventIDs plus both pinned EventPersonIDs. If you mix OR with AND, wrap each OR group in parentheses before you combine them.";
          }

          return mastermindSharedEventIds.length > 0
            ? `Good. Both women are now checked against the Symphony EventIDs. ${mastermindEventRegistrationComparisonHint}`
            : `Good. Both women are now checked against the Symphony EventIDs. ${mastermindEventRegistrationComparisonHint}`;
        case "employment-cross-check":
          if (hasLoggedMastermindEmploymentTieBreak) {
            return "The Employment tie-break is pinned. Open Evidence Board, choose Miranda Priestly, and test the mastermind theory.";
          }

          return hasMastermindEmploymentFilters
            ? "Good. You are comparing both remaining candidates' Employment rows. Use income and job context to decide which woman fits the wealthy paid-hit clue."
            : "The Symphony trail keeps both candidates in play. Use Employment next with the pinned SSNs to compare who fits the wealthy paid-hit clue.";

        default:
          break;
      }
    }

    if (shouldShowTriggerCheckGuide) {
      return "You reviewed the suspect's interview. Click the Evidence Board tab now, then decide whether the case is strong enough to test your first theory.";
    }

    if (shouldShowSuspectInterviewGuide) {
      return hasSuspectInterviewPersonIdFilter && suspectInterviewRowsIncludeCaseSupport
        ? "You have the right interview rows in view. Read them and use Log Clue on the one row that best shows what the suspect's own words add to the case."
        : `Stay with InterviewLog and use ${gymLeadPersonId ? `PersonID ${gymLeadPersonId}` : "the pinned gym lead PersonID"} to review what the gym-linked suspect said. Read his own words before you decide what they prove.`;
    }

    if (shouldShowSuspectCandidateGuide) {
      return "Use PersonsOfInterest and the pinned gym lead PersonID from Case File > Pinned Facts to identify the gym-linked person before you test any theory.";
    }

    if (isNarrowedGymLeadMatchActive) {
      return "You narrowed the gym lead to one row. Use Log Clue to pin that membership before you move on.";
    }

    if (isBroadGymLeadLookupActive) {
      return "Now narrow FitNFlabClub using the 48Z membership clue and gold-status clue before you log anything new.";
    }

    if (isBroadWitnessNameLookupActive) {
      return "That table is still too broad. Narrow PersonsOfInterest with both pinned witness PersonIDs, then log the two matching names.";
    }

    if (pendingEvidenceStep === "gym-lead") {
      return "Build your next query with FitNFlabClub, then use the 48Z clue and gold-status clue to narrow the membership records.";
    }

    if (pendingEvidenceStep === "witness-names") {
      return "Run the broad PersonsOfInterest lookup first, then open Case File > Pinned Facts and narrow it with both witness PersonIDs before you log any names.";
    }

    if (completedMilestones["witness-clues"]) {
      return "Use PersonsOfInterest and the pinned witness PersonIDs from Case File to identify the two witness names first.";
    }

    if (shouldShowWitnessTrailGuide) {
      return "Write your InterviewLog query in the editor using the pinned ReportID, then sort by PersonID.";
    }

    return null;
  })();
  const studentQueryFailureGuidance = (() => {
    if (shouldShowWitnessTrailGuide) {
      return "If this query fails, simplify it. Stay with InterviewLog, keep the pinned report ID in your filter, and sort by PersonID. Do not GROUP BY or JOIN yet.";
    }

    if (shouldShowMastermindHandoffGuide) {
      switch (mastermindEndgamePhase) {
        case "profile":
          return mastermindClueCount > 0
            ? `Stay with ${confirmedTriggerPossessiveLabel} murder-report transcript and keep logging only the rows that add a fresh clue about the woman who hired him.`
            : `Open Case File > Pinned Facts and use ${confirmedTriggerPossessiveLabel} PersonID plus ReportID ${pinnedReportId}. Once the transcript set is right, look for the row where the killer admits someone else ordered the hit.`;
        case "candidate-narrowing":
          if (!hasMastermindVehicleFilters) {
            return "Stay with DriversLicense and start with the BMW M8 clue before adding any appearance details.";
          }

          if (!hasMastermindGenderFilter || !hasMastermindHairFilter) {
            return "The vehicle clue is working. Now add the transcript clues that the mastermind is female and redheaded.";
          }

          if (!hasMastermindHeightFilter) {
            return "You still need the height clue. Narrow DriversLicense to people between 65 and 67 inches tall.";
          }

          return "The shortlist is ready. Log the women who still fit the BMW and appearance profile, then use their LicenseIDs in PersonsOfInterest.";
        case "identity-lookup":
          if (!hasMastermindIdentityLicenseFilters) {
            return "If this query stalls, keep it simple. Stay with PersonsOfInterest and filter by the two pinned LicenseIDs first.";
          }

          return mastermindIdentityRowsAreResolved
            ? "You found both identities. Log those rows before you move to the event tables."
            : "Stay with PersonsOfInterest until both candidate LicenseIDs resolve into named women.";
        case "event-schedule-lookup":
          if (!hasMastermindDecemberEventFilter) {
            return "Stay with EventSchedule and add the December clue from the killer's statement first.";
          }

          if (!hasMastermindSymphonyEventFilter) {
            return "The December filter is working. Add the Symphony Hall clue next so the event trail narrows to the rows that match the meeting-location clue.";
          }

          return `You have the Symphony event rows that match the killer's clue trail. ${mastermindEventRegistrationQueryHint}`;
        case "event-registration-cross-check":
          if (!hasMastermindEventRegistrationFilters) {
            return "Stay with EventRegistration and use the Symphony EventIDs plus both pinned EventPersonIDs. If you mix OR with AND, wrap each OR group in parentheses before you combine them.";
          }

          return mastermindSharedEventIds.length > 0
            ? `Both women are now checked against the Symphony EventIDs. ${mastermindEventRegistrationComparisonHint}`
            : `Compare the EventRegistration rows tied to the Symphony EventIDs. ${mastermindEventRegistrationComparisonHint}`;
        case "employment-cross-check":
          if (hasLoggedMastermindEmploymentTieBreak) {
            return "The paid-hit tie-break is logged. Go to Evidence Board and test Miranda Priestly as the mastermind.";
          }

          return hasMastermindEmploymentFilters
            ? "Compare Salary and CompanyName against the wealthy paid-hit clue before testing the final theory."
            : "Stay with Employment and filter by both pinned SSNs so the two remaining candidates can be compared directly.";
        case "confirmed":
          return "The mastermind is confirmed. Review the closeout notes and the finished contract chain on the Evidence Board.";
        default:
          return null;
      }
    }

    if (shouldShowTriggerCheckGuide) {
      return "If you still feel uncertain, return to InterviewLog and re-read the suspect's own words before you decide whether to test the theory from Evidence Board.";
    }

    if (shouldShowSuspectInterviewGuide) {
      return hasSuspectInterviewPersonIdFilter
        ? "Stay with the filtered interview rows and pin the one that most clearly shows what the suspect's own words add to the case."
        : `Open Case File > Pinned Facts and use ${gymLeadPersonId ? `PersonID ${gymLeadPersonId}` : "the pinned gym lead PersonID"} in InterviewLog. Read what the suspect said before you decide what his transcript actually proves.`;
    }

    if (shouldShowSuspectCandidateGuide) {
      return "Open Case File > Pinned Facts and use the pinned gym lead PersonID as your next filter. Stay with PersonsOfInterest until the name is pinned.";
    }

    if (isBroadGymLeadLookupActive) {
      return "Use the gym clues you already earned. Stay with FitNFlabClub, then add your own 48Z and gold filters before you jump to other tables.";
    }

    if (pendingEvidenceStep === "gym-lead") {
      return "If this query stalls, keep it simple. Stay with FitNFlabClub and use the 48Z clue plus gold-status clue as your next filters.";
    }

    if (isBroadWitnessNameLookupActive) {
      return "Open Case File > Pinned Facts and use the two witness PersonIDs as your next filter. Stay with PersonsOfInterest and avoid JOINs until both witness names are pinned.";
    }

    if (pendingEvidenceStep === "witness-names") {
      return "If this query stalls, keep it simple. Stay with PersonsOfInterest, filter by the pinned PersonIDs, and skip JOINs for now.";
    }

    return null;
  })();
  const studentEvidencePrompt = (() => {
    if (pendingEvidenceStep === "crime-type") {
      return "Possible clue found. Log the row that proves Murder maps to the correct CrimeID.";
    }

    if (pendingEvidenceStep === "crime-scene-filter") {
      return "Possible clue found. Review the SQL City murder reports and log the row from January 15th, 2023.";
    }

    if (shouldShowMastermindHandoffGuide) {
      switch (mastermindEndgamePhase) {
        case "profile":
          if (mastermindClueCount === 0) {
            return "Step 7 target: use Log Clue on the transcript row where the killer reveals who hired him.";
          }

          return mastermindProfileComplete
            ? "Step 8 target: switch to DriversLicense and use the completed mastermind profile to narrow the shortlist."
            : "Step 7 target: keep logging only the transcript rows that add a new clue about the woman, the meetings, the money, the car, or her appearance.";
        case "candidate-narrowing":
          return "Step 8 target: keep narrowing DriversLicense until only the women who still fit the mastermind profile remain.";
        case "identity-lookup":
          return mastermindIdentityRowsAreResolved
            ? "Step 8 target: log both identity rows before you open EventSchedule."
            : "Step 8 target: use the pinned candidate LicenseIDs to resolve both women in PersonsOfInterest.";
        case "event-schedule-lookup":
          if (!hasMastermindDecemberEventFilter) {
            return "Step 8 target: add the December clue in EventSchedule.";
          }

          return !hasMastermindSymphonyEventFilter
            ? "Step 8 target: add the Symphony Hall clue in EventSchedule."
            : `Step 8 target: ${mastermindEventRegistrationQueryHint}`;
        case "event-registration-cross-check":
          return !hasMastermindEventRegistrationFilters
            ? "Step 8 target: use the returned Symphony EventIDs plus both EventPersonIDs in EventRegistration."
            : "Step 8 target: decide whether the Symphony registrations separate the candidates. If both remain tied, continue with the wealth clue in Employment.";
        case "employment-cross-check":
          if (hasLoggedMastermindEmploymentTieBreak) {
            return "Step 8 target: open Evidence Board and test Miranda Priestly as the mastermind.";
          }

          return !hasMastermindEmploymentFilters
            ? "Step 8 target: use both pinned SSNs in Employment."
            : "Step 8 target: compare Salary and CompanyName, then test the mastermind theory.";
        case "confirmed":
          return "Case closed: review the confirmed mastermind verdict and the finished case trail.";
        default:
          return null;
      }
    }

    if (isWitnessInterviewScanActive) {
      return witnessBundleCount === 0
        ? "Step 2 target: use Log Clue on one strong row from the first repeated PersonID witness bundle."
        : "Step 3 target: use Log Clue on one strong row from the second repeated PersonID witness bundle.";
    }

    if (pendingEvidenceStep === "witness-names") {
      return "Step 4 target: use Log Clue on both witness-name rows from PersonsOfInterest.";
    }

    if (pendingEvidenceStep === "suspect-candidate") {
      return "Step 6 target: use Log Clue on the PersonsOfInterest row that matches the pinned gym lead PersonID.";
    }

    if (pendingEvidenceStep === "suspect-interview") {
      return hasSuspectInterviewPersonIdFilter && suspectInterviewRowsIncludeCaseSupport
        ? "Step 7 target: use Log Clue on the interview row that most clearly shows what the suspect's own words add to the case."
        : "Step 7 target: review the gym-linked suspect's interview log and narrow it with the pinned PersonID before you pin any clue.";
    }

    if (isNarrowedGymLeadMatchActive) {
      return "Step 5 target: use Log Clue on the single FitNFlabClub row that matches both gym clues.";
    }

    return null;
  })();

  useEffect(() => {
    const hasSolvedSuspectTheory = studentSuspectTheoryResult?.data.isCorrect === true;

    if (!shouldShowTriggerCheckGuide && !shouldShowMastermindHandoffGuide && !hasSolvedSuspectTheory) {
      setStudentSuspectTheoryResult(null);
      setStudentSuspectTheoryError(null);
      setStudentSuspectTheoryLoading(false);
    }
  }, [
    shouldShowMastermindHandoffGuide,
    shouldShowTriggerCheckGuide,
    studentSuspectTheoryResult
  ]);

  const studentQueryReinforcement = useMemo<ReinforcementSignal | null>(() => {
    if (mode !== "student" || !studentLastQueryExecution) {
      return null;
    }

    const response = studentLastQueryExecution.response;
    if (!response || !response.success) {
      return null;
    }

    const responseData = response.data;
    if (!responseData) {
      return null;
    }

    return generateReinforcement({
      sql: studentLastQueryExecution.sql,
      rowCount: responseData.rowCount,
      isSuccess: true,
      stage: deriveInvestigationStage(completedMilestones),
      completedMilestones,
      notebookEntries
    });
  }, [mode, studentLastQueryExecution, completedMilestones, notebookEntries]);

  // Deterministic Samuel reaction derivation. Reactions fire on query
  // execution events and look at deterministic deltas (fresh milestone,
  // fresh clue log, run of broad results) plus the current reinforcement
  // signal. Reactions never reference suspect identity, never name hidden
  // rows, and never propose the next SQL — see features/samuelReactions.
  useEffect(() => {
    if (mode !== "student") {
      return;
    }

    if (!studentLastQueryExecution) {
      return;
    }

    if (previousExecutionRef.current === studentLastQueryExecution) {
      return;
    }

    previousExecutionRef.current = studentLastQueryExecution;
    executionCounterRef.current += 1;
    const executionId = executionCounterRef.current;
    const snapshot = samuelReactionSnapshotRef.current;
    const milestoneCount = Object.values(completedMilestones).filter(Boolean).length;
    const notebookCount = notebookEntries.length;
    const hasFreshMilestone = milestoneCount > snapshot.milestoneCount;
    const hasFreshClueLog = notebookCount > snapshot.notebookCount;
    const freshMilestoneId = hasFreshMilestone
      ? (Object.entries(completedMilestones).find(
          ([, reached]) => reached
        )?.[0] as MilestoneId | undefined) ?? null
      : null;

    const isBroad =
      studentQueryReinforcement?.category === "overly-broad" ||
      studentQueryReinforcement?.category === "incomplete-chain";
    const nextBroadRun = isBroad ? snapshot.broadRun + 1 : 0;

    const advancedMemory = advanceMemoryAfterQuery(samuelReactionMemoryRef.current);
    const reaction = generateSamuelReaction(
      {
        stage: deriveInvestigationStage(completedMilestones),
        reinforcement: studentQueryReinforcement,
        completedMilestones,
        notebookEntryCount: notebookCount,
        consecutiveBroadCount: nextBroadRun,
        hasFreshMilestone,
        freshMilestoneId,
        hasFreshClueLog
      },
      advancedMemory
    );

    samuelReactionMemoryRef.current = reaction
      ? commitReactionToMemory(advancedMemory, reaction)
      : advancedMemory;
    samuelReactionSnapshotRef.current = {
      executionId,
      milestoneCount,
      notebookCount,
      broadRun: nextBroadRun
    };
    setStudentSamuelReaction(reaction);
  }, [
    mode,
    studentLastQueryExecution,
    studentQueryReinforcement,
    completedMilestones,
    notebookEntries
  ]);

  const studentScene = getStudentSceneVisual({
    samuelStage,
    pendingEvidenceStep,
    studentEvidenceFeedbackTone: studentSceneFeedbackTone,
    studentView,
    completedMilestones,
    hasMastermindClues: mastermindClueCount > 0,
    shouldShowTriggerReveal:
      studentView === "case-board" &&
      !shouldShowMastermindHandoffGuide &&
      studentSuspectTheoryResult?.data.isCorrect === true &&
      studentSuspectTheoryResult.data.solvedRole === "trigger_man"
  });
  const samuelReaction = getSamuelReaction({
    samuelStage,
    pendingEvidenceStep,
    studentEvidenceFeedback,
    studentEvidenceFeedbackTone,
    completedMilestones,
    confirmedTriggerSuspectName,
    studentDraftQuery: visibleStudentDraftQuery,
    studentLastQuerySql: studentLastQueryExecution?.sql ?? null
  });
  const mentorTitle =
    studentView === "briefing" && !studentEvidenceFeedback
      ? "Case 004 Briefing"
      : mastermindEndgamePhase !== "inactive"
        ? mastermindEndgamePhase === "employment-cross-check" && hasLoggedMastermindEmploymentTieBreak
          ? "Test Mastermind Theory"
          : getMastermindEndgameTitle({ phase: mastermindEndgamePhase })
        : samuelStatus.title;
  const mentorMessage = (() => {
    const baseMessage =
      studentView === "briefing" && !studentEvidenceFeedback
        ? "Review the case facts below, then open Query Lab and start with CrimeType."
        : mastermindEndgamePhase !== "inactive"
          ? mastermindEndgamePhase === "employment-cross-check" && hasLoggedMastermindEmploymentTieBreak
            ? "Miranda's Employment row is pinned as the wealthy paid-hit tie-break. Open Evidence Board, select Miranda Priestly, and test the mastermind theory."
            : mastermindEndgamePhase === "event-schedule-lookup" && hasMastermindSymphonyEventFilter
            ? `The December 2022 Symphony rows are identified. ${mastermindEventRegistrationQueryHint}`
            : getMastermindEndgameGuidance({
              phase: mastermindEndgamePhase,
              confirmedTriggerSuspectName,
              mastermindSharedEventIds,
              solvedMastermindName:
                studentSuspectTheoryResult?.data.solvedRole === "mastermind"
                  ? studentSuspectTheoryResult.data.suspect
                  : null
            })
          : samuelReaction;

    if (
      studentView === "workbench" &&
      notebookEntries.length > 0 &&
      !baseMessage.includes("Evidence Board")
    ) {
      return `${baseMessage} Use Evidence Board when you want to review collected clues.`;
    }

    return baseMessage;
  })();
  // WP-111: short objective line that answers "what am I trying to prove right
  // now?". The header pairs this with the longer mentorMessage (the "what
  // to do next") so students never need to scan multiple panels.
  const studentObjective =
    studentView === "briefing" && mastermindEndgamePhase === "inactive"
      ? "Anchor the case with the murder code, the right report row, and the witness trail before you let any suspect theory take over."
      : mastermindEndgamePhase !== "inactive"
      ? mastermindEndgamePhase === "employment-cross-check" && hasLoggedMastermindEmploymentTieBreak
        ? "Use the pinned Employment tie-break to test the final mastermind theory."
        : getMastermindEndgameObjective({
          phase: mastermindEndgamePhase,
          confirmedTriggerSuspectName
        })
      : getStudentObjective({
          completedMilestones,
          confirmedTriggerSuspectName,
          hasPinnedMastermindIdentities,
          hasPinnedWitnessNames,
          hasResolvedMastermindIdentityLookup: mastermindIdentityRowsAreResolved,
          isMastermindEventRegistrationActive: isMastermindEventRegistrationLookupActive,
          isMastermindEventJoinActive: isMastermindEventJoinLookupActive,
          isMastermindEventScheduleActive: isMastermindEventScheduleLookupActive,
          pendingEvidenceStep,
          shouldPivotToSymphonyHallTrail,
          studentView,
          witnessBundleCount
        });
  const mastermindCurrentStepTitle =
    mastermindEndgamePhase === "inactive"
      ? null
      : mastermindEndgamePhase === "confirmed"
        ? "Case Closed."
        : mastermindEndgamePhase === "employment-cross-check" && hasLoggedMastermindEmploymentTieBreak
          ? "Test Mastermind Theory."
        : `${getMastermindEndgameTitle({ phase: mastermindEndgamePhase })}.`;
  const mastermindCurrentStepDetail =
    mastermindEndgamePhase === "inactive"
      ? null
      : mastermindEndgamePhase === "confirmed"
        ? "The mastermind is confirmed and the full contract chain now holds together."
        : mentorMessage;
  const mastermindNotebookSummary = shouldShowMastermindHandoffGuide
    ? buildMastermindNotebookSummary(
        loggedMastermindClueTags,
        hasWitnessVehicleClue,
        loggedMastermindCandidateCount,
        loggedMastermindIdentityCount
      )
    : null;

  useEffect(() => {
    if (!mastermindProfileComplete || completedMilestones["mastermind-profile"]) {
      return;
    }

    setCompletedMilestones((current) => ({
      ...current,
      "mastermind-profile": true
    }));
  }, [completedMilestones, mastermindProfileComplete]);

  useEffect(() => {
    if (!shouldPivotToSymphonyHallTrail) {
      return;
    }

    const hasDriversLicenseDraft =
      studentDraftQuery !== null &&
      normalizeSqlForMilestones(studentDraftQuery).includes("from driverslicense");
    const hasDriversLicenseExecution =
      studentLastQueryExecution !== null &&
      normalizeSqlForMilestones(studentLastQueryExecution.sql).includes("from driverslicense");

    if (!hasDriversLicenseDraft && !hasDriversLicenseExecution) {
      return;
    }

    setStudentLastQueryExecution(null);
    setStudentDraftQuery(null);
    resetStudentQueryRunner();
  }, [shouldPivotToSymphonyHallTrail, studentDraftQuery, studentLastQueryExecution]);

  useEffect(() => {
    if (!hasPinnedMastermindSymphonyEvents || isMastermindEventRegistrationLookupActive) {
      return;
    }

    setStudentDraftQuery("SELECT *\nFROM EventRegistration");
  }, [hasPinnedMastermindSymphonyEvents, isMastermindEventRegistrationLookupActive]);

  const caseReviewCheck = getCaseReviewCheck(completedMilestones, samuelStage);
  const leadBoardCards = getLeadBoardCards(
    completedMilestones,
    pendingEvidenceStep,
    confirmedTriggerSuspectName,
    {
      hasPinnedMastermindIdentities,
      isMastermindEventRegistrationActive: isMastermindEventRegistrationLookupActive,
      isMastermindEventScheduleActive: isMastermindEventScheduleLookupActive
    }
  );
  const insightMarks = earnedCaseReviewIds.length;
  const activeCaseReviewStatus =
    caseReviewStatusId === caseReviewCheck.id ? caseReviewStatus : "idle";
  const samuelTrustLabel =
    completedCount + insightMarks >= 5
      ? "Strong"
      : completedCount + insightMarks >= 2
        ? "Steady"
        : "Building";

  function normalizeSqlForMilestones(sql: string): string {
    return sql.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function getLoggedWitnessPersonIds(entries: EvidenceNotebookEntry[]): string[] {
    return entries
      .filter((entry) => entry.id.startsWith("witness-person-"))
      .map((entry) => entry.id.replace("witness-person-", ""));
  }

  function upsertNotebookEntries(entries: EvidenceNotebookEntry[]): void {
    setNotebookEntries((current) => {
      const updated = [...current];

      for (const entry of entries) {
        const existingIndex = updated.findIndex((item) => item.id === entry.id);

        if (existingIndex === -1) {
          updated.push(entry);
          continue;
        }

        updated[existingIndex] = entry;
      }

      return updated;
    });
  }

  function rowContainsValue(row: QueryRow, expected: string): boolean {
    const normalizedExpected = expected.toLowerCase();

    return Object.values(row.displayValues).some((value) =>
      value.toLowerCase().includes(normalizedExpected)
    );
  }

  function getRowValue(row: QueryRow, key: string): string | null {
    const displayMatch = row.displayValues[key];
    if (displayMatch) {
      return displayMatch;
    }

    const rawMatch = row.values[key];
    return rawMatch === null || rawMatch === undefined ? null : String(rawMatch);
  }

  function normalizeComparableValue(value: string | null): string {
    return (value ?? "").trim().toLowerCase();
  }

  function isInterviewLogExecution(
    execution: QueryRunnerExecutionPayload | null
  ): execution is QueryRunnerExecutionPayload {
    return Boolean(
      execution?.response?.success &&
        normalizeSqlForMilestones(execution.sql).includes("from interviewlog")
    );
  }

  function getExecutionRowPersonIds(execution: QueryRunnerExecutionPayload): string[] {
    if (!execution.response?.success) {
      return [];
    }

    return execution.response.data.rows
      .map((row) => {
        const personId =
          getRowValue(row, "PersonID") ??
          getRowValue(row, "personid") ??
          getRowValue(row, "PersonId") ??
          getRowValue(row, "personId");
        return personId ? normalizeComparableValue(personId) : null;
      })
      .filter((personId): personId is string => Boolean(personId));
  }

  function getPreservedTranscriptExecutionForCurrentChapter(input: {
    execution: QueryRunnerExecutionPayload | null;
    gymLeadPersonId: string | null;
    confirmedTriggerSuspectPersonId: string | null;
    shouldShowSuspectInterviewGuide: boolean;
    shouldShowTriggerCheckGuide: boolean;
    shouldShowMastermindHandoffGuide: boolean;
  }): QueryRunnerExecutionPayload | null {
    if (!isInterviewLogExecution(input.execution)) {
      return null;
    }

    const normalizedSql = normalizeSqlForMilestones(input.execution.sql);
    const rowPersonIds = getExecutionRowPersonIds(input.execution);
    const hasSinglePersonTrail = rowPersonIds.length > 0 && new Set(rowPersonIds).size === 1;

    if (input.shouldShowSuspectInterviewGuide && input.gymLeadPersonId) {
      const normalizedPersonId = normalizeComparableValue(input.gymLeadPersonId);
      if (
        (normalizedSql.includes("personid") && normalizedSql.includes(normalizedPersonId)) ||
        (hasSinglePersonTrail && rowPersonIds[0] === normalizedPersonId)
      ) {
        return input.execution;
      }
    }

    if (
      (input.shouldShowTriggerCheckGuide || input.shouldShowMastermindHandoffGuide) &&
      input.confirmedTriggerSuspectPersonId
    ) {
      const normalizedPersonId = normalizeComparableValue(
        input.confirmedTriggerSuspectPersonId
      );
      if (
        (normalizedSql.includes("personid") && normalizedSql.includes(normalizedPersonId)) ||
        (hasSinglePersonTrail && rowPersonIds[0] === normalizedPersonId)
      ) {
        return input.execution;
      }
    }

    return null;
  }

  function normalizeCompactDate(value: string | null): string {
    return normalizeComparableValue(value).replace(/[^0-9]/g, "");
  }

  function normalizeTranscript(text: string | null): string {
    return normalizeComparableValue(text);
  }

  function isWitnessObservationTranscript(text: string): boolean {
    const normalizedText = normalizeTranscript(text);

    return (
      normalizedText.includes("i saw") ||
      normalizedText.includes("i heard") ||
      normalizedText.includes("i recognized") ||
      normalizedText.includes("i caught part of the plate") ||
      normalizedText.includes("plate") ||
      normalizedText.includes("he had") ||
      normalizedText.includes("he got into") ||
      normalizedText.includes("there was")
    );
  }

  function isConfessionHeavyTranscript(text: string): boolean {
    const normalizedText = normalizeTranscript(text);

    return (
      normalizedText.includes("i whacked") ||
      normalizedText.includes("i delivered") ||
      normalizedText.includes("contract") ||
      normalizedText.includes("client wanted") ||
      normalizedText.includes("she said the sleazeball") ||
      normalizedText.includes("they called to ice him")
    );
  }

  function isDirectKillerConfessionTranscript(text: string): boolean {
    const normalizedText = normalizeTranscript(text);

    return (
      normalizedText.includes("i whacked") ||
      normalizedText.includes("so i delivered") ||
      normalizedText.includes("i delivered the hit") ||
      normalizedText.includes("i delivered.")
    );
  }

  function isMastermindLeadTranscript(text: string): boolean {
    return extractMastermindTranscriptClueTags(text).length > 0;
  }

  function extractMastermindTranscriptClueTags(text: string): MastermindClueCategory[] {
    const normalizedText = normalizeTranscript(text);
    const clues: MastermindClueCategory[] = [];

    if (
      normalizedText.includes("client") ||
      normalizedText.includes("contract") ||
      normalizedText.includes("wanted that scumbag taken out") ||
      normalizedText.includes("put out a contract") ||
      normalizedText.includes("they called to ice him")
    ) {
      clues.push("paid-hit");
    }

    if (
      normalizedText.includes("the lady") ||
      normalizedText.includes("she said") ||
      normalizedText.includes("dame") ||
      normalizedText.includes("woman who hired") ||
      normalizedText.includes("broad who hired")
    ) {
      clues.push("female");
    }

    if (
      normalizedText.includes("high-roller") ||
      normalizedText.includes("deep pockets") ||
      normalizedText.includes("cream")
    ) {
      clues.push("money");
    }

    if (
      normalizedText.includes("three times last december") ||
      normalizedText.includes("met up three times last december")
    ) {
      clues.push("december");
    }

    if (normalizedText.includes("symphony")) {
      clues.push("symphony");
    }

    if (normalizedText.includes("stiletto")) {
      clues.push("stilettos");
    }

    if (
      normalizedText.includes("expensive jewelry") ||
      normalizedText.includes("serious ice") ||
      normalizedText.includes("rocks on her fingers") ||
      normalizedText.includes("rocks on her fingers and toes")
    ) {
      clues.push("jewelry");
    }

    if (normalizedText.includes("redhead") || normalizedText.includes("redheaded")) {
      clues.push("red-hair");
    }

    if (normalizedText.includes("bmw m8")) {
      clues.push("bmw");
    }

    if (
      normalizedText.includes("5 foot 5") ||
      normalizedText.includes("5 foot 8") ||
      normalizedText.includes("5'5") ||
      normalizedText.includes("5'8") ||
      normalizedText.includes("five foot five") ||
      normalizedText.includes("five foot eight")
    ) {
      clues.push("height");
    }

    return Array.from(new Set(clues));
  }

  function summarizeMastermindLeadTranscript(text: string): string {
    const tags = extractMastermindTranscriptClueTags(text);

    if (tags.includes("paid-hit") && tags.includes("female") && tags.includes("money")) {
      return "a wealthy woman paid for the hit";
    }

    if (tags.includes("december")) {
      return "the killer met the woman who hired him three times last December";
    }

    if (tags.includes("symphony")) {
      return "their meetings mentioned 'Symphony' venues";
    }

    if (tags.includes("bmw")) {
      return "the woman who hired him drives a BMW M8";
    }

    if (tags.includes("red-hair") && tags.includes("jewelry")) {
      return "the woman who hired him has red hair and expensive jewelry";
    }

    if (tags.includes("stilettos")) {
      return "the woman who hired him wore designer stilettos";
    }

    if (tags.includes("jewelry")) {
      return "the woman who hired him wore expensive jewelry";
    }

    if (tags.includes("red-hair")) {
      return "the woman who hired him is redheaded";
    }

    if (tags.includes("money")) {
      return "the woman who hired him has deep pockets";
    }

    if (tags.includes("female") && tags.includes("height")) {
      return "the woman who hired him is about 5'5\" to 5'8\" tall";
    }

    if (tags.includes("female")) {
      return "the killer points to a woman who hired him";
    }

    if (tags.includes("paid-hit")) {
      return "someone else paid for the hit";
    }

    if (tags.includes("height")) {
      return "the woman who hired him is about 5'5\" to 5'8\" tall";
    }

    return "the killer confirms there is a hidden client behind the hit";
  }

  function getOutstandingMastermindCluePrompt(loggedTags: string[]): string {
    const remainingTargets = MASTERMIND_PROFILE_TARGETS.filter(
      (prompt) => !loggedTags.includes(prompt.category)
    );
    const remaining = remainingTargets.map((prompt) => prompt.label);

    if (remaining.length === 0) {
      return "You have the full mastermind profile. The next step is to leave InterviewLog and start narrowing DriversLicense.";
    }

    const remainingThemes = new Set<string>();

    if (remainingTargets.some((target) => ["paid-hit", "female"].includes(target.category))) {
      remainingThemes.add("who hired him");
    }

    if (remainingTargets.some((target) => ["december", "symphony"].includes(target.category))) {
      remainingThemes.add("how and where they met");
    }

    if (remainingTargets.some((target) => ["stilettos", "jewelry"].includes(target.category))) {
      remainingThemes.add("her style and wealth");
    }

    if (remainingTargets.some((target) => ["bmw", "redhead", "height"].includes(target.category))) {
      remainingThemes.add("the details that can identify her in real records");
    }

    return `Still look for ${remaining.length} more clue thread${remaining.length === 1 ? "" : "s"} about ${Array.from(remainingThemes).join(", ")}.`;
  }

  function buildMastermindNotebookSummary(
    loggedTags: string[],
    hasWitnessVehicle: boolean,
    candidateCount: number,
    identityCount: number
  ): string | null {
    if (loggedTags.length === 0) {
      return null;
    }

    const collected = MASTERMIND_PROFILE_TARGETS.filter((target) =>
      loggedTags.includes(target.category)
    ).length;
    const total = MASTERMIND_PROFILE_TARGETS.length;
    if (candidateCount >= 2) {
      if (identityCount >= 2) {
        return "Mastermind identities pinned: 2 women. Query EventSchedule with the December 2022 and 'Symphony' clues next.";
      }

      return `Mastermind shortlist pinned: ${candidateCount} candidates. Use the candidate LicenseIDs to identify both women, then compare their December 'Symphony' trail before you make the final mastermind call.`;
    }

    if (collected === total) {
      return hasWitnessVehicle && loggedTags.includes("bmw")
        ? `Mastermind profile clues pinned: ${collected}/${total}. Leave InterviewLog and narrow DriversLicense to female redheaded BMW M8 owners between 65 and 67 inches tall. Keep the witness red BMW note in mind as a lead to compare, not a proven match yet.`
        : `Mastermind profile clues pinned: ${collected}/${total}. Leave InterviewLog and narrow DriversLicense to female redheaded BMW M8 owners between 65 and 67 inches tall, then compare the shortlist against your money, jewelry, and 'Symphony' notes.`;
    }

    const remaining = getOutstandingMastermindCluePrompt(loggedTags);
    const crossCheck = hasWitnessVehicle && loggedTags.includes("bmw")
      ? "Now compare the BMW clue against the witness note about the red BMW and decide whether they could describe the same car."
      : "Keep collecting transcript clues until the woman's profile starts to hold together.";

    return `Mastermind profile clues pinned: ${collected}/${total}. ${crossCheck} ${remaining}`;
  }

  function summarizeWitnessTranscript(text: string): string {
    const normalizedText = normalizeTranscript(text);

    if (normalizedText.includes("heard a gunshot")) {
      return "heard a gunshot";
    }

    if (normalizedText.includes("saw a man run out")) {
      return "saw a man run out";
    }

    if (normalizedText.includes("48z")) {
      return "saw a gym bag with membership starting 48Z";
    }

    if (normalizedText.includes("h42w")) {
      return 'saw a plate containing "H42W"';
    }

    if (normalizedText.includes("red bmw") && normalizedText.includes("symphony")) {
      return "noticed a red BMW near a Symphony venue";
    }

    if (normalizedText.includes("saw the murder happen")) {
      return "saw the murder happen";
    }

    if (normalizedText.includes("recognized the killer from my gym")) {
      return "recognized the killer from the gym";
    }

    if (normalizedText.includes("well-groomed mustache")) {
      return "described a mustache and fancy vest";
    }

    return text.trim();
  }

  function buildWitnessBundleSummary(transcripts: string[]): string {
    const summaries: string[] = [];
    let sawRedBmw = false;
    let sawPartialPlate = false;

    for (const transcript of transcripts) {
      const normalizedTranscript = normalizeTranscript(transcript);
      const summary = summarizeWitnessTranscript(transcript);

      if (normalizedTranscript.includes("red bmw") && normalizedTranscript.includes("symphony")) {
        sawRedBmw = true;
      }

      if (normalizedTranscript.includes("h42w")) {
        sawPartialPlate = true;
      }

      if (!summaries.includes(summary)) {
        summaries.push(summary);
      }
    }

    if (sawRedBmw && sawPartialPlate) {
      const bmwSummaryIndex = summaries.indexOf("noticed a red BMW near a Symphony venue");
      const plateSummaryIndex = summaries.indexOf('saw a plate containing "H42W"');
      const combinedVehicleSummary =
        'noticed a red BMW near a Symphony venue with plate fragment "H42W"';

      if (bmwSummaryIndex >= 0) {
        summaries[bmwSummaryIndex] = combinedVehicleSummary;
      }

      if (plateSummaryIndex >= 0) {
        summaries.splice(plateSummaryIndex, 1);
      }

      const combinedIndex = summaries.indexOf(combinedVehicleSummary);
      if (combinedIndex > 0) {
        summaries.splice(combinedIndex, 1);
        summaries.unshift(combinedVehicleSummary);
      }
    }

    return summaries.slice(0, 3).join(", ");
  }

  function summarizeSuspectInterviewTranscript(text: string): string {
    const normalizedText = normalizeTranscript(text);

    if (
      normalizedText.includes("client wanted") ||
      normalizedText.includes("put out a contract") ||
      normalizedText.includes("they called to ice him")
    ) {
      return "his own words say someone hired him to kill the victim";
    }

    if (normalizedText.includes("she said the sleazeball had it coming")) {
      return "his own words say a woman wanted the victim dead";
    }

    if (normalizedText.includes("it was just business")) {
      return "his own words tie the murder to a paid hit, not a random act";
    }

    return "his own words strengthen the case against him";
  }

  function removeNotebookEntry(entryId: string): void {
    setNotebookEntries((current) => current.filter((entry) => entry.id !== entryId));
    setHighlightedNotebookEntryId((current) => (current === entryId ? null : current));
  }

  function clearStudentFeedback(): void {
    setStudentEvidenceFeedback(null);
    setStudentEvidenceFeedbackTone("neutral");
  }

  function setNotebookEntryPage(entryId: string, notebookPage: "mastermind" | undefined): void {
    setNotebookEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              notebookPage
            }
          : entry
      )
    );
  }

  function resetStudentQueryRunner(): void {
    setStudentQueryRunnerResetKey((current) => current + 1);
  }

  function resetStudentCaseProgress(): void {
    if (mode === "student" && getShellStudentCaseId(activeCaseId) === CASE_001_ENTRY_ID) {
      setStudentView("briefing");
      setSelectedStudentTable(null);
      setStudentDraftQuery(CASE_001_SAMUEL_STEPS[0].queryDraft);
      setStudentLastQueryExecution(null);
      setStudentPreservedTranscriptExecution(null);
      setNotebookEntries([]);
      setPendingEvidenceStep(null);
      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentEvidenceFeedbackVersion(0);
      setStudentSceneFeedbackTone("neutral");
      setHighlightedNotebookEntryId(null);
      setManualNotebookDraft("");
      setStudentSamuelReaction(null);
      setCase001CompletedMilestones({
        [CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id]: false,
        [CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id]: false,
        [CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id]: false
      });
      resetStudentQueryRunner();
      return;
    }

    const playableCaseId = getPlayableStudentCaseId(activeCaseId);
    if (mode !== "student" || !playableCaseId) {
      return;
    }

    if (studentCasePersistTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(studentCasePersistTimerRef.current);
      studentCasePersistTimerRef.current = null;
    }

    const defaults = createDefaultStudentCasePersistedState();
    persistedStudentStateRef.current = null;
    hydratedStudentCaseIdRef.current = playableCaseId;
    skipNextStudentCasePersistRef.current = true;
    removePersistedStudentCaseState(playableCaseId);

    setStudentView(defaults.studentView);
    setSelectedStudentTable(defaults.selectedStudentTable);
    setStudentDraftQuery(defaults.studentDraftQuery);
    setStudentLastQueryExecution(defaults.studentLastQueryExecution);
    setStudentPreservedTranscriptExecution(defaults.studentPreservedTranscriptExecution);
    setCompletedMilestones(defaults.completedMilestones);
    setSamuelStage(defaults.samuelStage);
    setNotebookEntries(defaults.notebookEntries);
    setPendingEvidenceStep(defaults.pendingEvidenceStep);
    setStudentEvidenceFeedback(defaults.studentEvidenceFeedback);
    setStudentEvidenceFeedbackTone(defaults.studentEvidenceFeedbackTone);
    setStudentEvidenceFeedbackVersion(defaults.studentEvidenceFeedbackVersion);
    setStudentSceneFeedbackTone(defaults.studentEvidenceFeedbackTone);
    setHighlightedNotebookEntryId(null);
    setManualNotebookDraft(defaults.manualNotebookDraft);
    setCaseReviewStatus(defaults.caseReviewStatus);
    setCaseReviewStatusId(defaults.caseReviewStatusId);
    setEarnedCaseReviewIds(defaults.earnedCaseReviewIds);
    setStudentSamuelReaction(null);
    setStudentSuspectTheoryDraft(defaults.studentSuspectTheoryDraft);
    setStudentSuspectTheoryResult(defaults.studentSuspectTheoryResult);
    setStudentSuspectTheoryError(defaults.studentSuspectTheoryError);
    setStudentSuspectTheoryLoading(false);
    setStudentSchemaError(null);
    setStudentSchemaLoading(false);
    samuelReactionMemoryRef.current = createInitialMemory();
    samuelReactionSnapshotRef.current = {
      executionId: 0,
      milestoneCount: 0,
      notebookCount: 0,
      broadRun: 0
    };
    executionCounterRef.current = 0;
    previousExecutionRef.current = null;
    resetStudentQueryRunner();
  }

  function publishStudentClueLogOutcome(
    status: StudentClueLogOutcome["status"],
    message: string
  ): StudentClueLogOutcome {
    setStudentEvidenceFeedbackVersion((current) => current + 1);
    setStudentEvidenceFeedback(message);
    setStudentEvidenceFeedbackTone(
      status === "logged"
        ? "success"
        : status === "rejected"
          ? "error"
          : "advisory"
    );

    return { status, message };
  }

  function logClue(message: string): StudentClueLogOutcome {
    return publishStudentClueLogOutcome("logged", message);
  }

  function deferClue(message: string): StudentClueLogOutcome {
    return publishStudentClueLogOutcome("deferred", message);
  }

  function rejectClue(message: string): StudentClueLogOutcome {
    return publishStudentClueLogOutcome("rejected", message);
  }

  function duplicateClue(message: string): StudentClueLogOutcome {
    return publishStudentClueLogOutcome("duplicate", message);
  }

  function handleStudentEvidenceLog(row: QueryRow): StudentClueLogOutcome {
    if (getShellStudentCaseId(activeCaseId) === CASE_001_ENTRY_ID) {
      const rowHasPersonName =
        getRowValue(row, "PersonName") !== null || getRowValue(row, "personname") !== null;
      const rowHasTranscript =
        getRowValue(row, "LogTranscript") !== null || getRowValue(row, "logtranscript") !== null;
      const rowHasClocktowerReport =
        rowContainsValue(row, "clocktower") &&
        (getRowValue(row, "ReportDescription") !== null ||
          getRowValue(row, "reportdescription") !== null);

      const milestoneId: Case001SqlMilestoneId | null = rowHasPersonName
        ? CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id
        : rowHasTranscript
          ? CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id
          : rowHasClocktowerReport
            ? CASE_001_SQL_FEEDBACK_SLICES[0].milestoneId
            : null;

      if (!milestoneId) {
        return rejectClue(
          "That row is visible, but it is not one of the current Case 001 M1-M3 evidence rows."
        );
      }

      if (notebookEntries.some((entry) => entry.id === milestoneId)) {
        return duplicateClue("Already logged. This Case 001 milestone is already pinned.");
      }

      setCase001CompletedMilestones((current) => ({
        ...current,
        [milestoneId]: true
      }));
      upsertCase001MilestoneNotebookEntry(milestoneId);
      return logClue(getCase001FeedbackMessage(milestoneId));
    }

    if (pendingEvidenceStep === "crime-type") {
      const isMurderRow = rowContainsValue(row, "murder");
      const crimeId = getRowValue(row, "CrimeID") ?? getRowValue(row, "crimeid") ?? "1080";

      if (!isMurderRow) {
        return rejectClue(
          "That row does not prove the crime we are investigating yet. Find the Murder entry and log that clue."
        );
      }

      const entryId = "crime-type-murder";
      if (notebookEntries.some((entry) => entry.id === entryId)) {
        return duplicateClue(
          "Already logged. CrimeID 1080 is pinned. Stay in Query Lab and inspect CrimeSceneReport next so you can start narrowing the report archive."
        );
      }

      upsertNotebookEntries([
        {
          id: entryId,
          detail: `CrimeID = ${crimeId}`,
          sourceLabel: "Samuel Step 1"
        }
      ]);
      setCompletedMilestones((current) => ({ ...current, "crime-type": true }));
      setSamuelStage((current) => Math.max(current, 1));
      setPendingEvidenceStep(null);
      logClue(
        `Clue logged: CrimeID ${crimeId} maps to Murder. Stay in Query Lab and inspect CrimeSceneReport next so you can start narrowing the report archive.`
      );
      setHighlightedNotebookEntryId(entryId);
      setStudentDraftQuery(SAMUEL_TUPLETON_STEPS[1].queryDraft);
      setStudentView("workbench");
      return {
        status: "logged",
        message:
          `Clue logged: CrimeID ${crimeId} maps to Murder. Stay in Query Lab and inspect CrimeSceneReport next so you can start narrowing the report archive.`
      };
    }

    if (pendingEvidenceStep === "crime-scene-filter") {
      const crimeId = getRowValue(row, "CrimeID") ?? getRowValue(row, "crimeid");
      const reportDate =
        getRowValue(row, "ReportDate") ??
        getRowValue(row, "reportdate") ??
        getRowValue(row, "Date") ??
        getRowValue(row, "date") ??
        "unknown date";
      const reportCity =
        getRowValue(row, "ReportCity") ??
        getRowValue(row, "reportcity") ??
        getRowValue(row, "City") ??
        getRowValue(row, "city") ??
        "unknown city";
      const reportId =
        getRowValue(row, "ReportID") ??
        getRowValue(row, "reportid") ??
        getRowValue(row, "ReportId") ??
        getRowValue(row, "reportId");

      const matchesExpectedReport =
        (reportId ? normalizeComparableValue(reportId) === EXPECTED_MURDER_REPORT.reportId : false) &&
        normalizeComparableValue(reportCity) === EXPECTED_MURDER_REPORT.reportCity &&
        normalizeCompactDate(reportDate) === EXPECTED_MURDER_REPORT.reportDate;

      if ((crimeId !== "1080" && !rowContainsValue(row, "1080")) || !matchesExpectedReport) {
        return rejectClue(
          "That row is still not the target murder report. Re-check the date, city, and report ID before you log it."
        );
      }

      const entryId = "crime-scene-filter-murder-report";
      if (notebookEntries.some((entry) => entry.id === `${entryId}-id`)) {
        return duplicateClue(
          "Already logged. The target murder report is pinned. Return to the Query Lab to review ReportID 10975, then follow Samuel's next lead into InterviewLog."
        );
      }

      const reportEntries: EvidenceNotebookEntry[] = [
        {
          id: `${entryId}-city`,
          detail: `ReportCity = ${reportCity}`,
          sourceLabel: "Samuel Step 3"
        },
        {
          id: `${entryId}-date`,
          detail: `ReportDate = ${reportDate}`,
          sourceLabel: "Samuel Step 3"
        }
      ];

      if (reportId) {
        reportEntries.push({
          id: `${entryId}-id`,
          detail: `ReportID = ${reportId}`,
          sourceLabel: "Samuel Step 3"
        });
      }

      upsertNotebookEntries(reportEntries);
      setCompletedMilestones((current) => ({ ...current, "crime-scene-filter": true }));
      setSamuelStage((current) => Math.max(current, 3));
      setPendingEvidenceStep(null);
      logClue(
        "Clue logged: you isolated the murder report row. Return to the Query Lab to review ReportID 10975, then follow Samuel's next lead into InterviewLog."
      );
      setHighlightedNotebookEntryId(reportEntries[reportEntries.length - 1]?.id ?? entryId);
      setStudentDraftQuery(WITNESS_INTERVIEW_DRAFT);
      setStudentView("workbench");
      return {
        status: "logged",
        message:
          "Clue logged: you isolated the murder report row. Return to the Query Lab to review ReportID 10975, then follow Samuel's next lead into InterviewLog."
      };
    }

    const rowHasEventId =
      getRowValue(row, "EventID") !== null ||
      getRowValue(row, "eventid") !== null ||
      getRowValue(row, "EventId") !== null ||
      getRowValue(row, "eventId") !== null;

    const rowEventName =
      (getRowValue(row, "EventName") ?? getRowValue(row, "eventname") ?? getRowValue(row, "Event") ?? getRowValue(row, "event") ?? "") as string;

    const rowLooksLikeEventSchedule =
      rowHasEventId && String(rowEventName).toLowerCase().includes("symphony");

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      hasPinnedMastermindIdentities &&
      ((studentLastQueryExecution?.response?.success &&
        normalizedLastStudentSql.includes("from eventschedule")) ||
        rowLooksLikeEventSchedule)
    ) {
      const eventIdValue =
        getRowValue(row, "EventID") ??
        getRowValue(row, "eventid") ??
        getRowValue(row, "EventId") ??
        getRowValue(row, "eventId");
      const eventDate =
        getRowValue(row, "EventDate") ?? getRowValue(row, "eventdate");
      const eventName =
        getRowValue(row, "EventName") ?? getRowValue(row, "eventname") ?? getRowValue(row, "Event") ?? getRowValue(row, "event");
      const eventId = eventIdValue === null ? null : String(eventIdValue).trim();

      if (!eventId) {
        return rejectClue(
          "That row does not include an EventID. Use a row with EventID before you log it."
        );
      }

      const entryId = `mastermind-event-${eventId}`;
      const alreadyPinned = loggedMastermindSymphonyEventEntries.some(
        (entry) => entry.id === entryId
      );
      if (alreadyPinned) {
        return duplicateClue(
          loggedMastermindSymphonyEventEntries.length >= 3
            ? "Already logged. All three Symphony rows are pinned. Use the pinned Symphony events and both pinned mastermind identities to build the EventRegistration check."
            : "Already logged. Keep these EventSchedule results open until all three Symphony rows are pinned."
        );
      }
      const pinnedSymphonyEventCountAfterLog = alreadyPinned
        ? loggedMastermindSymphonyEventEntries.length
        : loggedMastermindSymphonyEventEntries.length + 1;
      
      upsertNotebookEntries([
        {
          id: entryId,
          detail: `EventID = ${eventId}${eventName ? ` (${String(eventName)})` : ""}${eventDate ? `, EventDate ${String(eventDate)}` : ""}`,
          sourceLabel: "EventSchedule",
          notebookPage: "mastermind"
        }
      ]);

      const eventMessage =
        pinnedSymphonyEventCountAfterLog >= 3
          ? "Event logged. All three Symphony rows are pinned. Use the pinned Symphony events and both pinned mastermind identities to build the EventRegistration check."
          : "Event logged. Keep these EventSchedule results open until all three Symphony rows are pinned. Then use the pinned Symphony events and both pinned mastermind identities to build the EventRegistration check.";
      logClue(eventMessage);
      setHighlightedNotebookEntryId(entryId);
      setStudentView("workbench");
      return {
        status: "logged",
        message: eventMessage
      };
    }

    if (
      completedMilestones["crime-scene-filter"] &&
      !completedMilestones["witness-clues"] &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from interviewlog")
    ) {
      const personId =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const reportId =
        getRowValue(row, "ReportID") ??
        getRowValue(row, "reportid") ??
        getRowValue(row, "ReportId") ??
        getRowValue(row, "reportId");
      const logTranscript =
        getRowValue(row, "LogTranscript") ??
        getRowValue(row, "logtranscript") ??
        getRowValue(row, "Transcript") ??
        getRowValue(row, "transcript");

      if (!personId || normalizeComparableValue(reportId) !== EXPECTED_MURDER_REPORT.reportId) {
        return rejectClue(
          "That row is not part of the witness trail Samuel wants. Stay with the InterviewLog rows tied to ReportID 10975."
        );
      }

      if (!logTranscript || isConfessionHeavyTranscript(logTranscript)) {
        return rejectClue(
          "That row sounds like confession or contract detail, not the witness bundle Samuel wants first. Pick a row that sounds like someone saw, heard, recognized, or described something at the scene."
        );
      }

      const witnessRows = studentLastQueryExecution.response.data.rows.filter((candidateRow) => {
        const candidatePersonId =
          getRowValue(candidateRow, "PersonID") ??
          getRowValue(candidateRow, "personid") ??
          getRowValue(candidateRow, "PersonId") ??
          getRowValue(candidateRow, "personId");
        const candidateTranscript =
          getRowValue(candidateRow, "LogTranscript") ??
          getRowValue(candidateRow, "logtranscript") ??
          getRowValue(candidateRow, "Transcript") ??
          getRowValue(candidateRow, "transcript");

        return (
          normalizeComparableValue(candidatePersonId) === normalizeComparableValue(personId) &&
          candidateTranscript !== null &&
          isWitnessObservationTranscript(candidateTranscript)
        );
      });

      if (witnessRows.length === 0) {
        return rejectClue(
          "Samuel still needs a witness bundle here. Try another row tied to a repeated PersonID that sounds like a scene observation."
        );
      }

      const witnessSummary = buildWitnessBundleSummary(
        witnessRows
          .map((witnessRow) =>
            getRowValue(witnessRow, "LogTranscript") ??
            getRowValue(witnessRow, "logtranscript") ??
            getRowValue(witnessRow, "Transcript") ??
            getRowValue(witnessRow, "transcript") ??
            ""
          )
          .filter(Boolean)
      );

      const witnessEntries: EvidenceNotebookEntry[] = [
        {
          id: `witness-person-${personId}`,
          detail: `Witness PersonID = ${personId}`,
          sourceLabel: "InterviewLog"
        },
        {
          id: `witness-bundle-${personId}`,
          detail: `Witness bundle ${personId}: ${witnessSummary}`,
          sourceLabel: "InterviewLog"
        }
      ];

      const alreadyLoggedWitness = notebookEntries.some(
        (entry) => entry.id === `witness-person-${personId}`
      );
      if (alreadyLoggedWitness) {
        return duplicateClue(
          witnessBundleCount >= 2
            ? `Already logged. Both witness bundles are pinned now. Use PersonsOfInterest and those PersonIDs to identify the witness names first.`
            : `Already logged. Witness clue bundle for PersonID ${personId} is already pinned. Find the other repeated PersonID and use Log Clue on one strong witness row for that bundle too.`
        );
      }
      const nextWitnessBundleCount = alreadyLoggedWitness ? witnessBundleCount : witnessBundleCount + 1;
      upsertNotebookEntries(witnessEntries);
      const witnessTrailCompleted = nextWitnessBundleCount >= 2;
      if (witnessTrailCompleted) {
        setCompletedMilestones((current) => ({ ...current, "witness-clues": true }));
      }
      const witnessMessage =
        witnessTrailCompleted
          ? `Witness clue bundle logged for PersonID ${personId}. Both witness bundles are pinned now. Use PersonsOfInterest and those PersonIDs to identify the witness names first. Stay focused on the names until both witness rows are pinned.`
          : `Witness clue bundle logged for PersonID ${personId}. Find the other repeated PersonID and use Log Clue on one strong witness row for that bundle too.`;
      logClue(witnessMessage);
      setHighlightedNotebookEntryId(`witness-bundle-${personId}`);
      if (witnessTrailCompleted) {
        setPendingEvidenceStep("witness-names");
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(WITNESS_NAME_LOOKUP_DRAFT);
        setStudentView("workbench");
        return {
          status: "logged",
          message: witnessMessage
        };
      }

      setStudentView("workbench");
      return {
        status: "logged",
        message: witnessMessage
      };
    }

    if (
      pendingEvidenceStep === "witness-names" &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from personsofinterest")
    ) {
      const personIdValue =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personId = personIdValue === null ? null : String(personIdValue).trim();
      const personName =
        getRowValue(row, "PersonName") ??
        getRowValue(row, "personname") ??
        getRowValue(row, "Name") ??
        getRowValue(row, "name");

      if (!personId || !loggedWitnessPersonIds.includes(personId)) {
        return rejectClue(
          "That row is not one of the two witness identities Samuel asked for. Stay with the pinned witness PersonIDs."
        );
      }

      if (!personName) {
        return rejectClue(
          "That row does not clearly identify the witness by name yet. Re-run the PersonsOfInterest lookup and use the rows with visible names."
        );
      }

      if (notebookEntries.some((entry) => entry.id === `witness-name-${personId}`)) {
        return duplicateClue(
          loggedWitnessNameIds.length >= 2
            ? "Already logged. Both witness names are pinned now. The gym lead is ready next."
            : `Already logged. Witness name for PersonID ${personId} is already pinned. Pin the other witness name from this lookup too.`
        );
      }

      upsertNotebookEntries([
        {
          id: `witness-name-${personId}`,
          detail: `Witness Name ${personId} = ${personName}`,
          sourceLabel: "PersonsOfInterest"
        }
      ]);

      const nextLoggedNameIds = loggedWitnessNameIds.includes(personId)
        ? loggedWitnessNameIds
        : [...loggedWitnessNameIds, personId];
      const namesComplete = nextLoggedNameIds.length >= 2;

      const witnessNameMessage =
        namesComplete
          ? `Witness name logged for PersonID ${personId}. Both witness identities are pinned now. The gym lead is ready next.`
          : `Witness name logged for PersonID ${personId}. Pin the other witness name from this lookup too.`;
      logClue(witnessNameMessage);
      setHighlightedNotebookEntryId(`witness-name-${personId}`);

      if (namesComplete) {
        setPendingEvidenceStep("gym-lead");
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(null);
        resetStudentQueryRunner();
        setStudentView("workbench");
        return {
          status: "logged",
          message: witnessNameMessage
        };
      }

      return {
        status: "logged",
        message: witnessNameMessage
      };
    }

    if (
      pendingEvidenceStep === "gym-lead" &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from fitnflabclub")
    ) {
      const fitMemberId =
        getRowValue(row, "FitMemberID") ??
        getRowValue(row, "fitmemberid") ??
        getRowValue(row, "FitMemberId") ??
        getRowValue(row, "fitMemberId");
      const fitMembershipStatus =
        getRowValue(row, "FitMembershipStatus") ??
        getRowValue(row, "fitmembershipstatus") ??
        getRowValue(row, "FitMembership") ??
        getRowValue(row, "fitMembership");
      const personId =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");

      const matchesGymClues =
        normalizeComparableValue(fitMembershipStatus) === "gold" &&
        normalizeComparableValue(fitMemberId).startsWith("48z");

      if (!matchesGymClues || !personId || !fitMemberId) {
        return rejectClue(
          "That row does not lock the gym clue yet. Stay with the single membership row that matches both the 48Z and gold clues."
        );
      }

      if (notebookEntries.some((entry) => entry.id === `gym-lead-person-${personId}`)) {
        return duplicateClue(
          `Already logged. The gym membership lead already points to PersonID ${personId}. Resolve that PersonID into a real name before you test any suspect theory.`
        );
      }

      const gymEntries: EvidenceNotebookEntry[] = [
        {
          id: `gym-fit-member-${fitMemberId}`,
          detail: `FitMemberID = ${fitMemberId}`,
          sourceLabel: "FitNFlabClub"
        },
        {
          id: `gym-lead-person-${personId}`,
          detail: `Gym Lead PersonID = ${personId}`,
          sourceLabel: "FitNFlabClub"
        }
      ];

      upsertNotebookEntries(gymEntries);
      setCompletedMilestones((current) => ({ ...current, "gym-chain": true }));
      setPendingEvidenceStep("suspect-candidate");
      const gymMessage =
        `Clue logged: the gym membership lead points to PersonID ${personId}. Resolve that PersonID into a real name before you test any suspect theory.`;
      logClue(gymMessage);
      setHighlightedNotebookEntryId(`gym-lead-person-${personId}`);
      setStudentDraftQuery(null);
      setStudentView("workbench");
      return {
        status: "logged",
        message: gymMessage
      };
    }

    if (
      pendingEvidenceStep === "suspect-candidate" &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from personsofinterest")
    ) {
      const personIdValue =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personId = personIdValue === null ? null : String(personIdValue).trim();
      const personName =
        getRowValue(row, "PersonName") ??
        getRowValue(row, "personname") ??
        getRowValue(row, "Name") ??
        getRowValue(row, "name");

      if (!personId || !gymLeadPersonId || personId !== gymLeadPersonId) {
        return rejectClue(
          "That row is not the gym-linked person Samuel asked for. Open Case File > Pinned Facts and stay with the pinned gym lead PersonID."
        );
      }

      if (!personName) {
        return rejectClue(
          "That row does not clearly identify the gym-linked person by name yet. Re-run PersonsOfInterest with the pinned gym lead PersonID and use the row with a visible name."
        );
      }

      if (notebookEntries.some((entry) => entry.id === `gym-lead-name-${personId}`)) {
        return duplicateClue(
          `Already logged. ${personName} is already pinned as the gym-linked person. Review ${personName}'s InterviewLog before you decide whether to test the theory.`
        );
      }

      upsertNotebookEntries([
        {
          id: `gym-lead-name-${personId}`,
          detail: `Gym Lead Name ${personId} = ${personName}`,
          sourceLabel: "PersonsOfInterest"
        }
      ]);

      setPendingEvidenceStep("suspect-interview");
      const suspectCandidateMessage =
        `Gym-linked person logged for PersonID ${personId}. ${personName} is pinned now. Review ${personName}'s InterviewLog before you decide whether to test the theory.`;
      logClue(suspectCandidateMessage);
      setHighlightedNotebookEntryId(`gym-lead-name-${personId}`);
      setStudentLastQueryExecution(null);
      setStudentDraftQuery(null);
      resetStudentQueryRunner();
      setStudentSuspectTheoryResult(null);
      setStudentSuspectTheoryError(null);
      setStudentView("workbench");
      return {
        status: "logged",
        message: suspectCandidateMessage
      };
    }

    if (
      pendingEvidenceStep === "suspect-interview" &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from interviewlog")
    ) {
      const personIdValue =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personId = personIdValue === null ? null : String(personIdValue).trim();
      const logTranscript =
        getRowValue(row, "LogTranscript") ??
        getRowValue(row, "logtranscript") ??
        getRowValue(row, "Transcript") ??
        getRowValue(row, "transcript");
      const logIdValue =
        getRowValue(row, "LogID") ??
        getRowValue(row, "logid") ??
        getRowValue(row, "LogId") ??
        getRowValue(row, "logId");
      const logId = logIdValue === null ? null : String(logIdValue).trim();
      const reportIdValue =
        getRowValue(row, "ReportID") ??
        getRowValue(row, "reportid") ??
        getRowValue(row, "ReportId") ??
        getRowValue(row, "reportId");
      const reportId = reportIdValue === null ? null : String(reportIdValue).trim();

      if (
        !personId ||
        !gymLeadPersonId ||
        normalizeComparableValue(personId) !== normalizeComparableValue(gymLeadPersonId)
      ) {
        return rejectClue(
          "That row is not from the gym-linked suspect's interview trail. Stay with the pinned PersonID in InterviewLog."
        );
      }

      if (!reportId || normalizeComparableValue(reportId) !== normalizeComparableValue(pinnedReportId)) {
        return rejectClue(
          `That row is not tied to ReportID ${pinnedReportId}. Keep the murder-report transcript trail in view before you log the suspect clue.`
        );
      }

      if (!logTranscript) {
        return rejectClue(
          "That row adds color, but it is not the confession Samuel asked for. Pick the row where the suspect directly admits the killing."
        );
      }

      if (!isDirectKillerConfessionTranscript(logTranscript)) {
        if (isMastermindLeadTranscript(logTranscript)) {
          return deferClue(
            "Interesting detail, but it does not prove the current suspect step. Find the row where the suspect directly admits the killing."
          );
        }

        return rejectClue(
          "That row adds color, but it is not the confession Samuel asked for. Pick the row where the suspect directly admits the killing."
        );
      }

      const suspectInterviewEntryId = logId
        ? `suspect-interview-clue-${logId}`
        : `suspect-interview-clue-${normalizeComparableValue(logTranscript).slice(0, 48)}`;

      if (notebookEntries.some((entry) => entry.id === suspectInterviewEntryId)) {
        return duplicateClue(
          "Already logged. The suspect's direct confession is already pinned. Click the Evidence Board tab now and decide whether the case is strong enough to test your first theory."
        );
      }

      upsertNotebookEntries([
        {
          id: suspectInterviewEntryId,
          detail: `Suspect Interview Clue: ${summarizeSuspectInterviewTranscript(logTranscript)}`,
          sourceLabel: "InterviewLog"
        }
      ]);
      setCompletedMilestones((current) => ({ ...current, "suspect-interview": true }));
      setPendingEvidenceStep(null);
      const suspectInterviewMessage =
        "Interview clue logged. Click the Evidence Board tab now. In Suspect Theory Check, review the pinned suspect name and use Test Theory when you are ready.";
      logClue(suspectInterviewMessage);
      setHighlightedNotebookEntryId(suspectInterviewEntryId);
      setStudentView("workbench");
      return {
        status: "logged",
        message: suspectInterviewMessage
      };
    }

    if (
      completedMilestones["trigger-check"] &&
      !completedMilestones["mastermind-trace"] &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from interviewlog")
    ) {
      const personIdValue =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personId = personIdValue === null ? null : String(personIdValue).trim();
      const reportIdValue =
        getRowValue(row, "ReportID") ??
        getRowValue(row, "reportid") ??
        getRowValue(row, "ReportId") ??
        getRowValue(row, "reportId");
      const reportId = reportIdValue === null ? null : String(reportIdValue).trim();
      const logTranscript =
        getRowValue(row, "LogTranscript") ??
        getRowValue(row, "logtranscript") ??
        getRowValue(row, "Transcript") ??
        getRowValue(row, "transcript");
      const logIdValue =
        getRowValue(row, "LogID") ??
        getRowValue(row, "logid") ??
        getRowValue(row, "LogId") ??
        getRowValue(row, "logId");
      const logId = logIdValue === null ? null : String(logIdValue).trim();

      if (
        !personId ||
        !confirmedTriggerSuspectPersonId ||
        normalizeComparableValue(personId) !==
          normalizeComparableValue(confirmedTriggerSuspectPersonId)
      ) {
        return rejectClue(
          "That row is not from the confirmed killer's transcript trail. Stay with the pinned suspect's InterviewLog rows."
        );
      }

      if (
        !reportId ||
        normalizeComparableValue(reportId) !== normalizeComparableValue(pinnedReportId)
      ) {
        return rejectClue(
          `That row is not tied to ReportID ${pinnedReportId}. Keep the murder-report transcript trail in view before you log the mastermind clue.`
        );
      }

      if (!logTranscript || !isMastermindLeadTranscript(logTranscript)) {
        return rejectClue(
          "That row keeps the killer in frame, but it does not add a usable mastermind clue yet. Pick a row that reveals who hired him, how they met, or what the hiring person was like."
        );
      }

      const clueTags = extractMastermindTranscriptClueTags(logTranscript);
      const newClueTags = clueTags.filter((tag) => !loggedMastermindClueTags.includes(tag));

      if (newClueTags.length === 0) {
        return duplicateClue(
          "That row repeats clue threads you already logged. Keep reading and pick a row that adds a new detail about the woman, the meetings, the money, the car, or her appearance."
        );
      }

      const mastermindClueEntryId = logId
        ? `mastermind-clue-${logId}`
        : `mastermind-clue-${normalizeComparableValue(logTranscript).slice(0, 48)}`;

      upsertNotebookEntries([
        {
          id: mastermindClueEntryId,
          detail: `Mastermind Clue: ${summarizeMastermindLeadTranscript(logTranscript)}`,
          sourceLabel: "InterviewLog",
          notebookPage: "mastermind",
          clueTags: newClueTags
        }
      ]);
      const updatedClueCount = mastermindClueCount + 1;
      const updatedLoggedTags = Array.from(
        new Set([...loggedMastermindClueTags, ...newClueTags])
      );
      const updatedProfileCount = MASTERMIND_PROFILE_TARGETS.filter((target) =>
        updatedLoggedTags.includes(target.category)
      ).length;
      const mastermindMessage =
        updatedProfileCount === MASTERMIND_PROFILE_TARGETS.length
          ? `Mastermind profile complete: ${updatedProfileCount}/${MASTERMIND_PROFILE_TARGETS.length} clue threads pinned. Next, leave InterviewLog and narrow DriversLicense to female redheaded BMW M8 owners between 65 and 67 inches tall.`
          : `Mastermind clue logged. You now have ${updatedClueCount} transcript clue${updatedClueCount === 1 ? "" : "s"} pinned and ${updatedProfileCount}/${MASTERMIND_PROFILE_TARGETS.length} clue threads collected. Keep this transcript open and keep logging any row that adds a new clue thread. ${getOutstandingMastermindCluePrompt(updatedLoggedTags)}`;
      logClue(mastermindMessage);
      setHighlightedNotebookEntryId(mastermindClueEntryId);
      if (updatedProfileCount === MASTERMIND_PROFILE_TARGETS.length) {
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(null);
        resetStudentQueryRunner();
        setStudentView("workbench");
        return {
          status: "logged",
          message: mastermindMessage
        };
      }
      setStudentView("workbench");
      return {
        status: "logged",
        message: mastermindMessage
      };
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from employment") &&
      hasPinnedMastermindIdentities
    ) {
      const ssnValue =
        getRowValue(row, "SSN") ?? getRowValue(row, "ssn") ?? getRowValue(row, "Ssn");
      const jobTitle =
        getRowValue(row, "JobTitle") ?? getRowValue(row, "jobtitle") ?? getRowValue(row, "Job");
      const companyName =
        getRowValue(row, "CompanyName") ??
        getRowValue(row, "companyname") ??
        getRowValue(row, "Company");
      const incomeValue =
        getRowValue(row, "AnnualIncome") ??
        getRowValue(row, "annualincome") ??
        getRowValue(row, "Salary") ??
        getRowValue(row, "salary");
      const ssn = ssnValue === null ? null : String(ssnValue).trim();
      const income = incomeValue === null ? null : String(incomeValue).trim();

      if (ssn !== "987756388") {
        return rejectClue(
          "That Employment row keeps a candidate in view, but it is not the wealthy paid-hit tie-break. Use the row with the much higher income."
        );
      }

      const entryId = "mastermind-employment-987756388";
      if (notebookEntries.some((entry) => entry.id === entryId)) {
        return duplicateClue(
          "Already logged. Miranda's Employment row is pinned as the paid-hit tie-break. Open Evidence Board and test the supported mastermind theory."
        );
      }

      const employmentMessage =
        "Employment tie-break logged. Miranda's much higher income supports the wealthy paid-hit clue. Open Evidence Board and test the mastermind theory.";
      upsertNotebookEntries([
        {
          id: entryId,
          detail: `Employment Tie-Break: SSN ${ssn}${jobTitle ? `, ${String(jobTitle)}` : ""}${companyName ? ` at ${String(companyName)}` : ""}${income ? `, income ${income}` : ""}`,
          sourceLabel: "Employment",
          notebookPage: "mastermind"
        }
      ]);
      logClue(employmentMessage);
      setHighlightedNotebookEntryId(entryId);
      setStudentView("workbench");
      return {
        status: "logged",
        message: employmentMessage
      };
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from personsofinterest") &&
      shouldPivotToSymphonyHallTrail
    ) {
      const personIdValue =
        getRowValue(row, "PersonID") ??
        getRowValue(row, "personid") ??
        getRowValue(row, "PersonId") ??
        getRowValue(row, "personId");
      const personName =
        getRowValue(row, "PersonName") ??
        getRowValue(row, "personname") ??
        getRowValue(row, "Name") ??
        getRowValue(row, "name");
      const licenseIdValue =
        getRowValue(row, "LicenseID") ??
        getRowValue(row, "licenseid") ??
        getRowValue(row, "LicenseId") ??
        getRowValue(row, "licenseId");
      const ssnValue =
        getRowValue(row, "SSN") ??
        getRowValue(row, "ssn") ??
        getRowValue(row, "Ssn");
      const personId = personIdValue === null ? null : String(personIdValue).trim();
      const licenseId = licenseIdValue === null ? null : String(licenseIdValue).trim();
      const ssn = ssnValue === null ? null : String(ssnValue).trim();

      if (!personId || !personName || !licenseId || !ssn) {
        return rejectClue(
          "That row does not fully identify the candidate yet. Stay with the candidate rows that show PersonID, name, LicenseID, and SSN together."
        );
      }

      if (!loggedMastermindCandidateLicenseIds.includes(licenseId.toLowerCase())) {
        return rejectClue(
          "That row is not one of the shortlisted mastermind candidates. Stay with the two pinned candidate LicenseIDs."
        );
      }

      const identityEntryId = `mastermind-identity-${personId}`;
      if (notebookEntries.some((entry) => entry.id === identityEntryId)) {
        return duplicateClue(
          loggedMastermindIdentityCount >= 2
            ? "Already logged. Both women are pinned now. Next, query EventSchedule with the December 2022 and 'Symphony' clues."
            : "Already logged. That candidate identity is already pinned. Pin the other candidate's identity row so both EventPersonIDs are ready for EventRegistration."
        );
      }
      upsertNotebookEntries([
        {
          id: identityEntryId,
          detail: `Mastermind Identity: PersonID ${personId}, PersonName ${personName}, LicenseID ${licenseId}, SSN ${ssn}`,
          sourceLabel: "PersonsOfInterest",
          notebookPage: "mastermind"
        }
      ]);

      const identityAlreadyLogged = notebookEntries.some((entry) => entry.id === identityEntryId);
      const nextLoggedMastermindIdentityCount = identityAlreadyLogged
        ? loggedMastermindIdentityCount
        : loggedMastermindIdentityCount + 1;

      const identityMessage =
        nextLoggedMastermindIdentityCount >= 2
          ? "Identity logged. Both women are pinned now. Next, query EventSchedule with the December 2022 and 'Symphony' clues."
          : "Identity logged. Pin the other candidate's identity row so both EventPersonIDs are ready for EventRegistration.";
      logClue(identityMessage);
      setHighlightedNotebookEntryId(identityEntryId);
      if (nextLoggedMastermindIdentityCount >= 2) {
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(null);
        resetStudentQueryRunner();
      }
      setStudentView("workbench");
      return {
        status: "logged",
        message: identityMessage
      };
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      studentLastQueryExecution?.response?.success &&
      normalizedLastStudentSql.includes("from driverslicense")
    ) {
      const licenseIdValue =
        getRowValue(row, "LicenseID") ??
        getRowValue(row, "licenseid") ??
        getRowValue(row, "LicenseId") ??
        getRowValue(row, "licenseId");
      const plateNumber =
        getRowValue(row, "PlateNumber") ??
        getRowValue(row, "platenumber") ??
        getRowValue(row, "Plate") ??
        getRowValue(row, "plate");
      const heightValue = getRowValue(row, "Height") ?? getRowValue(row, "height");
      const hairColor =
        getRowValue(row, "HairColor") ??
        getRowValue(row, "haircolor");
      const carMake =
        getRowValue(row, "CarMake") ??
        getRowValue(row, "carmake");
      const carModel =
        getRowValue(row, "CarModel") ??
        getRowValue(row, "carmodel");
      const gender =
        getRowValue(row, "Gender") ??
        getRowValue(row, "gender");
      const licenseId = licenseIdValue === null ? null : String(licenseIdValue).trim();

      if (!licenseId || !plateNumber || !heightValue || !hairColor || !carMake || !carModel || !gender) {
        return rejectClue(
          "That row is missing key identity details. Keep the narrowed DriversLicense shortlist in view and log rows with visible vehicle, hair, height, and plate details."
        );
      }

      const candidateEntryId = `mastermind-candidate-${licenseId}`;
      if (notebookEntries.some((entry) => entry.id === candidateEntryId)) {
        return duplicateClue(
          loggedMastermindCandidateCount >= 2
            ? "Already logged. Your two-person shortlist is already pinned. Use the candidate LicenseIDs to identify both women, then compare their December 'Symphony' trail before you make the final call."
            : "Already logged. That DriversLicense candidate is already pinned. If another row still fits the profile, log that one too before you move on from the shortlist."
        );
      }
      upsertNotebookEntries([
        {
          id: candidateEntryId,
          detail: `Mastermind Candidate: LicenseID ${licenseId}, ${hairColor}-haired ${gender} ${carMake} ${carModel} owner, ${heightValue} inches tall, plate ${plateNumber}`,
          sourceLabel: "DriversLicense",
          notebookPage: "mastermind"
        }
      ]);
      const candidateAlreadyLogged = notebookEntries.some(
        (entry) => entry.id === candidateEntryId
      );
      const nextLoggedMastermindCandidateCount = candidateAlreadyLogged
        ? loggedMastermindCandidateCount
        : loggedMastermindCandidateCount + 1;
      const candidateMessage =
        nextLoggedMastermindCandidateCount >= 2
          ? "Candidate logged. Your two-person shortlist is ready. Use the candidate LicenseIDs to identify both women, then compare their December 'Symphony' trail before you make the final call."
          : "Candidate logged. If another DriversLicense row still fits the profile, log that one too before you move on from the shortlist.";
      logClue(candidateMessage);
      setHighlightedNotebookEntryId(candidateEntryId);
      if (nextLoggedMastermindCandidateCount >= 2) {
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(null);
        resetStudentQueryRunner();
      }
      setStudentView("workbench");
      return {
        status: "logged",
        message: candidateMessage
      };
    }

    return rejectClue(
      "That row does not match the clue currently in play. Re-check Samuel's guidance and keep your next evidence pick tied to the current step."
    );
  }

  function handleManualNotebookAdd(notebookPage?: "mastermind"): void {
    const trimmedDraft = manualNotebookDraft.trim();

    if (!trimmedDraft) {
      return;
    }

    const entryId = `manual-note-${Date.now()}`;
    upsertNotebookEntries([
      {
        id: entryId,
        detail: trimmedDraft,
        isManual: true,
        notebookPage
      }
    ]);
    setHighlightedNotebookEntryId(entryId);
    setManualNotebookDraft("");
  }

  function handleStudentSqlEdit(nextSql: string): void {
    setStudentDraftQuery(nextSql);
  }

  async function handleStudentSuspectTheorySubmit(): Promise<void> {
    if (!studentSuspectTheoryDraft.trim()) {
      setStudentSuspectTheoryResult(null);
      setStudentSuspectTheoryError("Choose one collected name before you test the theory.");
      return;
    }

    setStudentSuspectTheoryLoading(true);
    setStudentSuspectTheoryError(null);

    try {
      const response = await verifySuspect(studentSuspectTheoryDraft);
      setStudentSuspectTheoryResult(response);

      const isTriggerManSolved =
        response.data.isCorrect && response.data.solvedRole === "trigger_man";
      const isMastermindSolved =
        response.data.isCorrect && response.data.solvedRole === "mastermind";

      if (isTriggerManSolved) {
        setCompletedMilestones((current) => ({ ...current, "trigger-check": true }));
        setStudentEvidenceFeedback(
          `Case cracked. ${response.data.suspect} is confirmed as the hired killer. Take the win, then use that transcript trail to expose the mastermind behind the hit.`
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentLastQueryExecution(null);
        setStudentDraftQuery(null);
        setStudentView("case-board");
      } else if (isMastermindSolved) {
        setCompletedMilestones((current) => ({
          ...current,
          "trigger-check": true,
          "mastermind-trace": true
        }));
        setStudentEvidenceFeedback(
          "Case closed. The mastermind is confirmed and the full contract chain is solved."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("case-board");
      } else {
        setStudentSuspectTheoryError(
          `Theory checked: ${response.data.suspect} is not supported by the evidence. Choose another collected name and test again.`
        );
        setStudentEvidenceFeedback(
          "Theory checked. The verdict says this suspect is not correct yet, so keep searching for stronger evidence."
        );
        setStudentEvidenceFeedbackTone("error");
      }
    } catch (submitError) {
      setStudentSuspectTheoryResult(null);
      setStudentSuspectTheoryError(
        submitError instanceof Error
          ? submitError.message
          : "Suspect theory check failed."
      );
    } finally {
      setStudentSuspectTheoryLoading(false);
    }
  }

  function getCase001NextDraftQuery(milestoneId: Case001SqlMilestoneId): string | null {
    if (milestoneId === CASE_001_SQL_FEEDBACK_SLICES[0].milestoneId) {
      return CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE.starterSql;
    }

    if (milestoneId === CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id) {
      return CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE.starterSql;
    }

    return null;
  }

  function getCase001FeedbackMessage(milestoneId: Case001SqlMilestoneId): string {
    const slice = CASE_001_SQL_FEEDBACK_SLICES.find((item) => item.milestoneId === milestoneId);
    return slice?.matchedMessage ?? "Case 001 milestone recognized.";
  }

  function upsertCase001MilestoneNotebookEntry(milestoneId: Case001SqlMilestoneId): void {
    const entry =
      milestoneId === CASE_001_SQL_FEEDBACK_SLICES[0].milestoneId
        ? {
            id: "case-001-clocktower-report-located",
            detail: "Clocktower incident report located",
            sourceLabel: "Samuel Step 1"
          }
        : milestoneId === CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id
          ? {
              id: "case-001-report-interviews-located",
              detail: "Report-linked interviews located",
              sourceLabel: "Samuel Step 2"
            }
          : {
              id: "case-001-witness-identities-resolved",
              detail: "Witness identities resolved",
              sourceLabel: "Samuel Step 3"
            };

    upsertNotebookEntries([entry]);
    setHighlightedNotebookEntryId(entry.id);
  }

  function handleCase001QueryExecutionComplete(payload: QueryRunnerExecutionPayload): void {
    setStudentLastQueryExecution(payload);
    setStudentSceneFeedbackTone("neutral");
    clearStudentFeedback();

    if (payload.error || !payload.response?.success) {
      return;
    }

    setStudentDraftQuery(payload.sql);

    const evaluation = payload.response.caseMilestoneEvaluation;
    if (!evaluation) {
      setStudentEvidenceFeedback(
        "The query ran and results are visible, but the gated Case 001 milestone metadata was not returned."
      );
      setStudentEvidenceFeedbackTone("advisory");
      setStudentEvidenceFeedbackVersion((current) => current + 1);
      return;
    }

    if (!evaluation.matched) {
      setStudentEvidenceFeedback(
        "The query ran and results are visible, but this result set has not matched the active Case 001 milestone yet. Recheck the table relationship and narrow with proved values from the rows or Pinned Facts."
      );
      setStudentEvidenceFeedbackTone("advisory");
      setStudentEvidenceFeedbackVersion((current) => current + 1);
      return;
    }

    const milestoneId = evaluation.milestoneId;
    setCase001CompletedMilestones((current) => ({
      ...current,
      [milestoneId]: true
    }));
    upsertCase001MilestoneNotebookEntry(milestoneId);
    setStudentEvidenceFeedback(getCase001FeedbackMessage(milestoneId));
    setStudentEvidenceFeedbackTone("success");
    setStudentEvidenceFeedbackVersion((current) => current + 1);
    const nextDraft = getCase001NextDraftQuery(milestoneId);
    if (nextDraft) {
      setStudentDraftQuery(nextDraft);
    }
    setStudentView("workbench");
  }

  function handleQueryExecutionComplete(payload: QueryRunnerExecutionPayload): void {
    if (getShellStudentCaseId(activeCaseId) === CASE_001_ENTRY_ID) {
      handleCase001QueryExecutionComplete(payload);
      return;
    }

    setStudentLastQueryExecution(payload);
    setStudentSceneFeedbackTone("neutral");

    // WP-113: feedback persists until the next meaningful action supersedes
    // it. Running a new query is one of those actions, so clear first and let
    // the latest query state replace the message if needed.
    clearStudentFeedback();

    if (payload.error) {
      return;
    }

    if (!payload.response?.success) {
      return;
    }

    setStudentDraftQuery(payload.sql);

    const normalizedSql = normalizeSqlForMilestones(payload.sql);
    setCompletedMilestones((current) => {
      const updated = { ...current };

      for (const milestone of CASE_004_MILESTONES) {
        const requiresEvidenceLog =
          milestone.id === "crime-type" ||
          milestone.id === "crime-scene-filter" ||
          milestone.id === "witness-clues" ||
          milestone.id === "gym-chain";

        if (requiresEvidenceLog) {
          continue;
        }

        const milestoneId = milestone.id as MilestoneId;
        if (!updated[milestoneId] && milestone.matches(normalizedSql)) {
          updated[milestoneId] = true;
        }
      }

      return updated;
    });

    if (normalizedSql.includes("from crimetype")) {
      setPendingEvidenceStep("crime-type");
      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentView("workbench");
      return;
    }

    if (normalizedSql.includes("from crimescenereport") && !normalizedSql.includes("where")) {
      setSamuelStage((current) => Math.max(current, 2));
      setPendingEvidenceStep(null);
      setHighlightedNotebookEntryId(null);
      setStudentEvidenceFeedback(
        "Good. You found the report backlog. I queued the murder-only filter for you. Run it next, then see whether the report pile still needs one more narrowing clue."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentDraftQuery(SAMUEL_TUPLETON_STEPS[2].queryDraft);
      setStudentView("workbench");
      return;
    }

    if (
      pendingEvidenceStep === "gym-lead" &&
      normalizedSql.includes("from fitnflabclub")
    ) {
      setPendingEvidenceStep("gym-lead");
      setHighlightedNotebookEntryId(null);
      if (!normalizedSql.includes("where")) {
        setStudentEvidenceFeedback(
          "Good. You found the membership table. Now use the witness clues to narrow it: the gym bag membership starts with 48Z, and only gold members have those bags."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (payload.response.data.rowCount === 1) {
        setStudentEvidenceFeedback(
          "Good. One gym membership row matches both clues. Use Log Clue to pin it before you move on."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentView("workbench");
      return;
    }

    if (
      pendingEvidenceStep === "witness-names" &&
      normalizedSql.includes("from personsofinterest")
    ) {
      const hasWitnessIdFilter =
        normalizedSql.includes("where") &&
        loggedWitnessPersonIds.length > 0 &&
        loggedWitnessPersonIds.every((personId) => normalizedSql.includes(personId.toLowerCase()));

      if (!hasWitnessIdFilter) {
        setPendingEvidenceStep("witness-names");
        setHighlightedNotebookEntryId(null);
        setStudentEvidenceFeedback(
          "That name table is still too broad. Use the two pinned witness PersonIDs from Case File to narrow it yourself, then use Log Clue on both matching name rows."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setPendingEvidenceStep("witness-names");
      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentView("workbench");
      return;
    }

    if (
      pendingEvidenceStep === "suspect-candidate" &&
      normalizedSql.includes("from personsofinterest")
    ) {
      const hasGymLeadFilter =
        normalizedSql.includes("where") &&
        gymLeadPersonId !== null &&
        normalizedSql.includes(gymLeadPersonId.toLowerCase());

      if (!hasGymLeadFilter) {
        setPendingEvidenceStep("suspect-candidate");
        setHighlightedNotebookEntryId(null);
        setStudentEvidenceFeedback(
          "That people table is still too broad. Open Case File > Pinned Facts, use the pinned gym lead PersonID to narrow PersonsOfInterest, then log the one matching person row."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setPendingEvidenceStep("suspect-candidate");
      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentView("workbench");
      return;
    }

    if (
      pendingEvidenceStep === "suspect-interview" &&
      normalizedSql.includes("from interviewlog")
    ) {
      const hasGymLeadInterviewFilter =
        normalizedSql.includes("where") &&
        gymLeadPersonId !== null &&
        normalizedSql.includes(normalizeComparableValue(gymLeadPersonId));

      if (!hasGymLeadInterviewFilter) {
        setPendingEvidenceStep("suspect-interview");
        setHighlightedNotebookEntryId(null);
        setStudentEvidenceFeedback(
          "That transcript table is still too broad. Open Case File > Pinned Facts, use the pinned gym lead PersonID in InterviewLog, and read what the suspect actually said before you test the theory."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      const responseRows = payload.response.data.rows;
      const rowsIncludeCaseSupport =
        responseRows.length > 0 &&
        responseRows.some((row) => {
          const transcript =
            getRowValue(row, "LogTranscript") ??
            getRowValue(row, "logtranscript") ??
            getRowValue(row, "Transcript") ??
            getRowValue(row, "transcript");
          return transcript !== null && isConfessionHeavyTranscript(transcript);
        });

      setPendingEvidenceStep("suspect-interview");
      setHighlightedNotebookEntryId(null);
      setStudentPreservedTranscriptExecution(payload);
      setStudentEvidenceFeedback(
        rowsIncludeCaseSupport
          ? "Good. You have the gym-linked suspect's interview log in view now. Read the rows and use Log Clue on the one that most clearly shows what his own words add to the case."
          : "Good. You have the gym-linked suspect's interview log in view now. Keep reading until you find the row that best shows what his own words add to the case."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      normalizedSql.includes("from driverslicense")
    ) {
      const hasVehicleFilters =
        normalizedSql.includes("carmake") &&
        normalizedSql.includes("bmw") &&
        normalizedSql.includes("carmodel") &&
        normalizedSql.includes("m8");
      const hasGenderFilter =
        normalizedSql.includes("gender") && normalizedSql.includes("female");
      const hasHairFilter =
        normalizedSql.includes("haircolor") && normalizedSql.includes("red");
      const hasHeightFilter =
        normalizedSql.includes("height") &&
        ((normalizedSql.includes("between") &&
          normalizedSql.includes("65") &&
          normalizedSql.includes("67")) ||
          (normalizedSql.includes(">=") &&
            normalizedSql.includes("65") &&
            normalizedSql.includes("<=") &&
            normalizedSql.includes("67")));
      const rowCount = payload.response.data.rowCount;

      setPendingEvidenceStep(null);
      setHighlightedNotebookEntryId(null);

      if (!hasVehicleFilters) {
        setStudentEvidenceFeedback(
          "Good. You moved into DriversLicense. Start with the vehicle clue first: BMW M8."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (!hasGenderFilter || !hasHairFilter) {
        setStudentEvidenceFeedback(
          "Good. The BMW M8 filter is in place. Now add the transcript clues that the mastermind is a woman with red hair."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (!hasHeightFilter) {
        setStudentEvidenceFeedback(
          "Good. You narrowed by vehicle, gender, and hair. Add the height clue next: between 65 and 67 inches tall."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setStudentEvidenceFeedback(
        rowCount > 1
          ? `Good. You are down to ${rowCount} DriversLicense candidate${rowCount === 1 ? "" : "s"}. Use Log Clue on each candidate you want to carry into your notebook. Once both are pinned, compare their LicenseIDs against PersonsOfInterest and then follow the December Symphony Hall trail in EventSchedule and EventRegistration.`
          : "Good. One DriversLicense candidate remains. Use Log Clue to pin that record, then compare it against your notebook before the final mastermind identification."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      hasPinnedMastermindIdentities &&
      normalizedSql.includes("eventschedule")
    ) {
      setPendingEvidenceStep(null);
      setHighlightedNotebookEntryId(null);

      if (!normalizedSql.includes("eventdate") || !normalizedSql.includes("2022-12")) {
        setStudentEvidenceFeedback(
          "Good. You moved into EventSchedule. Add the December clue next."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (!normalizedSql.includes("eventname") || !normalizedSql.includes("symphony")) {
        setStudentEvidenceFeedback(
          "Good. The December filter is working. Add the 'Symphony' clue next (for example: EventName LIKE '%Symphony%')."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setStudentEvidenceFeedback(
        payload.response.data.rowCount > 0
          ? "Good. You found the December 'Symphony' event rows. Use their EventIDs in EventRegistration with both pinned EventPersonIDs next."
          : "That EventSchedule branch came up empty. Keep the December 2022 and 'Symphony' clues in place and recheck the event rows."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      hasPinnedMastermindIdentities &&
      normalizedSql.includes("from eventregistration")
    ) {
      const rowCount = payload.response.data.rowCount;
      const responseRows = payload.response.data.rows;
      const candidatePersonIds = new Set(loggedMastermindIdentityPersonIds);
      const hasEventPersonIdFilters =
        normalizedSql.includes("eventpersonid") &&
        loggedMastermindIdentityPersonIds.length > 0 &&
        loggedMastermindIdentityPersonIds.every((personId) => normalizedSql.includes(personId));
      const hasEventIdFilters =
        normalizedSql.includes("eventid") &&
        loggedMastermindSymphonyEventIds.length >= 3 &&
        loggedMastermindSymphonyEventIds.every((eventId) => normalizedSql.includes(eventId));
      const sharedEventIdMap = new Map<string, Set<string>>();

      for (const eventRow of responseRows) {
        const eventIdValue =
          getRowValue(eventRow, "EventID") ??
          getRowValue(eventRow, "eventid") ??
          getRowValue(eventRow, "EventId") ??
          getRowValue(eventRow, "eventId");
        const eventPersonIdValue =
          getRowValue(eventRow, "EventPersonID") ??
          getRowValue(eventRow, "eventpersonid") ??
          getRowValue(eventRow, "EventPersonId") ??
          getRowValue(eventRow, "eventPersonId");
        const eventId = eventIdValue === null ? null : String(eventIdValue).trim();
        const eventPersonId =
          eventPersonIdValue === null ? null : String(eventPersonIdValue).trim().toLowerCase();

        if (!eventId || !eventPersonId || !candidatePersonIds.has(eventPersonId)) {
          continue;
        }

        const people = sharedEventIdMap.get(eventId) ?? new Set<string>();
        people.add(eventPersonId);
        sharedEventIdMap.set(eventId, people);
      }

      const sharedEventIds = Array.from(sharedEventIdMap.entries())
        .filter(([, people]) =>
          loggedMastermindIdentityPersonIds.every((personId) => people.has(personId))
        )
        .map(([eventId]) => eventId);

      setPendingEvidenceStep(null);
      setHighlightedNotebookEntryId(null);

      if (!hasEventPersonIdFilters) {
        setStudentEvidenceFeedback(
          "Good. You moved into EventRegistration. Use the Symphony EventIDs plus both pinned EventPersonIDs so you are comparing the same event set against both women."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setStudentEvidenceFeedback(
        hasEventIdFilters
          ? "Good. The Symphony trail keeps both women in play. Use the paid-hit and wealth clue next: compare both candidates in Employment with their pinned SSNs."
          : rowCount > 0
            ? "Good. Both event trails are in view. Now add the Symphony EventIDs from EventSchedule so you can test the same event set against both women."
            : "No event trail is visible yet. Recheck the pinned identities and keep both EventPersonID filters in EventRegistration."
      );
      if (hasEventIdFilters) {
        setStudentDraftQuery("SELECT *\nFROM Employment");
      }
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      completedMilestones["trigger-check"] &&
      completedMilestones["mastermind-profile"] &&
      !completedMilestones["mastermind-trace"] &&
      hasPinnedMastermindIdentities &&
      normalizedSql.includes("from employment")
    ) {
      const hasSsnFilters =
        normalizedSql.includes("ssn") &&
        loggedMastermindIdentitySsns.length > 0 &&
        loggedMastermindIdentitySsns.every((ssn) => normalizedSql.includes(ssn));

      setPendingEvidenceStep(null);
      setHighlightedNotebookEntryId(null);
      setStudentEvidenceFeedback(
        hasSsnFilters
          ? "Good. Both remaining candidates' Employment rows are in view. Compare Salary and CompanyName against the wealthy paid-hit clue, then open Evidence Board to test the supported mastermind theory."
          : "Good. You moved into Employment. Filter this comparison with both pinned candidate SSNs so the paid-hit and wealth clue can break the tie."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      completedMilestones["trigger-check"] &&
      !completedMilestones["mastermind-trace"] &&
      normalizedSql.includes("from interviewlog")
    ) {
      if (completedMilestones["mastermind-profile"]) {
        setPendingEvidenceStep(null);
        setHighlightedNotebookEntryId(null);
        setStudentEvidenceFeedback(
          "You already have the full mastermind transcript profile. Leave InterviewLog now and use DriversLicense to narrow female redheaded BMW M8 owners between 65 and 67 inches tall."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      const normalizedPersonId =
        confirmedTriggerSuspectPersonId === null
          ? null
          : normalizeComparableValue(confirmedTriggerSuspectPersonId);
      const hasPersonIdFilter =
        normalizedPersonId !== null &&
        normalizedSql.includes("personid") &&
        normalizedSql.includes(normalizedPersonId);
      const hasReportIdFilter =
        normalizedSql.includes("reportid") &&
        normalizedSql.includes(normalizeComparableValue(pinnedReportId));
      const responseRows = payload.response.data.rows;
      const rowsAreReportLinked =
        responseRows.length > 0 &&
        responseRows.every((row) => {
          const reportId =
            getRowValue(row, "ReportID") ??
            getRowValue(row, "reportid") ??
            getRowValue(row, "ReportId") ??
            getRowValue(row, "reportId");
          return normalizeComparableValue(reportId) === normalizeComparableValue(pinnedReportId);
        });
      const rowsIncludeMastermindLead =
        responseRows.length > 0 &&
        responseRows.some((row) => {
          const transcript =
            getRowValue(row, "LogTranscript") ??
            getRowValue(row, "logtranscript") ??
            getRowValue(row, "Transcript") ??
            getRowValue(row, "transcript");
          return transcript !== null && isMastermindLeadTranscript(transcript);
        });

      setHighlightedNotebookEntryId(null);
      setStudentPreservedTranscriptExecution(payload);

      if (!hasPersonIdFilter) {
        setStudentEvidenceFeedback(
          `Good start. Now narrow InterviewLog with ${confirmedTriggerPossessiveLabel} pinned PersonID before you decide which transcript matters.`
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (!hasReportIdFilter && !rowsAreReportLinked) {
        setStudentEvidenceFeedback(
          `Good. You isolated ${confirmedTriggerPossessiveLabel} transcript trail. Add ReportID ${pinnedReportId} so you stay on the murder-report transcript before you log anything.`
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      if (rowsIncludeMastermindLead) {
        setStudentEvidenceFeedback(
          "You have the right transcript set. Read the rows and use Log Clue on the one where the killer reveals a client, contract, or employer behind the hit."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentView("workbench");
        return;
      }

      setStudentEvidenceFeedback(
        "Stay with this narrowed transcript trail and keep reading. The next clue is the row where the killer admits someone else ordered the hit."
      );
      setStudentEvidenceFeedbackTone("success");
      setStudentView("workbench");
      return;
    }

    if (
      normalizedSql.includes("from crimescenereport") &&
      normalizedSql.includes("where") &&
      (normalizedSql.includes("crimeid") || normalizedSql.includes("1080"))
    ) {
      if (!normalizedSql.includes("reportcity")) {
        setPendingEvidenceStep(null);
        setHighlightedNotebookEntryId(null);
        setStudentEvidenceFeedback(
          "Murder reports isolated, but the pile is still too large. I queued the SQL City filter for you next. Run it, then look for the January 15th, 2023 report."
        );
        setStudentEvidenceFeedbackTone("success");
        setStudentDraftQuery(SQL_CITY_REPORT_DRAFT);
        setStudentView("workbench");
        return;
      }

      setPendingEvidenceStep("crime-scene-filter");
      setStudentEvidenceFeedback(null);
      setStudentEvidenceFeedbackTone("neutral");
      setStudentView("workbench");
    }
  }

  function handleCaseReviewChoice(choice: CaseReviewChoice): void {
    setCaseReviewStatusId(caseReviewCheck.id);

    if (choice.isCorrect) {
      setCaseReviewStatus("correct");
      const alreadyEarned = earnedCaseReviewIds.includes(caseReviewCheck.id);
      setEarnedCaseReviewIds((current) =>
        current.includes(caseReviewCheck.id) ? current : [...current, caseReviewCheck.id]
      );
      setStudentEvidenceFeedback(
        alreadyEarned
          ? `Insight Mark already earned. ${caseReviewCheck.success}`
          : `Insight Mark earned. ${caseReviewCheck.success}`
      );
      setStudentEvidenceFeedbackTone("success");
      return;
    }

    setCaseReviewStatus("error");
    setStudentEvidenceFeedback(caseReviewCheck.coaching);
    setStudentEvidenceFeedbackTone("error");
  }

  if (getShellStudentCaseId(activeCaseId) === CASE_001_ENTRY_ID) {
    const case001CompletedCount = CASE_001_MILESTONES.filter(
      (milestone) => case001CompletedMilestones[milestone.id as Case001SqlMilestoneId]
    ).length;
    const case001ActiveStep =
      CASE_001_SAMUEL_STEPS[
        Math.min(case001CompletedCount, CASE_001_SAMUEL_STEPS.length - 1)
      ];
    const case001CompletedMilestoneRecord: Record<string, boolean> = {
      ...case001CompletedMilestones
    };
    const case001QueryGuide = {
      title: "Clocktower Evidence Path",
      intro:
        "Samuel's next step: inspect the current result rows, use pinned facts for exact values, and follow the report-to-interview-to-person relationship yourself.",
      clue: case001ActiveStep.nextStep,
      tokens: [
        "CrimeSceneReport",
        "InterviewLog",
        "PersonsOfInterest",
        "ReportID",
        "PersonID",
        "Sequel City"
      ],
      footer:
        "Run the query yourself in Query Runner. Use broad table drafts as starting points, then add only the filters supported by visible rows, pinned facts, or query-assist tokens."
    };

    return {
      activeCaseReviewStatus: "idle" as CaseReviewStatus,
      activeLeads: CASE_001_MILESTONES.filter(
        (milestone) => !case001CompletedMilestoneRecord[milestone.id]
      ),
      activeSamuelStep: case001ActiveStep,
      caseMomentum,
      caseReviewCheck,
      caseStatus: `Case ${CASE_001_BRIEF.caseNumber} · ${CASE_001_BRIEF.caseName} · ${case001CompletedCount}/${CASE_001_MILESTONES.length} clues logged`,
      collectedSuspectTheoryNames: [],
      confirmedTriggerSuspectName: null,
      confirmedTriggerSuspectPersonId: null,
      completedCount: case001CompletedCount,
      completedMilestones: case001CompletedMilestoneRecord,
      handleCaseReviewChoice,
      handleManualNotebookAdd,
      handleQueryExecutionComplete,
      setNotebookEntryPage,
      handleStudentEvidenceLog,
      handleStudentSuspectTheorySubmit,
      handleStudentSqlEdit,
      highlightedNotebookEntryId,
      hasPinnedMastermindIdentities: false,
      insightMarks: 0,
      isMastermindEmploymentReady: false,
      isMastermindEventRegistrationActive: false,
      isMastermindEventScheduleActive: false,
      leadBoardCards: [],
      manualNotebookDraft,
      mastermindCurrentStepDetail: null,
      mastermindCurrentStepTitle: null,
      mastermindEndgamePhase: "inactive" as MastermindEndgamePhase,
      mastermindEventIds: [],
      mastermindNotebookSummary: null,
      mastermindSharedEventIds: [],
      mentorMessage:
        studentView === "briefing"
          ? "Start by inspecting CrimeSceneReport. Look for the public clocktower poisoning report, then use that report row to decide which filters are justified."
          : case001ActiveStep.guidance,
      mentorTitle: studentView === "briefing" ? "Case 001 Briefing" : case001ActiveStep.title,
      notebookEntries,
      pendingEvidenceStep: null,
      removeNotebookEntry,
      resetStudentCaseProgress,
      samuelAvatarSrc,
      samuelCompletedCount: case001CompletedCount,
      samuelTrustLabel,
      samuelVisualState,
      selectedStudentTable,
      selectedTableDetails,
      setManualNotebookDraft,
      setSelectedStudentTable,
      setStudentSuspectTheoryDraft,
      setStudentView,
      shouldShowGymLeadGuide: false,
      shouldShowSuspectCandidateGuide: false,
      shouldShowSuspectInterviewGuide: false,
      shouldShowCrimeReportHandoff: false,
      shouldShowMastermindHandoffGuide: false,
      shouldShowTriggerCheckGuide: false,
      shouldShowWitnessIdentityGuide: false,
      shouldShowWitnessTrailGuide: false,
      studentCaseHeaderRef,
      studentDraftQuery,
      studentEvidenceFeedback,
      studentEvidenceFeedbackTone,
      studentEvidenceFeedbackVersion,
      studentEvidencePrompt:
        "When a Case 001 milestone result is visible, use Log Clue to pin the non-spoiler evidence note, then use Pinned Facts to build the next query yourself.",
      studentLastQueryExecution,
      studentQueryRunnerResetKey,
      studentRestoredExecution,
      studentBrief: CASE_001_BRIEF,
      studentBriefingStepTotal: CASE_001_SAMUEL_STEPS.length,
      studentCaseFacts: CASE_001_KNOWN_CASE_FACTS,
      studentCaseQueryGuide: case001QueryGuide,
      studentMilestoneTotal: CASE_001_MILESTONES.length,
      showStudentCaseReview: false,
      buildStudentCaseMilestoneEvaluationRequest: buildCase001MilestoneEvaluationRequest as (
        sql: string
      ) => QueryExecutionCaseMilestoneEvaluationRequest | undefined,
      studentObjective: case001ActiveStep.nextStep,
      pinnedReportId,
      studentQueryFailureGuidance:
        "Keep the query read-only and tied to the report, interview, or identity trail Samuel is asking for. Use Pinned Facts and query-assist tokens for exact values instead of guessing.",
      studentQueryReinforcement,
      studentQueryRunnerInstruction: case001ActiveStep.nextStep,
      studentSamuelReaction,
      studentScene,
      studentSchema,
      studentSchemaError,
      studentSchemaLoading,
      studentSuspectTheoryDraft: "",
      studentSuspectTheoryError: null,
      studentSuspectTheoryLoading: false,
      studentSuspectTheoryResult: null,
      studentView,
      visibleMilestones: CASE_001_MILESTONES,
      witnessChecklistItems: []
    };
  }

  return {
    activeCaseReviewStatus,
    activeLeads,
    activeSamuelStep,
    caseMomentum,
    caseReviewCheck,
    caseStatus,
    collectedSuspectTheoryNames,
    confirmedTriggerSuspectName,
    confirmedTriggerSuspectPersonId,
    completedCount,
    completedMilestones,
    handleCaseReviewChoice,
    handleManualNotebookAdd,
    handleQueryExecutionComplete,
    setNotebookEntryPage,
    handleStudentEvidenceLog,
    handleStudentSuspectTheorySubmit,
    handleStudentSqlEdit,
    highlightedNotebookEntryId,
    hasPinnedMastermindIdentities,
    insightMarks,
    isMastermindEmploymentReady,
    isMastermindEventRegistrationActive: isMastermindEventRegistrationLookupActive,
    isMastermindEventScheduleActive: isMastermindEventScheduleLookupActive,
    leadBoardCards,
    manualNotebookDraft,
    mastermindCurrentStepDetail,
    mastermindCurrentStepTitle,
    mastermindEndgamePhase,
    mastermindEventIds: loggedMastermindSymphonyEventIds,
    mastermindNotebookSummary,
    mastermindSharedEventIds,
    mentorMessage,
    mentorTitle,
    notebookEntries,
    pendingEvidenceStep,
    removeNotebookEntry,
    resetStudentCaseProgress,
    samuelAvatarSrc,
    samuelCompletedCount,
    samuelTrustLabel,
    samuelVisualState,
    selectedStudentTable,
    selectedTableDetails,
    setManualNotebookDraft,
    setSelectedStudentTable,
    setStudentSuspectTheoryDraft,
    setStudentView,
    shouldShowGymLeadGuide,
    shouldShowSuspectCandidateGuide,
    shouldShowSuspectInterviewGuide,
    shouldShowCrimeReportHandoff,
    shouldShowMastermindHandoffGuide,
    shouldShowTriggerCheckGuide,
    shouldShowWitnessIdentityGuide,
    shouldShowWitnessTrailGuide,
    studentCaseHeaderRef,
    studentDraftQuery,
    studentEvidenceFeedback,
    studentEvidenceFeedbackTone,
    studentEvidenceFeedbackVersion,
    studentEvidencePrompt,
    studentLastQueryExecution,
    studentQueryRunnerResetKey,
    studentRestoredExecution,
    studentBrief: CASE_004_BRIEF,
    studentBriefingStepTotal: SAMUEL_TUPLETON_STEPS.length,
    studentCaseFacts: KNOWN_CASE_FACTS,
    studentCaseQueryGuide: null,
    studentMilestoneTotal: CASE_004_MILESTONES.length,
    showStudentCaseReview: true,
    buildStudentCaseMilestoneEvaluationRequest: undefined,
    studentObjective,
    pinnedReportId,
    studentQueryFailureGuidance,
    studentQueryReinforcement,
    studentQueryRunnerInstruction,
    studentSamuelReaction,
    studentScene,
    studentSchema,
    studentSchemaError,
    studentSchemaLoading,
    studentSuspectTheoryDraft,
    studentSuspectTheoryError,
    studentSuspectTheoryLoading,
    studentSuspectTheoryResult,
    studentView,
    visibleMilestones,
    witnessChecklistItems
  };
}
