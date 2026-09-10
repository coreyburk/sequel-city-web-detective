import {
  type PlayableCaseAuthoringDefinition,
  validatePlayableCaseAuthoringDefinition
} from "./caseAuthoring";
import {
  CASE_001_AUTHORING_DEFINITION,
  CASE_001_ENTRY_ID,
  CASE_001_FIRST_SQL_MILESTONE_BOUNDARY,
  CASE_001_SKELETON_BRIEF,
  CASE_001_SKELETON_RELEASE_GATE
} from "./studentCase001";
import { CASE_004_PLAYABLE_MODULE, PLAYABLE_STUDENT_CASE_MODULES } from "./studentCaseModule";

function buildValidDefinition(): PlayableCaseAuthoringDefinition {
  return {
    caseId: "case-001",
    release: {
      status: "gated",
      defaultPlayable: false,
      releaseGate: {
        behavior:
          "Available only when VITE_ENABLE_CASE_001_PLAYABLE_SKELETON is exactly true.",
        envName: "VITE_ENABLE_CASE_001_PLAYABLE_SKELETON",
        enabledValue: "true"
      }
    },
    dossier: {
      caseNumber: "001",
      caseName: "The Clocktower Poisoning",
      track: "Foundations",
      publicStatus: "Archive Locked",
      caseShape: "A public poisoning case built for early timeline checks."
    },
    evidenceRequirements: [
      {
        tableFamily: "CrimeSceneReport",
        source: "database",
        requiredForMilestoneIds: ["case-001-clocktower-report-located"]
      }
    ],
    sqlMilestones: [
      {
        id: "case-001-clocktower-report-located",
        title: "Clocktower Incident Report Located",
        learnerObjective:
          "Use a read-only SQL query to locate the public clocktower incident report.",
        referencedTableFamilies: ["CrimeSceneReport"],
        progressionAuthority: "backend-approved-read-only-sql-results",
        validationOwner: "future-deterministic-backend-result-pattern",
        runtimeStatus: "planned"
      }
    ],
    stateContract: {
      commonStateCategories: ["notebook", "pinned-facts", "query-draft"],
      caseSpecificStateCategories: ["case-001-sql-milestones"]
    },
    persistence: {
      strategy: "case-id-keyed-local-storage",
      version: 1,
      resetSemantics: "Clear only learner-owned progress for this case id."
    },
    investigationThreads: {
      owner: "future Case 001 thread module",
      exportName: "CASE_001_MILESTONES",
      responsibility: "provide authored non-spoiler thread seeds for Case 001"
    },
    guidance: {
      owner: "future Case 001 guidance module",
      exportName: "CASE_001_GUIDANCE",
      responsibility: "provide authored Samuel Tupleton guidance for Case 001"
    },
    spoilerBoundary: {
      publicMetadataContainsSpoilers: false,
      restrictedDataExposed: false,
      answerKeyExposure: "none",
      prohibitedPublicFields: ["culprit", "mastermind", "solutionQuery", "answerKeyRow"]
    }
  };
}

