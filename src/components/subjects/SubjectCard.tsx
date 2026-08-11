// src/components/subjects/SubjectCard.tsx
import Link from "next/link";
import { Users } from "lucide-react";

export interface SubjectCardData {
  id: string;
  name: string;
  appliesToYearGroups: string[];
  teacherCount: number;
}

export function SubjectCard({ subject }: { subject: SubjectCardData }) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-default hover:border-brand/40 hover:shadow-sm"
    >
      <div>
        <h3 className="font-serif text-base font-medium text-foreground">{subject.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {subject.appliesToYearGroups.map((y) => (
            <span key={y} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {y.replace("Y", "Year ")}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users size={13} />
        {subject.teacherCount} teacher{subject.teacherCount === 1 ? "" : "s"} assigned
      </div>
    </Link>
  );
}
