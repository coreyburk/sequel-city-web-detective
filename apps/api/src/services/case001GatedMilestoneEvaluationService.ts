import type { QueryExecutionSuccessData } from "../types/query";
import {
  CASE_001_CLOCKTOWER_CASE_ID,
  CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
  CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY,
  CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID,
  CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID,
  type Case001ClocktowerInterviewsValidationResult,
  type Case001ClocktowerReportValidationResult,
  validateCase001ClocktowerReportInterviewsLocated,
  validateCase001ClocktowerReportLocated
} from "./case001ResultPatternService.ts";

export const CASE_001_SKELETON_GATE_NAME =
  "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON";
export const CASE_001_SKELETON_GATE_ENABLED_VALUE = "true";

export type Case001GatedMilestoneEvaluationStatus =
  | "not-case-001"
  | "gate-disabled"
  | "unsupported-milestone"
  | "evaluated-no-progression";

export type Case001SupportedMilestoneId =
  | typeof CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID
  | typeof CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID;

export type Case001SupportedEvidenceTableFamily =
  | typeof CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY
  | typeof CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY;

export type Case001GatedMilestoneValidationResult =
  | Case001ClocktowerReportValidationResult
  | Case001ClocktowerInterviewsValidationResult;

export interface Case001GatedMilestoneEvaluationRequest {
  caseId: string;
  milestoneId: string;
  isSkeletonGateEnabled: boolean;
  queryResult: QueryExecutionSuccessData;
}

export interface Case001GatedMilestoneEvaluationResult {
  caseId: string;
  milestoneId: Case001SupportedMilestoneId;
  evidenceTableFamily: Case001SupportedEvidenceTableFamily;
  gate: {
    name: typeof CASE_001_SKELETON_GATE_NAME;
    enabledValue: typeof CASE_001_SKELETON_GATE_ENABLED_VALUE;
    isEnabled: boolean;
  };
  evaluated: boolean;
  matched: boolean;
  matchedRowCount: number;
  runtimeStatus: Case001GatedMilestoneEvaluationStatus;
  milestoneAdvanced: false;
}

export type Case001MilestoneValidator = (
  queryResult: QueryExecutionSuccessData
) => Case001GatedMilestoneValidationResult;

export type Case001MilestoneValidatorMap = Partial<
  Record<Case001SupportedMilestoneId, Case001MilestoneValidator>
>;

const DEFAULT_VALIDATORS: Record<
  Case001SupportedMilestoneId,
  Case001MilestoneValidator
> = {
  [CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID]:
    validateCase001ClocktowerReportLocated,
  [CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID]:
    validateCase001ClocktowerReportInterviewsLocated
};

export function evaluateCase001GatedMilestone(
  request: Case001GatedMilestoneEvaluationRequest,
  validators: Case001MilestoneValidatorMap = DEFAULT_VALIDATORS
): Case001GatedMilestoneEvaluationResult {
  const milestoneId = normalizeSupportedMilestoneId(request.milestoneId);

  if (request.caseId !== CASE_001_CLOCKTOWER_CASE_ID) {
    return createResult({
      caseId: request.caseId,
      milestoneId: milestoneId ?? CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID,
      evidenceTableFamily:
        getEvidenceTableFamily(milestoneId) ??
        CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
      isGateEnabled: request.isSkeletonGateEnabled,
      evaluated: false,
      matched: false,
      matchedRowCount: 0,
      runtimeStatus: "not-case-001"
    });
  }

  if (!request.isSkeletonGateEnabled) {
    return createResult({
      caseId: request.caseId,
      milestoneId: milestoneId ?? CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID,
      evidenceTableFamily:
        getEvidenceTableFamily(milestoneId) ??
        CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
      isGateEnabled: false,
      evaluated: false,
      matched: false,
      matchedRowCount: 0,
      runtimeStatus: "gate-disabled"
    });
  }

  if (!milestoneId) {
    return createResult({
      caseId: request.caseId,
      milestoneId: CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID,
      evidenceTableFamily: CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
      isGateEnabled: true,
      evaluated: false,
      matched: false,
      matchedRowCount: 0,
      runtimeStatus: "unsupported-milestone"
    });
  }

  const validateMilestone = validators[milestoneId];

  if (!validateMilestone) {
    return createResult({
      caseId: request.caseId,
      milestoneId,
      evidenceTableFamily:
        getEvidenceTableFamily(milestoneId) ??
        CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY,
      isGateEnabled: true,
      evaluated: false,
      matched: false,
      matchedRowCount: 0,
      runtimeStatus: "unsupported-milestone"
    });
  }

  const validatorResult = validateMilestone(request.queryResult);

  return createResult({
    caseId: request.caseId,
    milestoneId: validatorResult.milestoneId,
    evidenceTableFamily: validatorResult.evidenceTableFamily,
    isGateEnabled: true,
    evaluated: true,
    matched: validatorResult.matched,
    matchedRowCount: validatorResult.matchedRowCount,
    runtimeStatus: "evaluated-no-progression"
  });
}

function createResult({
  caseId,
  milestoneId,
  evidenceTableFamily,
  isGateEnabled,
  evaluated,
  matched,
  matchedRowCount,
  runtimeStatus
}: {
  caseId: string;
  milestoneId: Case001SupportedMilestoneId;
  evidenceTableFamily: Case001SupportedEvidenceTableFamily;
  isGateEnabled: boolean;
  evaluated: boolean;
  matched: boolean;
  matchedRowCount: number;
  runtimeStatus: Case001GatedMilestoneEvaluationStatus;
}): Case001GatedMilestoneEvaluationResult {
  return {
    caseId,
    milestoneId,
    evidenceTableFamily,
    gate: {
      name: CASE_001_SKELETON_GATE_NAME,
      enabledValue: CASE_001_SKELETON_GATE_ENABLED_VALUE,
      isEnabled: isGateEnabled
    },
    evaluated,
    matched,
    matchedRowCount,
    runtimeStatus,
    milestoneAdvanced: false
  };
}

export function isSupportedCase001MilestoneId(
  milestoneId: string
): milestoneId is Case001SupportedMilestoneId {
  return normalizeSupportedMilestoneId(milestoneId) !== null;
}

function normalizeSupportedMilestoneId(
  milestoneId: string
): Case001SupportedMilestoneId | null {
  if (
    milestoneId === CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID ||
    milestoneId === CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID
  ) {
    return milestoneId;
  }

  return null;
}

function getEvidenceTableFamily(
  milestoneId: Case001SupportedMilestoneId | null
): Case001SupportedEvidenceTableFamily | null {
  if (milestoneId === CASE_001_CLOCKTOWER_REPORT_MILESTONE_ID) {
    return CASE_001_CLOCKTOWER_EVIDENCE_TABLE_FAMILY;
  }
  if (milestoneId === CASE_001_CLOCKTOWER_INTERVIEWS_MILESTONE_ID) {
    return CASE_001_CLOCKTOWER_INTERVIEWS_EVIDENCE_TABLE_FAMILY;
  }

  return null;
}
