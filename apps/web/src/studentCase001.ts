import type { QueryExecutionCaseMilestoneEvaluationRequest } from "./api/types";
import type { PlayableCaseAuthoringDefinition } from "./caseAuthoring";
import type {
  CaseMilestone,
  SamuelBriefingStep,
  StoryBrief
} from "./studentCase";

export const CASE_001_ENTRY_ID = "case-001";

export const CASE_001_SKELETON_RELEASE_GATE = "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON";

export const CASE_001_SKELETON_BRIEF = {
  caseNumber: "001",
  caseName: "The Clocktower Poisoning",
  landingEyebrow: "Public Spectacle",
  tagline: "One public death. Too many witnesses. Not enough clean timing.",
  description:
    "A civic celebration turns lethal when a public clocktower ceremony ends with a poisoning in full view of the crowd.",
  atmosphere:
    "Brass mechanisms, civic ceremony, and a killing committed where everyone thought they could see everything.",
  caseShape:
    "A public poisoning case built for early timeline checks and clean clue narrowing.",
  skeletonStatus: "Development skeleton"
} as const;

export const CASE_001_BRIEF: StoryBrief = {
  caseNumber: CASE_001_SKELETON_BRIEF.caseNumber,
  caseName: CASE_001_SKELETON_BRIEF.caseName
};

export const CASE_001_KNOWN_CASE_FACTS = [
  "May 2nd, 2023: a civic clocktower ceremony ended with a public poisoning.",
  "The crowd saw the ceremony, but the useful facts still have to come from records.",
  "The first move is to locate the public clocktower incident report.",
  "The report should point toward interviews that can separate witnessed claims from provable timing."
] as const;

export const CASE_001_TIMELINE_SLICE = {
  title: "Ceremony Timeline Check",
  prompt: "Which record-backed timing gap should be inspected first?",
  records: [
    {
      time: "10:00",
      label: "Clocktower bell test",
      detail: "Maintenance log records a normal chime test before the ceremony began."
    },
    {
      time: "10:12",
      label: "Mayor raises the toast",
      detail: "Program notes place the toast in full public view at the east platform."
    },
    {
      time: "10:14",
      label: "Mechanism access logged",
      detail: "A clockroom access mark appears between the public toast and the collapse."
    },
    {
      time: "10:16",
      label: "Collapse reported",
      detail: "Crowd statements agree the victim fell before the final bell sequence ended."
    }
  ],
  options: [
    {
      id: "crowd-size",
      label: "Count how many spectators were in the square.",
      feedback:
        "Crowd size matters later, but it does not explain the record gap between ceremony events."
    },
    {
      id: "toast-to-access",
      label: "Compare the public toast with the clockroom access mark.",
      isCorrect: true,
      feedback:
        "Correct. The useful first gap is where public visibility and the access record stop lining up."
    },
    {
      id: "bell-test",
      label: "Treat the bell test as the first suspicious movement.",
      feedback:
        "The bell test has a clean maintenance record. It is not the first timing gap to inspect."
    },
    {
      id: "collapse-only",
      label: "Start only from the collapse report.",
      feedback:
        "The collapse fixes the endpoint, but the better first check is the gap immediately before it."
    }
  ]
} as const;

export const CASE_001_RECORD_COMPARISON_SLICE = {
  title: "Crowd Claim Check",
  prompt: "Which public claim should be checked against a record before it shapes the timeline?",
  records: [
    {
      source: "Crowd statement",
      claim: "Several witnesses said the clockroom door stayed closed throughout the toast."
    },
    {
      source: "Clockroom access ledger",
      claim: "A routine access mark appears two minutes after the toast began."
    },
    {
      source: "Ceremony program",
      claim: "The bell sequence was scheduled after the toast, not before it."
    }
  ],
  options: [
    {
      id: "door-claim-to-ledger",
      label: "Compare the closed-door claim with the clockroom access ledger.",
      isCorrect: true,
      feedback:
        "Correct. The first record check is where a public claim and an access record disagree."
    },
    {
      id: "program-to-bell-test",
      label: "Treat the ceremony program and bell test as the conflict.",
      feedback:
        "Those records establish order, but they do not challenge what the crowd believed it saw."
    },
    {
      id: "crowd-to-collapse",
      label: "Compare only crowd statements with the collapse report.",
      feedback:
        "The collapse report fixes the endpoint. The cleaner first conflict is the access mark."
    },
    {
      id: "ledger-to-spectator-count",
      label: "Use the ledger to estimate the spectator count.",
      feedback:
        "The ledger is useful for access, not crowd size. Keep the check tied to movement records."
    }
  ]
} as const;

