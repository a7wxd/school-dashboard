"use client";

// src/components/layout/MobileNav.tsx
// The Sidebar is desktop-only (hidden below md:). Without this, phone/tablet
// users would have no way to navigate at all — this is a functional gap fix,
// not just a visual one. Opens as a full-screen overlay with the same nav
// items, closes on Escape, backdrop click, or selecting a link.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/utils";

export function MobileNav({ schoolName }: { schoolName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEscapeKey(isOpen, () => setIsOpen(false));

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-default hover:bg-muted"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <nav
            role="navigation"
            aria-label="Main"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-xl animate-slide-in"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="truncate font-serif text-sm font-medium text-foreground">{schoolName}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground transition-default hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-default",
                      isActive ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.25 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
