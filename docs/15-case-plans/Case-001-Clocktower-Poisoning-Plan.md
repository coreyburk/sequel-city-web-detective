# Case 001: The Clocktower Poisoning - Full Authoring Plan

## Purpose And Audience

This is the authoring plan for turning Case 001 into a released playable Sequel Detective case. It is for case authors, implementers, auditors, and reviewers. It is not learner-facing copy and is not runtime authority.

The plan exists to prevent Case 001 from growing through disconnected implementation slices. Future work packages should use this document to decide which data, validators, guidance, persistence, verification, and UI slices belong together.

## Spoiler Classification

Classification: author-only planning document.

Handling rules:

- Public dossier, milestone titles, table-family names, and SQL concepts may be reused in implementation WPs.
- Culprit identity, final-solve rationale, fixture identifiers, exact answer-key values, and red-herring resolution are author-only until a scoped database or verification WP adds them behind existing restricted boundaries.
- This document does not expose solution data at runtime.
- This document does not authorize frontend correctness, localStorage progression, prompt-text progression, runtime AI, restricted-table reads, or answer-key exposure.
- Student-facing copy derived from this plan must avoid naming hidden suspects, exact identifiers, or final solution paths before the learner earns them through SQL evidence.

## Case Identity

| Field | Value |
|---|---|
| Case id | `case-001` |
| Case number | `001` |
| Case name | `The Clocktower Poisoning` |
| Public eyebrow | `Public Spectacle` |
| Track | `Foundations` |
| Release tier target | `Tier 1: Junior Data Analyst` onboarding slice |
| Release status | Archive Locked until a release WP explicitly enables it |
| Existing gate | `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true"` for dev/test skeleton only |
| Existing first milestone | `case-001-clocktower-report-located` |

Public dossier alignment:

- One public death. Too many witnesses. Not enough clean timing.
- A civic celebration turns lethal when a public clocktower ceremony ends with a poisoning in full view of the crowd.
- The case is built for early timeline checks, record-vs-witness comparison, and clean clue narrowing.

## Intended Learner Experience

The learner begins with a public event that appears over-witnessed. The Tier 1/Foundations release slice teaches that public visibility is not the same as database evidence. The learner should move from one public report to the small set of linked interviews and then stop with a clear evidence summary.

The case should feel like an early detective exercise:

- start with a clear public report
- follow one report-to-interview relationship
- identify a small, direct evidence set
- receive deterministic feedback without suspect guessing
- finish the onboarding slice with confidence before higher-complexity cases

Case 001 should not require a mastermind branch. That keeps it aligned with `Foundations` and makes it a useful onboarding case before Case 004.

## Playable End State

Case 001's Tier 1/Foundations release slice is playable when a learner can:

1. Open the released case from the case library.
2. Read the briefing and inspect schema metadata.
3. Use Query Lab to run the two active SQL milestones.
4. Receive deterministic, non-spoiler feedback after each milestone.
5. Log or pin the public report and linked interview evidence.
6. Follow authored Samuel guidance without receiving hidden answer values.
7. Complete the onboarding slice through SQL-result evidence, not suspect submission.
8. Reset/clear only learner-owned Case 001 progress when reset support is later scoped.
9. Replay the slice from a clean state with deterministic results.

Tier 1 completion condition:

- The learner locates the public clocktower incident report and then retrieves the small linked interview set for that report.
- The completion signal is backend-approved SQL result evidence showing the expected public report row and expected linked interview rows.
- Query text, UI state, localStorage, AI output, prompt text, free-text guesses, and final suspect submission are not completion authority.

Deferred expansion note:

- The prior M3-M6 culprit-narrowing path is no longer the active Tier 1/Foundations release path. It is split into later expansion, sequel, or higher-tier planning work.
- The exact culprit person row, final verification answer, and any answer-key values are intentionally not assigned in this plan. They must be assigned only by a future scoped fixture/answer-key WP if the deferred expansion is revived.

## Tier 1 Foundations Compliance

