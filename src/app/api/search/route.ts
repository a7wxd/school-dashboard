// src/app/api/search/route.ts
// Powers the topbar global search. Available to both roles — teachers need to
// find students just as much as admins do. Excludes soft-deleted students.

import { prisma } from "@/lib/prisma";
import { requireUser, handleAuthError } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requireUser();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    if (!query || query.length < 2) {
      return Response.json({ students: [] });
    }

    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { studentId: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, studentId: true, firstName: true, lastName: true, yearGroup: true },
      take: 8,
      orderBy: { lastName: "asc" },
    });

    return Response.json({ students });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
