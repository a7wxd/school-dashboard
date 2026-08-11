"use client";

// src/components/shared/ConfirmDialog.tsx
import { useId, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();

  useEscapeKey(isOpen, () => setIsOpen(false));

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{trigger}</span>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl animate-slide-in"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  destructive ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand"
                }`}
              >
                <AlertTriangle size={18} />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground transition-default hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <h2 id={titleId} className="mt-4 font-serif text-lg font-medium text-foreground">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-default hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-default disabled:opacity-60 ${
                  destructive ? "bg-danger hover:opacity-90" : "bg-brand hover:opacity-90"
                }`}
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