export const CASE_001_CLUE_NARROWING_SLICE = {
  title: "First Clue Focus",
  prompt: "Which early clue type should be pursued before the witness accounts harden?",
  clues: [
    {
      type: "Record-backed movement",
      detail: "Access marks can show where public visibility and private movement diverge."
    },
    {
      type: "Crowd impression",
      detail: "Witnesses agree on the spectacle, but public sightlines can hide timing gaps."
    },
    {
      type: "Ceremony artifact",
      detail: "Public objects matter after the first record-backed movement gap is isolated."
    }
  ],
  options: [
    {
      id: "access-log-sequence",
      label: "Prioritize the access-log sequence around the toast.",
      isCorrect: true,
      feedback:
        "Correct. Start with the clue type that can narrow movement before public memory settles."
    },
    {
      id: "widest-rumor",
      label: "Start with the rumor repeated by the largest group.",
      feedback:
        "A repeated rumor can be loud without being precise. Narrow the records before the crowd story hardens."
    },
    {
      id: "final-collapse",
      label: "Focus only on the final collapse description.",
      feedback:
        "The collapse anchors the end point, but it does not narrow the earlier opportunity window."
    },
    {
      id: "ceremony-decor",
      label: "Catalog the ceremony decorations first.",
      feedback:
        "Objects may matter later. The cleaner first clue type is the access sequence."
    }
  ]
} as const;

export const CASE_001_FIRST_SQL_MILESTONE_BOUNDARY = {
  id: "case-001-clocktower-report-located",
  title: "Clocktower Incident Report Located",
  learnerObjective:
    "Use a read-only SQL query to locate the public clocktower incident report before following witness or access records.",
  progressionSource: "backend-approved-read-only-sql-results",
  initialTableFamily: ["CrimeSceneReport"],
  validationOwner: "future-deterministic-backend-result-pattern",
  invalidProgressionAuthorities: [
    "ui-state",
    "skeleton-selections",
    "localStorage",
    "ai",
    "free-text-guesses"
  ],
  releaseGateBehavior:
    "Declared for the gated Case 001 skeleton only; it does not make Case 001 a released playable case.",
  runtimeStatus: "boundary-only-not-implemented"
} as const;

export const CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY = {
  id: "case-001-report-interviews-located",
  title: "Clocktower Report Interviews Located",
  learnerObjective:
    "Use the public report trail to find interviews linked to the clocktower incident report.",
  progressionSource: "backend-approved-read-only-sql-results",
  initialTableFamily: ["InterviewLog"],
  validationOwner: "deterministic-backend-result-pattern",
  invalidProgressionAuthorities: [
    "ui-state",
    "skeleton-selections",
    "localStorage",
    "ai",
    "free-text-guesses"
  ],
  releaseGateBehavior:
    "Declared for the gated Case 001 skeleton only; it does not make Case 001 a released playable case.",
  runtimeStatus: "gated-non-progressing"
} as const;

export const CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY = {
  id: "case-001-witness-identities-resolved",
  title: "Witness Identities Resolved",
  learnerObjective:
    "Join report-linked interview records to people records without treating witness identities as a final suspect answer.",
  progressionSource: "backend-approved-read-only-sql-results",
  initialTableFamily: ["PersonsOfInterest"],
  validationOwner: "deterministic-backend-result-pattern",
  invalidProgressionAuthorities: [
    "ui-state",
    "skeleton-selections",
    "localStorage",
    "ai",
    "free-text-guesses"
  ],
  releaseGateBehavior:
    "Declared for the gated Case 001 skeleton only; it does not make Case 001 a released playable case.",
  runtimeStatus: "gated-non-progressing"
} as const;