describe("case authoring validation", () => {
  it("accepts a minimal valid first-SQL case definition", () => {
    expect(validatePlayableCaseAuthoringDefinition(buildValidDefinition())).toEqual([]);
  });

  it("rejects incomplete definitions with structured findings", () => {
    const findings = validatePlayableCaseAuthoringDefinition({});

    expect(findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "missing-case-id",
        "missing-public-metadata",
        "missing-release-status",
        "missing-evidence-requirements",
        "missing-sql-milestones",
        "missing-state-contract",
        "missing-persistence-semantics",
        "missing-thread-ownership",
        "missing-guidance-ownership",
        "missing-spoiler-boundary"
      ])
    );
    expect(findings.every((finding) => finding.severity === "error")).toBe(true);
    expect(findings.every((finding) => typeof finding.path === "string")).toBe(true);
  });

  it("rejects invalid SQL progression authorities", () => {
    const invalidAuthorities = [
      "ui-state",
      "skeleton-selections",
      "localStorage",
      "ai",
      "prompt-text",
      "free-text-guesses"
    ];

    for (const authority of invalidAuthorities) {
      const definition = buildValidDefinition();
      definition.sqlMilestones = [
        {
          ...definition.sqlMilestones[0],
          progressionAuthority: authority
        }
      ];

      expect(validatePlayableCaseAuthoringDefinition(definition)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "invalid-progression-authority",
            path: "sqlMilestones[0].progressionAuthority"
          })
        ])
      );
    }
  });

  it("rejects duplicate milestone ids", () => {
    const definition = buildValidDefinition();
    definition.sqlMilestones = [
      definition.sqlMilestones[0],
      {
        ...definition.sqlMilestones[0],
        title: "Duplicate Boundary"
      }
    ];

    expect(validatePlayableCaseAuthoringDefinition(definition)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "duplicate-milestone-id",
          path: "sqlMilestones[1].id"
        })
      ])
    );
  });

  it("rejects milestone table references outside declared evidence requirements", () => {
    const definition = buildValidDefinition();
    definition.sqlMilestones = [
      {
        ...definition.sqlMilestones[0],
        referencedTableFamilies: ["InterviewLog"]
      }
    ];

    expect(validatePlayableCaseAuthoringDefinition(definition)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "undeclared-evidence-table-reference",
          path: "sqlMilestones[0].referencedTableFamilies"
        })
      ])
    );
  });

  it("requires gated or unreleased cases to declare release-gate behavior without release unlock", () => {
    const definition = buildValidDefinition();
    definition.release = {
      status: "gated",
      defaultPlayable: true,
      releaseGate: null
    };

    expect(validatePlayableCaseAuthoringDefinition(definition)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-release-semantics",
          path: "release.defaultPlayable"
        }),
        expect.objectContaining({
          code: "missing-release-gate",
          path: "release.releaseGate"
        })
      ])
    );
  });

  it("validates the Case 001 pre-release authoring definition", () => {
    expect(validatePlayableCaseAuthoringDefinition(CASE_001_AUTHORING_DEFINITION)).toEqual([]);
  });

  it("keeps the Case 001 authoring definition aligned with public dossier and release gates", () => {
    expect(CASE_001_AUTHORING_DEFINITION.caseId).toBe(CASE_001_ENTRY_ID);
    expect(CASE_001_AUTHORING_DEFINITION.release).toEqual({ status: "released", defaultPlayable: true, releaseGate: null });
    expect(CASE_001_AUTHORING_DEFINITION.evidenceRequirements.map(item => item.tableFamily)).toEqual(["CrimeSceneReport", "InterviewLog"]);
    expect(CASE_001_AUTHORING_DEFINITION.sqlMilestones).toHaveLength(2);
    expect(CASE_001_AUTHORING_DEFINITION.sqlMilestones.every(item => item.runtimeStatus === "implemented" && item.progressionAuthority === "backend-approved-read-only-sql-results")).toBe(true);
  });

  it("aligns both implemented milestones with their evidence tables", () => {
    expect(CASE_001_AUTHORING_DEFINITION.evidenceRequirements).toHaveLength(2);
    expect(CASE_001_AUTHORING_DEFINITION.sqlMilestones[0]).toMatchObject({ id: CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.id, runtimeStatus: "implemented" });
    expect(CASE_001_AUTHORING_DEFINITION.sqlMilestones[1]).toMatchObject({ id: "case-001-report-interviews-located", referencedTableFamilies: ["InterviewLog"], runtimeStatus: "implemented" });
  });

  it("declares Case 001 state, persistence, thread, guidance, and spoiler boundaries without runtime implementation", () => {
    expect(CASE_001_AUTHORING_DEFINITION.stateContract.commonStateCategories).toEqual([
      "notebook",
      "pinned-facts",
      "query-draft",
      "visible-progress"
    ]);
    expect(CASE_001_AUTHORING_DEFINITION.stateContract.caseSpecificStateCategories).toEqual([
      "case-001-sql-milestones",
      "case-001-evidence-leads",
      "case-001-thread-ids"
    ]);
    expect(CASE_001_AUTHORING_DEFINITION.persistence).toEqual({
      strategy: "case-id-keyed-local-storage",
      version: 1,
      resetSemantics:
        "Clear only Case 001 learner-owned browser state. Revalidate stored query references through the API before restoring milestone completion."
    });
    expect(CASE_001_AUTHORING_DEFINITION.investigationThreads.exportName).toBe(
      "CASE_001_MILESTONES"
    );
    expect(CASE_001_AUTHORING_DEFINITION.guidance.exportName).toBe("CASE_001_SAMUEL_STEPS");
    expect(CASE_001_AUTHORING_DEFINITION.spoilerBoundary).toEqual({
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
    });
  });
});
