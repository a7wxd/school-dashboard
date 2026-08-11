// src/app/(dashboard)/subjects/[subjectId]/[yearGroup]/loading.tsx
import { Skeleton } from "@/components/shared/Skeleton";

export default function RosterLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
