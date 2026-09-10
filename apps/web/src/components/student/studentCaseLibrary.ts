import breakthroughScene from "../../assets/scenes/scene-breakthrough.png";
import crimeLedgerScene from "../../assets/scenes/scene-crime-ledger.png";
import murderBoardScene from "../../assets/scenes/scene-murder-board.png";
import recordsVaultScene from "../../assets/scenes/scene-records-vault.png";
import studentAgencyScene from "../../assets/scenes/scene-samuel-handoff-student-agency.png";
import queryTrailScene from "../../assets/scenes/scene-samuel-query-trail-nudge.png";
import rainyWindowScene from "../../assets/scenes/scene-samuel-rainy-window-reflection.png";
import { CASE_004_BRIEF } from "../../studentCase";

export type StudentCaseLibraryEntry = {
  id: string;
  caseNumber: string;
  caseName: string;
  eraNote: string;
  statusLabel: string;
  description: string;
  summary: string;
  detail: string;
  isUnlocked: boolean;
  themeKey:
    | "clocktower"
    | "ledger"
    | "station"
    | "sql-city"
    | "gilded-key"
    | "cinder-lane"
    | "scholar";
  landingEyebrow: string;
  landingTagline: string;
  landingAtmosphere: string;
  landingThreads: string[];
  landingAccessNote: string;
  landingSceneSrc: string;
  landingSceneAlt: string;
  hotspot: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
  hotspotTheme: {
    border: string;
    fill: string;
    glow: string;
    labelBorder: string;
  };
};