| Axis | Tier 1/Foundations gate | Case 001 release slice |
|---|---|---|
| Story steps | 1 to 2 linear steps | 2 steps: locate the public report, then retrieve linked interviews |
| SQL scope | 1 to 2 tables; `SELECT`, `WHERE`, `ORDER BY`, simple `COUNT` | `CrimeSceneReport` and `InterviewLog`; filtered lookup plus ordered linked rows |
| People/entities | 2 to 3 meaningful people or entities | One public incident plus up to three interview participants as evidence context, not suspects |
| Clues/evidence | 2 to 3 clear evidence items | Public report, linked interview set, and a direct records-vs-crowd observation |
| Interpretation complexity | No ambiguity, no major red herrings, no unresolved contradictions | Direct evidence discovery only; no culprit choice, no major red herrings |

Tier decision: Case 001 remains `Foundations` with a `Tier 1: Junior Data Analyst` release target. The oversized M3-M6 material is split out instead of reclassifying the onboarding case upward.

## Complexity Budget

| Parameter | Limit |
|---|---|
| Track | Foundations |
| Release tier target | Tier 1: Junior Data Analyst |
| Active release-slice SQL milestones | 2 |
| Deferred milestones | M3-M6 split out of the onboarding release path |
| Required table families | 2: `CrimeSceneReport`, `InterviewLog` |
| Optional table families | None for the release slice |
| Query type | Read-only `SELECT` only |
| Required filters | `WHERE` on both active evidence milestones |
| Sorting | `ORDER BY` allowed and expected for linked interviews |
| Joins | Not required for the release slice |
| Golden-path join limit | 0 joins for the active release slice |
| Nested queries | Not required |
| CTEs/window functions | Not required |
| Aggregation | Not required |
| Mutation/temp/stored procedure SQL | Prohibited |
| Restricted tables | Prohibited |
| Major red herrings | Prohibited |
| Final suspects before verification | None in the Tier 1 release slice |

The release slice should be shorter and cleaner than Case 004. It should assess basic evidence retrieval and report-linked interview discovery, not suspect narrowing or advanced relational reasoning.

## SQL Concept Coverage

| Concept | Milestone Coverage | Assessment Target |
|---|---|---|
| Basic projection | M1, M2 | Select useful columns instead of relying on hidden UI hints |
| Single-table filtering | M1, M2 | Use known date, crime, city, and report identifiers |
| Foreign-key following | M2 | Move from the located `CrimeSceneReport` row to linked interviews through `ReportID` |
| Sorting | M2 | Stabilize transcript review order by `PersonID` or `LogID` |

Deferred concepts:

| Concept | Former milestone coverage | Deferred disposition |
|---|---|---|
| Inner joins | M3, M4, M5 | Split out of the Tier 1/Foundations release path |
| Compound predicates | M4, M5 | Split out of the Tier 1/Foundations release path |
| Date/name filtering | M4 | Split out of the Tier 1/Foundations release path |
| Attribute filtering | M5 | Deferred with `DriversLicense` narrowing |
| Evidence confirmation before suspect submission | M6 | Deferred with final opportunity and verification work |

## Full Evidence Path

1. Public report identifies the clocktower poisoning record in `CrimeSceneReport`.
2. Linked `InterviewLog` rows for that report reveal a small, non-spoiler interview set.
3. The learner completes the onboarding slice by recognizing that public crowd claims should be checked against linked records before making suspect claims.

Deferred evidence path:

- `PersonsOfInterest` identity resolution, `EventSchedule`/`EventRegistration` ceremony roster work, `DriversLicense` candidate narrowing, final opportunity transcript evidence, and suspect verification are no longer part of the Tier 1/Foundations release path.
- Those surfaces may become a later expansion, sequel case, or higher-tier package only after a future product decision and scoped WP.

## SQL Milestones