export const CASE_001_SQL_MILESTONE_BOUNDARIES = [
  CASE_001_FIRST_SQL_MILESTONE_BOUNDARY,
  CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY,
  CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY
] as const;

export type Case001SqlMilestoneBoundary =
  (typeof CASE_001_SQL_MILESTONE_BOUNDARIES)[number];

export type Case001SqlMilestoneId = Case001SqlMilestoneBoundary["id"];

export type Case001SqlFeedbackSlice = {
  milestoneId: Case001SqlMilestoneId;
  title: string;
  prompt: string;
  inputLabel: string;
  starterSql: string;
  submitLabel: string;
  emptyQueryMessage: string;
  loadingMessage: string;
  matchedMessage: string;
  noMatchMessage: string;
  missingMetadataMessage: string;
  nonProgressingMessage: string;
};

export const CASE_001_FIRST_SQL_FEEDBACK_SLICE: Case001SqlFeedbackSlice = {
  milestoneId: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id,
  title: "First SQL Evidence Check",
  prompt:
    "Inspect CrimeSceneReport first. Look for the public clocktower poisoning report, then use that row to decide which filters are justified.",
  inputLabel: "Report query",
  starterSql: "SELECT * FROM CrimeSceneReport;",
  submitLabel: "Check Report Query",
  emptyQueryMessage: "Enter a read-only SQL query before checking the report record.",
  loadingMessage: "Checking the query against the gated Case 001 milestone boundary.",
  matchedMessage:
    "Public report located. The backend recognized the clocktower incident report, but no case progress was saved or advanced.",
  noMatchMessage:
    "No milestone match yet. Narrow the query toward the public CrimeSceneReport row for the clocktower incident.",
  missingMetadataMessage:
    "The query ran, but no gated Case 001 milestone metadata was returned.",
  nonProgressingMessage:
    "This skeleton feedback does not unlock the archive, persist progress, log evidence, or verify suspects."
} as const;

export const CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE: Case001SqlFeedbackSlice = {
  milestoneId: CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id,
  title: "Report Interview Check",
  prompt:
    "Use the located report row to inspect InterviewLog. Start broad, then use ReportID from Query Results or Pinned Facts when you are ready to narrow.",
  inputLabel: "Interview query",
  starterSql:
    "SELECT * FROM InterviewLog;",
  submitLabel: "Check Interview Query",
  emptyQueryMessage: "Enter a read-only SQL query before checking report interviews.",
  loadingMessage: "Checking the query against the gated Case 001 interview boundary.",
  matchedMessage:
    "Report-linked interviews located. The backend recognized the clocktower interview trail, but no case progress was saved or advanced.",
  noMatchMessage:
    "No interview milestone match yet. Keep the query tied to InterviewLog rows for the public clocktower report and use the proved ReportID when you narrow.",
  missingMetadataMessage:
    "The query ran, but no gated Case 001 interview metadata was returned.",
  nonProgressingMessage:
    "This skeleton feedback does not render transcripts, log clues, persist progress, or advance Case 001."
} as const;

export const CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE: Case001SqlFeedbackSlice = {
  milestoneId: CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id,
  title: "Witness Identity Check",
  prompt:
    "Use the interview PersonID values you observed to inspect PersonsOfInterest. Use Pinned Facts and query-assist tokens for exact values before writing the relationship query.",
  inputLabel: "Identity query",
  starterSql:
    "SELECT * FROM PersonsOfInterest;",
  submitLabel: "Check Identity Query",
  emptyQueryMessage: "Enter a read-only SQL query before checking witness identities.",
  loadingMessage: "Checking the query against the gated Case 001 witness boundary.",
  matchedMessage:
    "Witness identities resolved. The backend recognized the report-linked people lookup, but no case progress was saved or advanced.",
  noMatchMessage:
    "No witness-identity milestone match yet. Keep the query tied to report-linked InterviewLog PersonIDs and PersonsOfInterest.",
  missingMetadataMessage:
    "The query ran, but no gated Case 001 witness metadata was returned.",
  nonProgressingMessage:
    "This skeleton feedback does not render names, log clues, persist progress, or verify a suspect."
} as const;