export const CASE_LIBRARY_ENTRIES: StudentCaseLibraryEntry[] = [
  {
    id: "case-001",
    caseNumber: "001",
    caseName: "The Clocktower Poisoning",
    eraNote: "Foundations",
    statusLabel: "Open Case",
    description:
      "A civic celebration turns lethal when a public clocktower ceremony ends with a poisoning in full view of the crowd.",
    summary: "A public poisoning case built for early timeline checks and clean clue narrowing.",
    detail: "A two-step Foundations file: locate the public report, then retrieve its linked interviews.",
    isUnlocked: true,
    themeKey: "clocktower",
    landingEyebrow: "Public Spectacle",
    landingTagline: "One public death. Too many witnesses. Not enough clean timing.",
    landingAtmosphere:
      "Brass mechanisms, civic ceremony, and a killing committed where everyone thought they could see everything.",
    landingThreads: [
      "Find the public clocktower incident report with simple SQL filters.",
      "Separate what the crowd saw from what the records can actually prove.",
      "Use the report identifier to retrieve interviews and complete your evidence review."
    ],
    landingAccessNote: "Ready to investigate. Your notes and query drafts are saved on this browser.",
    landingSceneSrc: rainyWindowScene,
    landingSceneAlt: "Rainy window light and a detective desk setting a solemn tone for a public poisoning case.",
    hotspot: { left: "12.9%", top: "20.1%", width: "6.6%", height: "54.6%" },
    hotspotTheme: {
      border: "rgba(148, 130, 78, 0.94)",
      fill: "rgba(71, 107, 86, 0.18)",
      glow: "rgba(86, 130, 104, 0.34)",
      labelBorder: "rgba(169, 154, 98, 0.86)"
    }
  },
  {
    id: "case-002",
    caseNumber: "002",
    caseName: "The Ashcroft Ledger",
    eraNote: "Records Trail",
    statusLabel: "Archive Locked",
    description:
      "A vanished ledger points to bribery, missing payments, and a quiet chain of favors buried inside old financial records.",
    summary: "A paper-trail investigation where record reconciliation matters more than one dramatic clue.",
    detail: "Planned as a follow-on case that asks students to compare entries across multiple sources.",
    isUnlocked: false,
    themeKey: "ledger",
    landingEyebrow: "Financial Shadows",
    landingTagline: "Missing pages. Quiet money. A conspiracy that only survives if the books stay crooked.",
    landingAtmosphere:
      "Dusty record rooms, private accounts, and the kind of corruption that leaves patterns instead of confessions.",
    landingThreads: [
      "Track the missing ledger through overlapping account and identity records.",
      "Notice where the paper trail breaks, doubles back, or vanishes on purpose.",
      "Prove the scheme by reconciling records that were never meant to be compared."
    ],
    landingAccessNote: "This archive volume is not yet open for students.",
    landingSceneSrc: recordsVaultScene,
    landingSceneAlt: "A records vault and paper trail setting for a case about missing ledgers and hidden payments.",
    hotspot: { left: "20.9%", top: "19.5%", width: "6.8%", height: "55.2%" },
    hotspotTheme: {
      border: "rgba(127, 90, 56, 0.94)",
      fill: "rgba(97, 63, 44, 0.2)",
      glow: "rgba(135, 96, 60, 0.34)",
      labelBorder: "rgba(148, 112, 74, 0.88)"
    }
  },
  {
    id: "case-003",
    caseNumber: "003",
    caseName: "Murder at the Blackwell Station",
    eraNote: "Transit Records",
    statusLabel: "Archive Locked",
    description:
      "A killing on a crowded rail platform leaves behind conflicting witness timing and a suspect trail hidden in station traffic.",
    summary: "A station-platform murder with schedule pressure and competing passenger traces.",
    detail: "Reserved for an intermediate case built around elimination logic and movement records.",
    isUnlocked: false,
    themeKey: "station",
    landingEyebrow: "Transit Chaos",
    landingTagline: "A murder in motion, buried inside schedules, arrivals, and the crowd's bad memory.",
    landingAtmosphere:
      "Steam, timetables, platform traffic, and a crime committed where every minute matters.",
    landingThreads: [
      "Use schedule records to narrow who could really be present.",
      "Test witness timing against platform movement instead of trusting first impressions.",
      "Turn transit noise into a clean sequence of provable events."
    ],
    landingAccessNote: "This archive volume is not yet open for students.",
    landingSceneSrc: queryTrailScene,
    landingSceneAlt: "A query-focused detective scene suited to tracking movement through station records.",
    hotspot: { left: "35.8%", top: "19%", width: "5.2%", height: "55.8%" },
    hotspotTheme: {
      border: "rgba(118, 134, 156, 0.94)",
      fill: "rgba(77, 96, 125, 0.18)",
      glow: "rgba(110, 136, 172, 0.34)",
      labelBorder: "rgba(136, 156, 180, 0.88)"
    }
  },
  {
    id: "case-007",
    caseNumber: "007",
    caseName: "The Vanishing Scholar",
    eraNote: "Advanced",
    statusLabel: "Archive Locked",
    description:
      "A noted scholar disappears after a private lecture, leaving fragments of correspondence, travel traces, and academic rivals.",
    summary: "A disappearance case intended for broader joins, weaker handholding, and deeper synthesis.",
    detail: "Held for later progression where the student owns more of the query structure alone.",
    isUnlocked: false,
    themeKey: "scholar",
    landingEyebrow: "Missing Mind",
    landingTagline: "An empty lectern, a vanished expert, and a trail hidden in correspondence and reputation.",
    landingAtmosphere:
      "Scholarly prestige, private letters, and a disappearance that may be staged, coerced, or fatal.",
    landingThreads: [
      "Follow the scholar's last confirmed movements across academic and travel records.",
      "Compare correspondence, rivals, and institutional access without overtrusting status.",
      "Decide whether the absence points to escape, abduction, or a concealed death."
    ],
    landingAccessNote: "This archive volume is not yet open for students.",
    landingSceneSrc: breakthroughScene,
    landingSceneAlt: "A breakthrough-lit detective board setting for a higher-difficulty disappearance case.",
    hotspot: { left: "44.1%", top: "18.1%", width: "4.9%", height: "56.2%" },
    hotspotTheme: {
      border: "rgba(142, 82, 103, 0.94)",
      fill: "rgba(107, 41, 63, 0.2)",
      glow: "rgba(154, 72, 109, 0.34)",
      labelBorder: "rgba(172, 97, 125, 0.88)"
    }
  },
  {
    id: "case-004",
    caseNumber: CASE_004_BRIEF.caseNumber,
    caseName: CASE_004_BRIEF.caseName,
    eraNote: "Guided File",
    statusLabel: "Open",
    description:
      "A murder in SQL City starts with one report and widens into witnesses, a hired killer, and the hidden mastermind behind the contract.",
    summary: "Samuel's guided murder case with staged SQL scaffolding and evidence-board proof.",
    detail: "The current live file that teaches how the Sequel Detective case rhythm works.",
    isUnlocked: true,
    themeKey: "sql-city",
    landingEyebrow: "Open Investigation",
    landingTagline: "One murder report opens a chain that reaches from witnesses to contract killing.",
    landingAtmosphere:
      "Rain-dark streets, pinned records, and a guided descent from one provable row into a much larger criminal design.",
    landingThreads: [
      "Anchor the case in the right crime and report before you touch suspect logic.",
      "Follow witness, gym, and interview trails until the first theory can be tested.",
      "Push past the hired killer and uncover the mastermind who paid for the hit."
    ],
    landingAccessNote: "This file is open now and ready for investigation.",
    landingSceneSrc: murderBoardScene,
    landingSceneAlt: "A murder board scene introducing the live SQL City investigation.",
    hotspot: { left: "53.6%", top: "16.7%", width: "8.8%", height: "58.8%" },
    hotspotTheme: {
      border: "rgba(189, 94, 78, 0.96)",
      fill: "rgba(140, 45, 41, 0.2)",
      glow: "rgba(184, 70, 64, 0.36)",
      labelBorder: "rgba(205, 112, 92, 0.92)"
    }
  },
  {
    id: "case-005",
    caseNumber: "005",
    caseName: "The Gilded Key Conspiracy",
    eraNote: "Conspiracy Thread",
    statusLabel: "Archive Locked",
    description:
      "A stolen ceremonial key exposes a circle of wealth, access, and coordinated lies inside one of the city's oldest institutions.",
    summary: "A wealth-and-access case where no single clue is enough without corroboration.",
    detail: "Planned as a later case with wider candidate narrowing and less direct scaffolding.",
    isUnlocked: false,
    themeKey: "gilded-key",
    landingEyebrow: "Power And Access",
    landingTagline: "A single missing key unlocks a conspiracy among people who thought rank would shield them.",
    landingAtmosphere:
      "Old money, ceremonial authority, and a theft that only matters because of who needed the door opened.",
    landingThreads: [
      "Map access, privilege, and motive before assuming the theft was about property alone.",
      "Use institutional records to test which stories survive contact with privilege.",
      "Prove who benefited when the key disappeared and what it allowed to happen."
    ],
    landingAccessNote: "This archive volume is not yet open for students.",
    landingSceneSrc: studentAgencyScene,
    landingSceneAlt: "A handoff scene suited to a case about access, privilege, and conspiracy.",
    hotspot: { left: "64.9%", top: "18.7%", width: "5.6%", height: "56%" },
    hotspotTheme: {
      border: "rgba(181, 140, 73, 0.95)",
      fill: "rgba(150, 103, 32, 0.18)",
      glow: "rgba(190, 145, 65, 0.34)",
      labelBorder: "rgba(205, 164, 92, 0.9)"
    }
  },
  {
    id: "case-006",
    caseNumber: "006",
    caseName: "The Widow of Cinder Lane",
    eraNote: "Cold Read",
    statusLabel: "Archive Locked",
    description:
      "A respected widow's story unravels under scrutiny as neighborhood rumor, motive, and formal records begin to disagree.",
    summary: "A darker social-profile case that leans on interview content, motive, and corroboration.",
    detail: "Placeholder for a case where persuasive language must be separated from proof.",
    isUnlocked: false,
    themeKey: "cinder-lane",
    landingEyebrow: "Smoke And Silence",
    landingTagline: "A polished story, a grieving widow, and a neighborhood that knows more than it can prove.",
    landingAtmosphere:
      "Ash, gossip, social standing, and a case where performance may matter as much as fact until the records speak.",
    landingThreads: [
      "Test the widow's narrative against neighborhood and official records.",
      "Separate social performance from evidence that can survive scrutiny.",
      "Watch for where motive, sympathy, and proof stop lining up."
    ],
    landingAccessNote: "This archive volume is not yet open for students.",
    landingSceneSrc: crimeLedgerScene,
    landingSceneAlt: "A crime-ledger setting for a somber case built around motive and conflicting narratives.",
    hotspot: { left: "72.4%", top: "18.8%", width: "5.7%", height: "56.2%" },
    hotspotTheme: {
      border: "rgba(108, 116, 132, 0.94)",
      fill: "rgba(57, 63, 75, 0.2)",
      glow: "rgba(93, 104, 126, 0.34)",
      labelBorder: "rgba(126, 136, 156, 0.88)"
    }
  }
];

export function getStudentCaseLibraryEntry(
  caseId: string | null | undefined
): StudentCaseLibraryEntry | null {
  if (!caseId) {
    return null;
  }

  return CASE_LIBRARY_ENTRIES.find((entry) => entry.id === caseId) ?? null;
}
