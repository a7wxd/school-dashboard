// src/components/layout/Topbar.tsx
import { GlobalSearch } from "./GlobalSearch";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";

interface TopbarProps {
  fullName: string;
  role: string;
  termLabel: string | null;
  schoolName: string;
}

export function Topbar({ fullName, role, termLabel, schoolName }: TopbarProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <MobileNav schoolName={schoolName} />
      <GlobalSearch />

      <div className="ml-auto flex items-center gap-5">
        <div className="hidden items-center gap-3 text-xs text-muted-foreground lg:flex">
          <span>{today}</span>
          {termLabel && (
            <>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="font-medium text-brand">{termLabel}</span>
            </>
          )}
        </div>
        <UserMenu fullName={fullName} role={role} />
      </div>
    </header>
  );
}
