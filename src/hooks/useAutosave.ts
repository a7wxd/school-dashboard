"use client";

// src/hooks/useAutosave.ts
// Debounces a save call, but also exposes flush() so callers can save
// immediately on blur — belt-and-braces against losing work if the browser
// is closed right after a change, per the spec's autosave requirement.

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(saveFn: (value: T) => Promise<void>, delay = 800) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  const performSave = useCallback(async (value: T) => {
    setStatus("saving");
    try {
      await saveFnRef.current(value);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, []);

  const trigger = useCallback(
    (value: T) => {
      setStatus("idle");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => performSave(value), delay);
    },
    [performSave, delay]
  );

  const flush = useCallback(
    (value: T) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      performSave(value);
    },
    [performSave]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { status, trigger, flush };
}
