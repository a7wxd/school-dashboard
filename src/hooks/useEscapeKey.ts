"use client";

// src/hooks/useEscapeKey.ts
// Closes any dialog/modal on Escape — used across ConfirmDialog and the
// ad-hoc modals (GenerateReportDialog, CreateTeacherDialog, etc.) as part of
// the Stage 12 accessibility pass.

import { useEffect } from "react";

export function useEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}
