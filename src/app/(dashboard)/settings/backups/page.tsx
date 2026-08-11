// src/app/(dashboard)/settings/backups/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { ShieldCheck } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  RUNNING: "bg-muted text-muted-foreground",
  SUCCESS: "bg-success/10 text-success",
  FAILED: "bg-danger/10 text-danger",
};

export default async function BackupsSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "BACKUP_VIEW")) redirect("/settings/profile");

  const backups = await prisma.backupLog.findMany({ orderBy: { startedAt: "desc" }, take: 50 });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <h2 className="font-serif text-base font-medium text-foreground">How backups work</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily backups are handled automatically at the database level (e.g. your hosting provider's
              point-in-time recovery — Neon and Supabase both offer this out of the box). This page shows visibility
              into any scheduled backup jobs recorded here; it doesn't trigger backups itself. Self-service restore
              from this screen is a future addition — for now, restoring from a backup is done through your database
              provider's dashboard or support.
            </p>
          </div>
        </div>
      </div>

      {backups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No backup jobs have been logged here yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Started</th>
                <th className="px-5 py-3 font-medium">Completed</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Triggered by</th>
                <th className="px-5 py-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-5 py-3.5 text-foreground">{new Date(backup.startedAt).toLocaleString("en-GB")}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {backup.completedAt ? new Date(backup.completedAt).toLocaleString("en-GB") : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[backup.status]}`}>
                      {backup.status.charAt(0) + backup.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{backup.triggeredBy}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {backup.sizeBytes ? `${(backup.sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