| # | Milestone id | Learner objective | Evidence table family | Expected query shape | SQL concept | Validator expectation | Release-slice status |
|---|---|---|---|---|---|---|---|
| 1 | `case-001-clocktower-report-located` | Locate the public clocktower incident report. | `CrimeSceneReport` | `SELECT CrimeID, ReportDate, ReportCity, ReportDescription FROM CrimeSceneReport WHERE CrimeID = 1080 AND ReportDate = 20230502 AND ReportCity = 'Sequel City';` | Projection plus filtered lookup | Match existing public report row using `CrimeID`, `ReportDate`, `ReportCity`, and non-spoiler description tokens. | Active Tier 1 release slice |
| 2 | `case-001-report-interviews-located` | Find interviews linked to the clocktower report. | `InterviewLog` | `SELECT PersonID, ReportID, LogTranscript FROM InterviewLog WHERE ReportID = <clocktower ReportID> ORDER BY PersonID;` | Foreign-key follow plus sorting | Match the WP-259 public interview bundle tied to the clocktower `ReportID`, including non-spoiler transcript tokens that support evidence review without asking for a culprit. | Active Tier 1 release slice |

Deferred milestones split out of the Tier 1 release slice:

| Former # | Milestone id | Deferred reason |
|---|---|---|
| 3 | `case-001-witness-identities-resolved` | Requires a join into `PersonsOfInterest` and starts identity resolution beyond the two-table Tier 1 slice. |
| 4 | `case-001-ceremony-roster-narrowed` | Requires ceremony event/registration data and multi-table roster narrowing. |
| 5 | `case-001-access-candidate-narrowed` | Requires `DriversLicense` attribute narrowing and candidate/distractor design. |
| 6 | `case-001-final-opportunity-confirmed` | Requires final opportunity transcript, suspect-verification prep, and answer-boundary planning. |

## Completion Contract

Completion criteria:

- The learner must produce backend-approved SQL results that locate the public `CrimeSceneReport` row for Case 001.
- The learner must produce backend-approved SQL results that retrieve the expected linked `InterviewLog` rows for that report.
- The milestone validators must confirm result shape and non-spoiler token expectations without using query text as authority.

Completion signal:

- A deterministic milestone-complete state for `case-001-clocktower-report-located`.
- A deterministic milestone-complete state for `case-001-report-interviews-located`.
- A final onboarding-slice summary that says the learner has completed the Tier 1/Foundations evidence-discovery case slice.

Terminal evidence requirements:

- One exact public report result.
- A small exact interview result set tied to that report.
- No final suspect, answer-key row, free-text explanation, UI-only action, localStorage state, prompt text, AI output, or narrative assertion can complete the slice.

Suspect verification relationship:

- Suspect verification is intentionally deferred. Requiring final culprit submission would exceed the Tier 1/Foundations release-slice scope.
- A future expansion or sequel may add suspect verification through a separate scoped WP with restricted answer-key data and fresh-build seed updates.

## Database Fixture And Data Plan

WP-259 added the first interview/person-linkage evidence bundle when the case was still being planned as a larger path. Under the reduced Tier 1/Foundations release slice, the M2 interview evidence remains useful, while M3 identity-resolution meaning is deferred. Future data WPs should implement coherent Tier 1 release-slice needs rather than isolated one-row polish or M5/M6 expansion work.

### Existing Data And Rebuild Policy

Case 001 data work must use the existing database as relational scaffolding, not as a presumed story source. The current seed data contains many random rows with useful relationships across people, licenses, employment, events, and registrations, but it should not be treated as already containing coherent mystery threads.

The current existing-data inventory is recorded in `docs/15-case-plans/Case-001-Existing-Data-Inventory.md`. Future Case 001 data WPs should consult that inventory before modifying fresh-build seed data.

Future Case 001 data WPs must follow these rules:

- Inventory existing rows first when they are in scope.
- Reuse existing related people, places, events, driver-license, and employment records when they support a fair evidence path.
- Expect to author, replace, or modify `CrimeSceneReport` and `InterviewLog` content because those tables carry the Tier 1 release-slice story thread.
- Document which rows are reused unchanged, modified for story fit, newly inserted, or intentionally avoided.
- Preserve referential integrity and avoid breaking Case 004 data, tests, or answer paths.
- Avoid relying on random coincidental data as mystery logic.
- Prefer the smallest coherent story bundle that supports a milestone group.

Case story/data authoring must update fresh database creation scripts, not migration scripts:

