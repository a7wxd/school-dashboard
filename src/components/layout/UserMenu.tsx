"use client";

// src/components/layout/UserMenu.tsx
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export function UserMenu({ fullName, role }: { fullName: string; role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-default hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-foreground">{fullName}</p>
          <p className="text-xs capitalize leading-tight text-muted-foreground">
            {role.toLowerCase()}
          </p>
        </div>
        <ChevronDown size={15} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-border bg-card py-1.5 shadow-lg animate-slide-in">
          <a
            href="/settings/profile"
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground transition-default hover:bg-muted"
          >
            <User size={15} /> My profile
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-danger transition-default hover:bg-danger/5"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