export const CASE_001_SQL_FEEDBACK_SLICES = [
  CASE_001_FIRST_SQL_FEEDBACK_SLICE,
  CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE,
  CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE
] as const;

export const CASE_001_MILESTONES: CaseMilestone[] = [
  {
    id: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id,
    title: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.title,
    cluePrompt:
      "Locate the public clocktower incident report before following witness records.",
    matches: (sql) => sql.includes("crimescenereport")
  },
  {
    id: CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id,
    title: CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.title,
    cluePrompt:
      "Follow the clocktower report into InterviewLog and inspect the public witness bundle.",
    matches: (sql) => sql.includes("interviewlog")
  },
  {
    id: CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id,
    title: CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.title,
    cluePrompt:
      "Join report-linked interviews to PersonsOfInterest so the witness/access identities are named.",
    matches: (sql) => sql.includes("interviewlog") && sql.includes("personsofinterest")
  }
];

export const CASE_001_SAMUEL_STEPS: SamuelBriefingStep[] = [
  {
    id: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id,
    label: "Step 1",
    title: "Inspect CrimeSceneReport.",
    guidance:
      "Start by opening CrimeSceneReport. Find the public clocktower poisoning report before you chase interviews or access records.",
    observationPrompt:
      "The report row gives you the date, city, and incident wording you can safely use as filters.",
    nextStep:
      "Run a broad CrimeSceneReport query, inspect the rows, and narrow only after the clocktower report is visible.",
    successSignal:
      "One public clocktower report row is visible in Query Results.",
    queryDraft: CASE_001_FIRST_SQL_FEEDBACK_SLICE.starterSql
  },
  {
    id: CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id,
    label: "Step 2",
    title: "Follow the report into interviews.",
    guidance:
      "Use the located report row to find InterviewLog rows tied to the same public incident. Let ReportID come from Query Results, Pinned Facts, or query-assist tokens before you narrow.",
    observationPrompt:
      "The interviews should keep the investigation tied to the report instead of the crowd's broad rumor. Check ReportID before reading transcripts as evidence.",
    nextStep:
      "Inspect InterviewLog, then narrow with the proved ReportID from the clocktower report row.",
    successSignal:
      "The report-linked interview rows are visible in Query Results.",
    queryDraft: CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE.starterSql
  },
  {
    id: CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id,
    label: "Step 3",
    title: "Resolve the interview identities.",
    guidance:
      "Turn report-linked interview PersonIDs into names before drawing conclusions about access or opportunity. Use PersonsOfInterest and the PersonID values you actually observed.",
    observationPrompt:
      "A named witness/access list is easier to test than disconnected transcript fragments. Keep the InterviewLog-to-PersonsOfInterest relationship explicit.",
    nextStep:
      "Inspect PersonsOfInterest, then relate it back to the InterviewLog PersonIDs tied to the report.",
    successSignal:
      "The report-linked names are visible in Query Results.",
    queryDraft: CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE.starterSql
  }
];

function normalizeSql(sql: string): string {
  return sql.toLowerCase().replace(/\s+/g, " ").trim();
}

export function buildCase001MilestoneEvaluationRequest(
  sql: string
): QueryExecutionCaseMilestoneEvaluationRequest | undefined {
  if (!isCase001PlayableSkeletonEnabled()) {
    return undefined;
  }

  const normalizedSql = normalizeSql(sql);
  let milestoneId: Case001SqlMilestoneId | null = null;

  if (normalizedSql.includes("personsofinterest") && normalizedSql.includes("interviewlog")) {
    milestoneId = CASE_001_WITNESS_IDENTITIES_MILESTONE_BOUNDARY.id;
  } else if (normalizedSql.includes("interviewlog")) {
    milestoneId = CASE_001_REPORT_INTERVIEWS_MILESTONE_BOUNDARY.id;
  } else if (normalizedSql.includes("crimescenereport")) {
    milestoneId = CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id;
  }

  return milestoneId
    ? {
        caseId: CASE_001_ENTRY_ID,
        milestoneId,
        isSkeletonGateEnabled: true
      }
    : undefined;
}

