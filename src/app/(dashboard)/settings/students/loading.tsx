// src/app/(dashboard)/students/loading.tsx
import { Skeleton } from "@/components/shared/Skeleton";

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
      <Skeleton className="h-96" />
    </div>
  );
}
