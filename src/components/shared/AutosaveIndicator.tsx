// src/components/shared/AutosaveIndicator.tsx
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { AutosaveStatus } from "@/hooks/useAutosave";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 size={12} className="animate-spin" /> Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-success">
        <Check size={12} /> Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-danger">
        <AlertCircle size={12} /> Couldn't save
      </span>
    );
  }
  return <span className="text-xs text-transparent">·</span>;
}
