"use client";

// src/hooks/usePermissions.ts
// Client-side convenience only — the real security boundary is requirePermission()
// in src/lib/session.ts, re-checked on every API route. This hook just lets
// components hide/disable buttons the user isn't allowed to use.

import { useSession } from "next-auth/react";
import { can, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return {
    role,
    can: (permission: Permission) => (role ? can(role, permission) : false),
  };
}