export const CASE_001_AUTHORING_DEFINITION: PlayableCaseAuthoringDefinition = {
  caseId: CASE_001_ENTRY_ID,
  release: {
    status: "gated",
    defaultPlayable: false,
    releaseGate: {
      behavior:
        "Case 001 remains pre-release and may render only the development skeleton when the explicit skeleton gate is enabled.",
      envName: CASE_001_SKELETON_RELEASE_GATE,
      enabledValue: "true"
    }
  },
  dossier: {
    caseNumber: CASE_001_SKELETON_BRIEF.caseNumber,
    caseName: CASE_001_SKELETON_BRIEF.caseName,
    track: "Foundations",
    publicStatus: "Archive Locked",
    caseShape: CASE_001_SKELETON_BRIEF.caseShape
  },
  evidenceRequirements: [
    {
      tableFamily: "CrimeSceneReport",
      source: "database",
      requiredForMilestoneIds: [CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id]
    }
  ],
  sqlMilestones: [
    {
      id: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id,
      title: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.title,
      learnerObjective: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.learnerObjective,
      referencedTableFamilies: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.initialTableFamily,
      progressionAuthority: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.progressionSource,
      validationOwner: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.validationOwner,
      runtimeStatus: "planned"
    }
  ],
  stateContract: {
    commonStateCategories: ["notebook", "pinned-facts", "query-draft", "visible-progress"],
    caseSpecificStateCategories: [
      "case-001-sql-milestones",
      "case-001-evidence-leads",
      "case-001-thread-ids"
    ]
  },
  persistence: {
    strategy: "none",
    version: null,
    resetSemantics:
      "Case 001 has no runtime progress persistence or clear-progress control in this package."
  },
  investigationThreads: {
    owner: "future Case 001 investigation-thread module",
    exportName: "buildCase001InitialThreads",
    responsibility:
      "provide authored non-spoiler investigation-thread seeds only after Case 001 receives runtime thread scope"
  },
  guidance: {
    owner: "future Case 001 guidance module",
    exportName: "CASE_001_GUIDANCE",
    responsibility:
      "provide authored Samuel Tupleton guidance only after Case 001 receives runtime guidance scope"
  },
  spoilerBoundary: {
    publicMetadataContainsSpoilers: false,
    restrictedDataExposed: false,
    answerKeyExposure: "none",
    prohibitedPublicFields: [
      "culprit",
      "mastermind",
      "suspectVerificationAnswer",
      "solutionQuery",
      "answerKeyRow",
      "restrictedTableContent"
    ]
  }
};

export type Case001TimelineOptionId = (typeof CASE_001_TIMELINE_SLICE.options)[number]["id"];
export type Case001RecordComparisonOptionId =
  (typeof CASE_001_RECORD_COMPARISON_SLICE.options)[number]["id"];
export type Case001ClueNarrowingOptionId =
  (typeof CASE_001_CLUE_NARROWING_SLICE.options)[number]["id"];

export const CASE_001_SKELETON_STATE_VERSION = 3;

export type Case001SkeletonState = {
  version: typeof CASE_001_SKELETON_STATE_VERSION;
  selectedTimelineOptionId: Case001TimelineOptionId | null;
  selectedRecordComparisonOptionId: Case001RecordComparisonOptionId | null;
  selectedClueNarrowingOptionId: Case001ClueNarrowingOptionId | null;
};

export const CASE_001_SKELETON_CHECKPOINT_COMPLETE_MESSAGE =
  "Checkpoint captured: compare timing, test public claims against records, and keep record-backed movement in view before forming a theory.";

export type Case001SkeletonCheckpointItem = {
  id: "timeline" | "record-comparison" | "clue-narrowing";
  label: string;
  selectedLabel: string | null;
};

export type Case001SkeletonCheckpoint = {
  items: Case001SkeletonCheckpointItem[];
  isComplete: boolean;
  completeMessage: typeof CASE_001_SKELETON_CHECKPOINT_COMPLETE_MESSAGE;
};

export function createDefaultCase001SkeletonState(): Case001SkeletonState {
  return {
    version: CASE_001_SKELETON_STATE_VERSION,
    selectedTimelineOptionId: null,
    selectedRecordComparisonOptionId: null,
    selectedClueNarrowingOptionId: null
  };
}