- The authoritative path for authored case data is a fresh build from the current SQL creation/seed/foreign-key scripts.
- Future Case 001 story data WPs should update `database/02-SequelCityCrimesDB - Insert Data.sql` and any related base creation-script expectations needed for a clean rebuild.
- Do not add case-story migrations for Case 001 content.
- Do not use `ALTER`-style evolution packages to patch authored case content forward.
- Existing local databases that do not match the expected authored case data version should be blocked from normal play and rebuilt from the current scripts.
- A future scoped runtime/admin WP should define the explicit mismatch behavior before release: detect the database identity/content version, block normal play when it does not match, warn that rebuild resets local database state, then drop/recreate `SequelCityCrimesDB` from the current scripts only after explicit user action.
- Learner browser progress remains separate and should be reset or ignored when its case/database version no longer matches the rebuilt database.

| Table family | Public evidence needed | Author-only/verification data | Notes |
|---|---|---|---|
| `CrimeSceneReport` | Existing or modified public report row for the clocktower poisoning. | None for M1. | Story-bearing table. Future WPs may modify the base seed report text and must keep validator expectations aligned with the fresh-build script. Record generated `ReportID` expectations through tests rather than hard-coding a fragile identity value. |
| `InterviewLog` | Clocktower report interviews for M2. | None for the Tier 1 release slice. | Story-bearing table. Expect authored or modified transcript rows. Transcript wording must support evidence review without naming a culprit or forcing identity resolution. |
| `PersonsOfInterest` | Deferred from the active release slice. | Future identity-resolution expansion only. | Existing person rows can remain relational context in data, but the Tier 1 path must not require a join into this table. |
| `DriversLicense` | Deferred from the active release slice. | Future candidate/distractor narrowing only. | M5 is split out. Do not implement driver-license narrowing for the onboarding release slice. |
| `EventSchedule` | Deferred from the active release slice. | Future ceremony-roster expansion only. | M4 is split out. Do not require event filtering for the onboarding release slice. |
| `EventRegistration` | Deferred from the active release slice. | Future ceremony-roster expansion only. | M4 is split out. Do not expose a noisy roster in the onboarding release slice. |
| `Employment` | Not planned for the release slice. | Optional future expansion tie-break only. | Do not introduce employment as an onboarding clue. |
| `CaseAnswerKey` | None. | Deferred suspect-verification expansion only. | Must remain restricted and added only by a scoped verification/answer-key WP if future expansion revives culprit verification. |

## Red Herrings And Fairness

The Tier 1/Foundations release slice must not contain major red herrings. The earlier larger-case red-herring plan is superseded for the onboarding release path.

Allowed evidence tension:

- The public crowd perception may be presented as context, but the learner must not be asked to resolve ambiguity or identify a liar.
- Linked interviews may show that public witness confidence is incomplete, but the disqualifying record evidence must be directly visible in the M2 result set.
- Any distractor language must be immediately resolvable by the public report or linked interviews.

Deferred red-herring material:

- Ceremony-program timing, access-window suspicion, candidate/distractor comparison, and final opportunity interpretation are split out of the Tier 1 release slice.
- If revived later, that material must be replanned under the appropriate tier and cannot be smuggled back into the onboarding path.

## Guidance And Samuel Pacing

Samuel guidance for the Tier 1/Foundations release slice should move in two beats:

1. Start with the public report, not the crowd rumor.
2. Use the report identifier to find linked interviews.

Deferred guidance beats:

- Turning PersonIDs into people, comparing the ceremony roster, using driver-license attributes, and confirming final opportunity are not part of the active release slice.
- Those beats may be reused only in a future expansion/sequel plan.

Guidance may reference:

- table names
- column names
- already returned report and interview values from the active M1-M2 slice
- general SQL shape
- the difference between public sightlines and record-backed evidence

Guidance must not reference:

- final culprit name before the learner retrieves it
- answer-key rows
- direct final submit text
- hidden fixture ids not already returned by the learner's SQL
- runtime AI output

## Persistence And Reset Expectations

Case 001 should use the case-id keyed persistence model before release.

Future persistence scope must include:

- Case 001 storage key with a versioned envelope.
- Common learner-owned fields: notebook entries, pinned facts, draft query, current view, visible progress.
- Case-specific fields: Case 001 milestone ids, Case 001 thread ids, Case 001 clue ids, and Case 001 validation payload summaries.
- Locked/future behavior: Case 001 storage must not hydrate unless Case 001 is released or explicitly dev-gated.
- Reset behavior: clear only learner-owned Case 001 browser progress and thread storage.
- Reset must not clear backend query history, database state, case-library metadata, browser history, Case 004 storage, locked/future case data, or unrelated localStorage keys.

