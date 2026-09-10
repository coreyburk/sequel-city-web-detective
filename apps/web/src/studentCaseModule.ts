import { getStudentCaseLibraryEntry } from "./components/student/studentCaseLibrary";
import type { StudentCaseLibraryEntry } from "./components/student/studentCaseLibrary";
import {
  CASE_001_ENTRY_ID,
  CASE_001_FIRST_SQL_MILESTONE_BOUNDARY,
  CASE_001_SQL_FEEDBACK_SLICES,
  CASE_001_SKELETON_BRIEF,
  CASE_001_SKELETON_RELEASE_GATE,
  CASE_001_SKELETON_STATE_VERSION,
  isCase001PlayableEnabled
} from "./studentCase001";
import {
  CASE_004_BRIEF,
  CASE_004_ENTRY_ID,
  CASE_004_MILESTONES,
  type MilestoneId
} from "./studentCase";
import {
  getStudentCaseStorageKey,
  STUDENT_CASE_STORAGE_KEY
} from "./useStudentCaseState";
import {
  INVESTIGATION_THREAD_COUNT,
  INVESTIGATION_THREADS_STORAGE_KEY
} from "./features/investigationThreads";

export type CaseModuleContractReference = {
  owner: string;
  exportName: string;
  responsibility: string;
};

export type FullPlayableStudentCaseModule = {
  moduleKind: "full";
  caseId: string;
  isPlayable: true;
  libraryEntry: StudentCaseLibraryEntry;
  milestoneIds: readonly string[];
  storage: {
    studentProgressKey: string;
    studentProgressKeyFactory: CaseModuleContractReference;
    persistedStateValidator: CaseModuleContractReference;
    defaultStateFactory: CaseModuleContractReference;
  };
  investigationThreads: {
    storageKey: string;
    seedCount: number;
    seedFactory: CaseModuleContractReference;
    persistedThreadValidator: CaseModuleContractReference;
  };
  guidance: {
    mentorVoice: "Samuel Tupleton";
    authoredContent: CaseModuleContractReference;
    progressionAuthority: string;
  };
};

export type SkeletonPlayableStudentCaseModule = {
  moduleKind: "skeleton";
  caseId: string;
  isPlayable: true;
  libraryEntry: StudentCaseLibraryEntry;
  releaseGate: {
    envName: typeof CASE_001_SKELETON_RELEASE_GATE;
    enabledValue: "true";
    isEnabled: () => boolean;
  };
  skeleton: {
    caseNumber: typeof CASE_001_SKELETON_BRIEF.caseNumber;
    caseName: typeof CASE_001_SKELETON_BRIEF.caseName;
    status: typeof CASE_001_SKELETON_BRIEF.skeletonStatus;
    summary: typeof CASE_001_SKELETON_BRIEF.caseShape;
  };
  skeletonState: {
    version: typeof CASE_001_SKELETON_STATE_VERSION;
    persistence: "component-memory-only";
    stateOwner: CaseModuleContractReference;
    defaultStateFactory: CaseModuleContractReference;
    stateNormalizer: CaseModuleContractReference;
  };
  firstSqlMilestoneBoundary: {
    id: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id;
    title: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.title;
    learnerObjective: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.learnerObjective;
    progressionSource: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.progressionSource;
    initialTableFamily: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.initialTableFamily;
    validationOwner: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.validationOwner;
    invalidProgressionAuthorities: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.invalidProgressionAuthorities;
    releaseGateBehavior: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.releaseGateBehavior;
    runtimeStatus: typeof CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.runtimeStatus;
  };
  sqlFeedbackSlices: typeof CASE_001_SQL_FEEDBACK_SLICES;
};

export type PlayableStudentCaseModule =
  | FullPlayableStudentCaseModule
  | SkeletonPlayableStudentCaseModule;

const case001LibraryEntry = getStudentCaseLibraryEntry(CASE_001_ENTRY_ID);
const case004LibraryEntry = getStudentCaseLibraryEntry(CASE_004_ENTRY_ID);

if (!case001LibraryEntry) {
  throw new Error(`Missing library entry for gated skeleton case ${CASE_001_ENTRY_ID}.`);
}

if (!case004LibraryEntry) {
  throw new Error(`Missing library entry for playable case ${CASE_004_ENTRY_ID}.`);
}

