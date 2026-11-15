"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { journalKey, type DataSourceMode } from "../data/source-context";

const journalSchema = z.object({
  observationDraft: z
    .object({ text: z.string().max(2000), evaluationId: z.string() })
    .nullable()
    .optional(),
  completed: z.record(z.string(), z.boolean()).default({}),
  difficulty: z.string().max(2000).default(""),
  question: z.string().max(2000).default(""),
  observation: z
    .object({
      text: z.string().max(2000),
      evaluationId: z.string(),
      recordedAt: z.iso.datetime(),
    })
    .nullable()
    .default(null),
  prepared: z
    .object({
      text: z.string(),
      savedAt: z.iso.datetime(),
      scope: z.string().optional(),
    })
    .nullable()
    .default(null),
});
export type DemoJournal = z.infer<typeof journalSchema>;
const emptyJournal: DemoJournal = {
  completed: {},
  difficulty: "",
  question: "",
  prepared: null,
  observation: null,
};
const eventName = "orbita-journal-change";

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useDemoJournal(
  astronautId: string,
  mode: DataSourceMode = "mock",
) {
  const key = journalKey(astronautId, mode);
  const [memory, setMemory] = useState<string | null>(null);
  const read = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const stored = useSyncExternalStore(subscribe, read, () => null);
  let journal = emptyJournal;
  try {
    const result = journalSchema.safeParse(
      JSON.parse(memory ?? stored ?? "null"),
    );
    if (result.success) journal = result.data;
  } catch {
    /* Un borrador dañado no bloquea la demostración. */
  }

  const update = (patch: Partial<DemoJournal>) => {
    const value = JSON.stringify({ ...journal, ...patch });
    try {
      localStorage.setItem(key, value);
      window.dispatchEvent(new Event(eventName));
    } catch {
      setMemory(value);
    }
  };
  return { journal, update, memoryOnly: memory !== null };
}
