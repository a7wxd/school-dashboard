"use client";

// src/components/students/StudentFilters.tsx
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SubjectOption {
  id: string;
  name: string;
}

export function StudentFilters({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => updateParam("q", query), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or Student ID…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm transition-default placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
      </div>

      <select
        defaultValue={searchParams.get("subjectId") ?? ""}
        onChange={(e) => updateParam("subjectId", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-default focus:border-brand focus:outline-none"
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("senStatus") ?? ""}
        onChange={(e) => updateParam("senStatus", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-default focus:border-brand focus:outline-none"
      >
        <option value="">Any SEN status</option>
        <option value="NONE">None</option>
        <option value="SEN_SUPPORT">SEN Support</option>
        <option value="EHCP">EHCP</option>
      </select>

      <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
        <input
          type="checkbox"
          defaultChecked={searchParams.get("causeForConcern") === "true"}
          onChange={(e) => updateParam("causeForConcern", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
        />
        Cause for concern
      </label>
    </div>
  );
}
