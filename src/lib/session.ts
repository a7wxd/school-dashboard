// src/lib/session.ts
// Server-side helpers every API route and server action should use to enforce
// auth + permissions. Client-side hiding (usePermissions hook, Stage 3+) is a UX
// nicety only — THIS file is the real security boundary.

import { auth } from "./auth";
import { prisma } from "./prisma";
import { can, type Permission } from "./permissions";

export class UnauthorizedError extends Error {
  constructor(message = "Not signed in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do this") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Returns the current session's user, or throws UnauthorizedError. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user;
}

/**
 * Returns the current session's user AND asserts they hold the given permission.
 * Also re-checks isActive against the DB, so a deactivated teacher's existing
 * session token can't be used to keep acting after Settings → Users deactivates them.
 */
export async function requirePermission(permission: Permission) {
  const sessionUser = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true, isActive: true, fullName: true },
  });

  if (!dbUser || !dbUser.isActive) {
    throw new ForbiddenError("Your account is not active. Contact your administrator.");
  }

  if (!can(dbUser.role, permission)) {
    throw new ForbiddenError();
  }

  return dbUser;
}

/** Helper for API route handlers to convert the above errors into HTTP responses. */
export function handleAuthError(error: unknown): Response | null {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  return null;
}
