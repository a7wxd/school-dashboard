// src/components/reports/ReportEmailHistory.tsx
export interface EmailLogRow {
  id: string;
  parentName: string;
  parentEmail: string;
  sentByName: string;
  sentAt: Date;
  deliveryStatus: string;
}

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-brand/10 text-brand",
  DELIVERED: "bg-success/10 text-success",
  FAILED: "bg-danger/10 text-danger",
  BOUNCED: "bg-danger/10 text-danger",
};

export function ReportEmailHistory({ logs }: { logs: EmailLogRow[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">Not sent yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Recipient</th>
            <th className="px-4 py-2.5 font-medium">Sent by</th>
            <th className="px-4 py-2.5 font-medium">When</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-2.5">
                <p className="font-medium text-foreground">{log.parentName}</p>
                <p className="text-xs text-muted-foreground">{log.parentEmail}</p>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{log.sentByName}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{new Date(log.sentAt).toLocaleString("en-GB")}</td>
              <td className="px-4 py-2.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[log.deliveryStatus] ?? ""}`}>
                  {log.deliveryStatus.charAt(0) + log.deliveryStatus.slice(1).toLowerCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
