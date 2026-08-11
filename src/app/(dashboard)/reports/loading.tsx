// src/app/(dashboard)/reports/loading.tsx
import { Skeleton } from "@/components/shared/Skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