export const CASE_001_PLAYABLE_SKELETON_MODULE: SkeletonPlayableStudentCaseModule = {
  moduleKind: "skeleton",
  caseId: CASE_001_ENTRY_ID,
  isPlayable: true,
  libraryEntry: case001LibraryEntry,
  releaseGate: {
    envName: CASE_001_SKELETON_RELEASE_GATE,
    enabledValue: "true",
    isEnabled: isCase001PlayableEnabled
  },
  skeleton: {
    caseNumber: CASE_001_SKELETON_BRIEF.caseNumber,
    caseName: CASE_001_SKELETON_BRIEF.caseName,
    status: CASE_001_SKELETON_BRIEF.skeletonStatus,
    summary: CASE_001_SKELETON_BRIEF.caseShape
  },
  skeletonState: {
    version: CASE_001_SKELETON_STATE_VERSION,
    persistence: "component-memory-only",
    stateOwner: {
      owner: "apps/web/src/studentCase001.ts",
      exportName: "Case001SkeletonState",
      responsibility:
        "define the non-spoiler component-local state shape for the gated Case 001 skeleton slices"
    },
    defaultStateFactory: {
      owner: "apps/web/src/studentCase001.ts",
      exportName: "createDefaultCase001SkeletonState",
      responsibility:
        "provide the authored default Case 001 skeleton state without reading browser storage"
    },
    stateNormalizer: {
      owner: "apps/web/src/studentCase001.ts",
      exportName: "normalizeCase001SkeletonState",
      responsibility:
        "accept only known gated Case 001 skeleton interaction option ids and fall back to defaults without side effects"
    }
  },
  firstSqlMilestoneBoundary: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY,
  sqlFeedbackSlices: CASE_001_SQL_FEEDBACK_SLICES
};

export const CASE_004_PLAYABLE_MODULE: FullPlayableStudentCaseModule = {
  moduleKind: "full",
  caseId: CASE_004_ENTRY_ID,
  isPlayable: true,
  libraryEntry: case004LibraryEntry,
  milestoneIds: CASE_004_MILESTONES.map((milestone) => milestone.id),
  storage: {
    studentProgressKey: getStudentCaseStorageKey(CASE_004_ENTRY_ID),
    studentProgressKeyFactory: {
      owner: "apps/web/src/useStudentCaseState.ts",
      exportName: "getStudentCaseStorageKey",
      responsibility: "derive the browser localStorage key for learner-owned student progress"
    },
    persistedStateValidator: {
      owner: "apps/web/src/useStudentCaseState.ts",
      exportName: "hydrateStudentCaseState",
      responsibility: "validate persisted progress against the active playable case contract"
    },
    defaultStateFactory: {
      owner: "apps/web/src/useStudentCaseState.ts",
      exportName: "createDefaultStudentCasePersistedState",
      responsibility: "provide authored default frontend progress for a new investigation session"
    }
  },
  investigationThreads: {
    storageKey: INVESTIGATION_THREADS_STORAGE_KEY,
    seedCount: INVESTIGATION_THREAD_COUNT,
    seedFactory: {
      owner: "apps/web/src/features/investigationThreads/case004Threads.ts",
      exportName: "buildCase004InitialThreads",
      responsibility: "provide authored investigation-thread seeds for the playable case"
    },
    persistedThreadValidator: {
      owner: "apps/web/src/features/investigationThreads/useInvestigationThreads.ts",
      exportName: "hydrateThreads",
      responsibility: "merge persisted thread notes and evidence links onto authored thread seeds"
    }
  },
  guidance: {
    mentorVoice: "Samuel Tupleton",
    authoredContent: {
      owner: "apps/web/src/studentCase.ts",
      exportName: "CASE_004_* authored constants",
      responsibility: `provide authored guidance, milestones, and presentation content for ${CASE_004_BRIEF.caseNumber}: ${CASE_004_BRIEF.caseName}`
    },
    progressionAuthority:
      "Frontend display state remains Case 004-specific and learner-driven until a scoped backend progression service exists."
  }
};

export const PLAYABLE_STUDENT_CASE_MODULES = [CASE_004_PLAYABLE_MODULE, CASE_001_PLAYABLE_SKELETON_MODULE] as const;

export function getPlayableStudentCaseModule(
  caseId: string | null | undefined
): PlayableStudentCaseModule | null {
  if (!caseId) {
    return null;
  }

  if (caseId === CASE_001_ENTRY_ID) {
    return isCase001PlayableEnabled() ? CASE_001_PLAYABLE_SKELETON_MODULE : null;
  }

  return PLAYABLE_STUDENT_CASE_MODULES.find((module) => module.caseId === caseId) ?? null;
}

export function isRegisteredPlayableStudentCase(caseId: string | null | undefined): boolean {
  return getPlayableStudentCaseModule(caseId) !== null;
}

export const CASE_004_PLAYABLE_STORAGE_KEY = STUDENT_CASE_STORAGE_KEY;
