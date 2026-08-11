"use client";

// src/components/layout/GlobalSearch.tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface StudentResult {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  yearGroup: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.students ?? []);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToStudent(id: string) {
    setIsOpen(false);
    setQuery("");
    router.push(`/students/${id}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search students by name or ID…"
          className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-8 text-sm text-foreground transition-default placeholder:text-muted-foreground focus:border-brand focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        {isLoading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg animate-slide-in">
          {results.length === 0 && !isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No students found.</p>
          ) : (
            results.map((student) => (
              <button
                key={student.id}
                onClick={() => goToStudent(student.id)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-default hover:bg-muted"
              >
                <span className="font-medium text-foreground">
                  {student.firstName} {student.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {student.yearGroup.replace("Y", "Year ")} · {student.studentId}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