export function buildCase001SkeletonCheckpoint(
  state: Case001SkeletonState
): Case001SkeletonCheckpoint {
  const selectedTimelineOption =
    CASE_001_TIMELINE_SLICE.options.find(
      (option) => option.id === state.selectedTimelineOptionId
    ) ?? null;
  const selectedRecordComparisonOption =
    CASE_001_RECORD_COMPARISON_SLICE.options.find(
      (option) => option.id === state.selectedRecordComparisonOptionId
    ) ?? null;
  const selectedClueNarrowingOption =
    CASE_001_CLUE_NARROWING_SLICE.options.find(
      (option) => option.id === state.selectedClueNarrowingOptionId
    ) ?? null;

  const items: Case001SkeletonCheckpointItem[] = [
    {
      id: "timeline",
      label: CASE_001_TIMELINE_SLICE.title,
      selectedLabel: selectedTimelineOption?.label ?? null
    },
    {
      id: "record-comparison",
      label: CASE_001_RECORD_COMPARISON_SLICE.title,
      selectedLabel: selectedRecordComparisonOption?.label ?? null
    },
    {
      id: "clue-narrowing",
      label: CASE_001_CLUE_NARROWING_SLICE.title,
      selectedLabel: selectedClueNarrowingOption?.label ?? null
    }
  ];

  return {
    items,
    isComplete: items.every((item) => item.selectedLabel !== null),
    completeMessage: CASE_001_SKELETON_CHECKPOINT_COMPLETE_MESSAGE
  };
}

function isCase001TimelineOptionId(value: unknown): value is Case001TimelineOptionId {
  return (
    typeof value === "string" &&
    CASE_001_TIMELINE_SLICE.options.some((option) => option.id === value)
  );
}

function isCase001RecordComparisonOptionId(
  value: unknown
): value is Case001RecordComparisonOptionId {
  return (
    typeof value === "string" &&
    CASE_001_RECORD_COMPARISON_SLICE.options.some((option) => option.id === value)
  );
}

function isCase001ClueNarrowingOptionId(value: unknown): value is Case001ClueNarrowingOptionId {
  return (
    typeof value === "string" &&
    CASE_001_CLUE_NARROWING_SLICE.options.some((option) => option.id === value)
  );
}

export function normalizeCase001SkeletonState(value: unknown): Case001SkeletonState {
  const defaultState = createDefaultCase001SkeletonState();

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultState;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.version !== CASE_001_SKELETON_STATE_VERSION) {
    return defaultState;
  }

  if (
    candidate.selectedTimelineOptionId !== null &&
    candidate.selectedTimelineOptionId !== undefined &&
    !isCase001TimelineOptionId(candidate.selectedTimelineOptionId)
  ) {
    return defaultState;
  }

  if (
    candidate.selectedRecordComparisonOptionId !== null &&
    candidate.selectedRecordComparisonOptionId !== undefined &&
    !isCase001RecordComparisonOptionId(candidate.selectedRecordComparisonOptionId)
  ) {
    return defaultState;
  }

  if (
    candidate.selectedClueNarrowingOptionId !== null &&
    candidate.selectedClueNarrowingOptionId !== undefined &&
    !isCase001ClueNarrowingOptionId(candidate.selectedClueNarrowingOptionId)
  ) {
    return defaultState;
  }

  return {
    version: CASE_001_SKELETON_STATE_VERSION,
    selectedTimelineOptionId: isCase001TimelineOptionId(candidate.selectedTimelineOptionId)
      ? candidate.selectedTimelineOptionId
      : null,
    selectedRecordComparisonOptionId: isCase001RecordComparisonOptionId(
      candidate.selectedRecordComparisonOptionId
    )
      ? candidate.selectedRecordComparisonOptionId
      : null,
    selectedClueNarrowingOptionId: isCase001ClueNarrowingOptionId(
      candidate.selectedClueNarrowingOptionId
    )
      ? candidate.selectedClueNarrowingOptionId
      : null
  };
}

export function isCase001PlayableSkeletonEnabled(): boolean {
  return import.meta.env?.VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true";
}
