"use client";

// src/components/auth/SignOutButton.tsx
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-default hover:bg-muted"
    >
      Sign out
    </button>
  );
}