Persistence remains presentation convenience. It is not evidence authority and cannot verify the case.

## Suspect Verification And Final Solve

Suspect verification is deferred from the Tier 1/Foundations release slice.

The active release slice should not ask the learner to name a culprit. It completes when deterministic SQL result evidence proves the learner located the public report and linked interviews.

Deferred future flow, if revived:

1. Learner retrieves final candidate opportunity evidence through a future expansion milestone.
2. UI enables or emphasizes suspect submission only after the required evidence is earned.
3. Learner submits the candidate's person/name value.
4. Backend verifies against `case-001` answer data.
5. UI shows a verdict and final case closeout copy.

Future verification package requirements:

- Add `case-001` answer-key data behind existing restricted boundaries.
- Preserve `Solution` and `CaseAnswerKey` spoiler-control rules.
- Do not expose answer-key content through Query Lab, schema docs, milestone metadata, or frontend state.
- Add positive and negative verification tests.
- Include at least one wrong but plausible distractor submission test.

## Automated Validation And Playthrough Expectations

Before release, Case 001 should have:

- Unit tests for the two active deterministic result-pattern validators.
- Route/service tests proving gated and later released metadata transport behavior.
- Negative validator tests for broad/no-match/wrong-row queries.
- Restricted-table tests proving answer-key and solution tables remain blocked.
- Browser tests for default locked behavior.
- Browser tests for released Case 001 entry when the release WP enables it.
- A golden-path playthrough test that runs the two active milestone query shapes against local API/database setup.
- A reset/restore browser test after persistence is implemented.
- Final suspect verification positive/negative tests only if a future expansion/release plan revives suspect submission.

Golden-path validation should assert progression metadata, not brittle raw row rendering, unless the scoped UI package intentionally renders rows.

## Future Work Package Sequence

Future WPs should be larger than one-row polish but still auditable:

1. Case 001 Tier 1 release-slice implementation bundle: finish the M1-M2 data/validator/progression/UI feedback path behind the existing gate, using only `CrimeSceneReport` and `InterviewLog` evidence. Include database seed-script version/change-date updates if seed content changes.
2. Case 001 Tier 1 guidance/evidence-board bundle: add two-beat Samuel pacing and learner-owned clue logging for the public report and linked interviews.
3. Case 001 Tier 1 persistence/reset bundle: add case-id keyed restore and clear-progress behavior for the reduced slice only.
4. Case 001 Tier 1 release-readiness smoke package: run the two-milestone live-stack golden-path playthrough against the expected database state and fix blockers.
5. Case 001 release unlock package: enable released entry only after the Tier 1 release-slice criteria pass.
6. Deferred expansion/sequel planning package: decide whether M3-M6 identity resolution, ceremony roster, `DriversLicense` narrowing, final opportunity transcript, suspect verification, answer-key data, and database rebuild/version enforcement should become a separate higher-tier Case 001 expansion or a new case.

M5/M6 is no longer the next high-ROI implementation bundle for the onboarding release slice. Do not resume M5/M6 implementation until a future WP deliberately scopes the deferred expansion.

## Unresolved Authoring Assumptions

- Exact culprit identity is intentionally unassigned and not needed for the Tier 1/Foundations release slice.
- Exact PersonIDs, LicenseIDs, EventIDs, and deferred ReportID-dependent expansion values should be assigned only by future data WPs if the deferred expansion is revived.
- The plan assumes Case 001 is a Tier 1/Foundations evidence-discovery onboarding case without culprit submission or a mastermind branch. Adding either would require a revised product decision and a new tier assessment.
- The existing schema is sufficient for the planned path. If future review requires a dedicated access-log table, that would be a schema-changing WP and should not be smuggled into an evidence fixture package.
- `Employment` is not part of the release slice.
- The local database rebuild/version enforcement mechanism is intentionally unimplemented in this planning package and belongs only to a future deferred expansion or release-readiness package if required by database content changes.
