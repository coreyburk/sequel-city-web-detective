import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCase004InitialThreads, CASE_004_THREAD_SEEDS } from "./case004Threads";
import {
  attachEvidenceToThread,
  detachEvidenceFromThread,
  pruneStaleEvidenceLinks,
  updateThreadNotes,
  updateThreadStatus
} from "./threadState";
import type { InvestigationThread, ThreadStatus } from "./types";

const STORAGE_KEY = "sequel-city.case-004.threads.v1";

// Legacy persisted manual `status` values are accepted by hydration so that
// no notes or evidence links are lost on load. The student-facing panel
// derives status deterministically (see threadVisibility.ts) and never reads
// this field. setThreadStatus is retained on the API surface for developer /
// debug tooling only; calling it does not influence the student-facing flow.
type StoredThreadShape = Partial<InvestigationThread> & {
  id?: unknown;
  status?: unknown;
  learnerNotes?: unknown;
  evidenceLinks?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const VALID_STATUSES: ReadonlySet<ThreadStatus> = new Set<ThreadStatus>([
  "New",
  "Active",
  "Blocked",
  "Resolved"
]);

function readStorage(): InvestigationThread[] | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    return hydrateThreads(parsed as StoredThreadShape[]);
  } catch {
    return null;
  }
}

function hydrateThreads(stored: StoredThreadShape[]): InvestigationThread[] {
  const baseline = buildCase004InitialThreads();
  const storedById = new Map<string, StoredThreadShape>();

  for (const item of stored) {
    if (item && typeof item === "object" && typeof item.id === "string") {
      storedById.set(item.id, item);
    }
  }

  return baseline.map((seedThread) => {
    const stored = storedById.get(seedThread.id);
    if (!stored) {
      return seedThread;
    }

    const status =
      typeof stored.status === "string" && VALID_STATUSES.has(stored.status as ThreadStatus)
        ? (stored.status as ThreadStatus)
        : seedThread.status;

    const learnerNotes =
      typeof stored.learnerNotes === "string" ? stored.learnerNotes : seedThread.learnerNotes;

    const evidenceLinks = Array.isArray(stored.evidenceLinks)
      ? stored.evidenceLinks
          .filter(
            (link): link is { notebookEntryId: string; detail: string; attachedAt: number } =>
              typeof link === "object" &&
              link !== null &&
              typeof (link as Record<string, unknown>).notebookEntryId === "string" &&
              typeof (link as Record<string, unknown>).detail === "string"
          )
          .map((link) => ({
            notebookEntryId: link.notebookEntryId,
            detail: link.detail,
            attachedAt:
              typeof link.attachedAt === "number" && Number.isFinite(link.attachedAt)
                ? link.attachedAt
                : seedThread.createdAt
          }))
      : seedThread.evidenceLinks;

    const createdAt =
      typeof stored.createdAt === "number" && Number.isFinite(stored.createdAt)
        ? stored.createdAt
        : seedThread.createdAt;

    const updatedAt =
      typeof stored.updatedAt === "number" && Number.isFinite(stored.updatedAt)
        ? stored.updatedAt
        : seedThread.updatedAt;

    return {
      ...seedThread,
      status,
      learnerNotes,
      evidenceLinks,
      createdAt,
      updatedAt
    };
  });
}

function writeStorage(threads: InvestigationThread[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Storage quota or unavailable storage — gameplay continues in memory only.
  }
}

function isAuthoredInitialThreadState(threads: InvestigationThread[]): boolean {
  const baseline = buildCase004InitialThreads();
  if (threads.length !== baseline.length) {
    return false;
  }

  return baseline.every((seedThread, index) => {
    const thread = threads[index];
    return (
      thread?.id === seedThread.id &&
      thread.status === seedThread.status &&
      thread.learnerNotes === seedThread.learnerNotes &&
      thread.evidenceLinks.length === 0
    );
  });
}

function removeStorage(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is convenience-only; reset still updates the in-memory thread state.
  }
}

export type InvestigationThreadsApi = {
  threads: InvestigationThread[];
  setThreadStatus: (threadId: string, status: ThreadStatus) => void;
  setThreadNotes: (threadId: string, notes: string) => void;
  attachEvidence: (
    threadId: string,
    link: { notebookEntryId: string; detail: string }
  ) => void;
  detachEvidence: (threadId: string, notebookEntryId: string) => void;
  resetThreads: () => void;
};

export function useInvestigationThreads(
  knownNotebookEntryIds: ReadonlyArray<string>,
  enabled = true
): InvestigationThreadsApi {
  const [threads, setThreads] = useState<InvestigationThread[]>(() => {
    const restored = readStorage();
    return restored ?? buildCase004InitialThreads();
  });

  const persistTimer = useRef<number | null>(null);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    if (isAuthoredInitialThreadState(threads)) {
      removeStorage();
      return;
    }

    if (persistTimer.current !== null) {
      window.clearTimeout(persistTimer.current);
    }

    persistTimer.current = window.setTimeout(() => {
      writeStorage(threads);
      persistTimer.current = null;
    }, 120);

    return () => {
      if (persistTimer.current !== null) {
        window.clearTimeout(persistTimer.current);
        persistTimer.current = null;
      }
    };
  }, [threads, enabled]);

  const knownIdSignature = useMemo(
    () => knownNotebookEntryIds.slice().sort().join("|"),
    [knownNotebookEntryIds]
  );

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      const knownSet = new Set(knownNotebookEntryIds);
      setThreads((current) => pruneStaleEvidenceLinks(current, knownSet));
    }, 0);
    return () => window.clearTimeout(timer);
    // knownIdSignature drives the effect intentionally to avoid array identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownIdSignature, enabled]);

  const setThreadStatus = useCallback((threadId: string, status: ThreadStatus) => {
    setThreads((current) => updateThreadStatus(current, threadId, status));
  }, []);

  const setThreadNotes = useCallback((threadId: string, notes: string) => {
    setThreads((current) => updateThreadNotes(current, threadId, notes));
  }, []);

  const attachEvidence = useCallback(
    (threadId: string, link: { notebookEntryId: string; detail: string }) => {
      setThreads((current) => attachEvidenceToThread(current, threadId, link));
    },
    []
  );

  const detachEvidence = useCallback((threadId: string, notebookEntryId: string) => {
    setThreads((current) => detachEvidenceFromThread(current, threadId, notebookEntryId));
  }, []);

  const resetThreads = useCallback(() => {
    if (!enabled) return;
    if (persistTimer.current !== null && typeof window !== "undefined") {
      window.clearTimeout(persistTimer.current);
      persistTimer.current = null;
    }

    removeStorage();
    skipNextPersist.current = true;
    setThreads(buildCase004InitialThreads());
  }, [enabled]);

  return {
    threads,
    setThreadStatus,
    setThreadNotes,
    attachEvidence,
    detachEvidence,
    resetThreads
  };
}

export const INVESTIGATION_THREADS_STORAGE_KEY = STORAGE_KEY;
export const INVESTIGATION_THREAD_COUNT = CASE_004_THREAD_SEEDS.length;
