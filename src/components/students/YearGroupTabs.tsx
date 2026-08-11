"use client";

// src/components/students/YearGroupTabs.tsx
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const YEAR_GROUPS = ["Y7", "Y8", "Y9", "Y10", "Y11"] as const;

export function YearGroupTabs({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeYear = searchParams.get("year") ?? "ALL";

  function setYear(year: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (year === "ALL") params.delete("year");
    else params.set("year", year);
    router.push(`${pathname}?${params.toString()}`);
  }

  const tabs = [{ key: "ALL", label: "All years" }, ...YEAR_GROUPS.map((y) => ({ key: y, label: y.replace("Y", "Year ") }))];

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setYear(tab.key)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-default",
            activeYear === tab.key
              ? "bg-brand text-brand-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {tab.label}
          {counts[tab.key] !== undefined && (
            <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
