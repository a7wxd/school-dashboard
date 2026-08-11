"use client";

// src/components/students/profile/ProfileTabs.tsx
// Content for every tab is rendered server-side (passed in as `content`) —
// this component only manages which one is visible client-side.

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ProfileTab {
  key: string;
  label: string;
  content: React.ReactNode;
}

export function ProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-default",
              active === tab.key
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{tabs.find((t) => t.key === active)?.content}</div>
    </div>
  );
}
