// src/components/subjects/YearGroupGradeLink.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function YearGroupGradeLink({
  subjectId,
  yearGroup,
  studentCount,
}: {
  subjectId: string;
  yearGroup: string;
  studentCount: number;
}) {
  return (
    <Link
      href={`/subjects/${subjectId}/${yearGroup}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-default hover:border-brand/40 hover:bg-muted/30"
    >
      <div>
        <p className="font-medium text-foreground">{yearGroup.replace("Y", "Year ")}</p>
        <p className="text-xs text-muted-foreground">
          {studentCount} student{studentCount === 1 ? "" : "s"} enrolled
        </p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
}
