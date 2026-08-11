// src/components/students/profile/ProfileHeader.tsx
import { AlertCircle } from "lucide-react";
import { DeleteStudentButton } from "@/components/students/DeleteStudentButton";

interface ProfileHeaderProps {
  studentId: string;
  dbId: string;
  fullName: string;
  yearGroup: string;
  senStatus: string;
  causeForConcern: boolean;
  canDelete: boolean;
}

const SEN_LABELS: Record<string, string> = {
  NONE: "No SEN needs recorded",
  SEN_SUPPORT: "SEN Support",
  EHCP: "EHCP",
};

export function ProfileHeader({
  studentId,
  dbId,
  fullName,
  yearGroup,
  senStatus,
  causeForConcern,
  canDelete,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-serif text-2xl font-medium text-foreground">{fullName}</h1>
          {causeForConcern && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
              <AlertCircle size={12} /> Cause for concern
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {studentId} · {yearGroup.replace("Y", "Year ")} · {SEN_LABELS[senStatus] ?? senStatus}
        </p>
      </div>
      {canDelete && <DeleteStudentButton studentId={dbId} studentName={fullName} />}
    </div>
  );
}
