"use client";

// src/components/reports/ReportActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send, Download, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface ReportActionsProps {
  reportId: string;
  status: string;
  canApprove: boolean;
  canSend: boolean;
  parentContactCount: number;
}

interface SendResult {
  email: string;
  success: boolean;
  error: string | null;
}

export function ReportActions({ reportId, status, canApprove, canSend, parentContactCount }: ReportActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleApprove() {
    const res = await fetch(`/api/reports/${reportId}/approve`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Couldn't approve this report.");
    }
    router.refresh();
  }

  async function handleSend() {
    const res = await fetch(`/api/reports/${reportId}/send`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error ?? "Couldn't send this report.");
    }
    setSendResults(data.results ?? null);
    router.refresh();
  }

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/pdf`);
      if (!res.ok) throw new Error("Couldn't generate the PDF.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsDownloading(false);
    }
  }

  const succeededCount = sendResults?.filter((r) => r.success).length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-default hover:bg-muted disabled:opacity-60"
        >
          {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          View PDF
        </button>

        {canApprove && status !== "APPROVED" && status !== "SENT" && (
          <ConfirmDialog
            trigger={
              <button className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90">
                <CheckCircle2 size={15} /> Approve
              </button>
            }
            title="Approve this report?"
            description="Once approved, Praise, Causes for Concern, and Targets can no longer be edited here — you'd need to regenerate the report to change them. It will then be ready to send."
            confirmLabel="Approve"
            destructive={false}
            onConfirm={handleApprove}
          />
        )}

        {canSend && status === "APPROVED" && (
          <ConfirmDialog
            trigger={
              <button className="flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition-default hover:opacity-90">
                <Send size={15} /> Send to parents
              </button>
            }
            title="Send this report?"
            description={`This will email the PDF to ${parentContactCount} parent contact${parentContactCount !== 1 ? "s" : ""} on file.`}
            confirmLabel="Send"
            destructive={false}
            onConfirm={handleSend}
          />
        )}

        {status === "SENT" && !sendResults && (
          <span className="text-sm text-success">Sent to {parentContactCount} parent contact{parentContactCount !== 1 ? "s" : ""}</span>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      {sendResults && (
        <div className="mt-3 space-y-1 text-sm">
          <p className={succeededCount === sendResults.length ? "text-success" : "text-amber-600"}>
            Sent to {succeededCount} of {sendResults.length} parent contact{sendResults.length !== 1 ? "s" : ""}.
          </p>
          {sendResults
            .filter((r) => !r.success)
            .map((r) => (
              <p key={r.email} className="text-xs text-danger">
                {r.email}: {r.error}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
